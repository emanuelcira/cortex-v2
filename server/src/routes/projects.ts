import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function getTimezoneOffset(tz: string): number {
  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const local = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    return (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
}

// Create project
router.post("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const {
    name, project_type, stage, roles_needed, skills_needed,
    hours_per_week, duration, goal, location,
  } = req.body;

  if (!name || !project_type || !stage || !roles_needed?.length ||
    !hours_per_week || !duration || !goal || !location) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const result = await pool.query(`
    INSERT INTO projects (owner_id, name, project_type, stage, roles_needed, skills_needed, hours_per_week, duration, goal, location)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `, [
    userId, name, project_type, stage,
    JSON.stringify(roles_needed), JSON.stringify(skills_needed || []),
    hours_per_week, duration, goal, location,
  ]);

  res.status(201).json({ id: result.rows[0].id });
});

// List projects (optionally filter by owner)
router.get("/", requireAuth, async (req, res) => {
  const { mine } = req.query;
  let result;

  if (mine === "true") {
    result = await pool.query(
      "SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.owner_id = $1 ORDER BY p.created_at DESC",
      [req.session.userId]
    );
  } else {
    result = await pool.query(
      "SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.status = 'open' ORDER BY p.created_at DESC"
    );
  }

  const projects = result.rows;
  for (const p of projects) {
    p.roles_needed = JSON.parse(p.roles_needed);
    p.skills_needed = JSON.parse(p.skills_needed);
  }

  res.json(projects);
});

// Get single project
router.get("/:id", requireAuth, async (req, res) => {
  const projectResult = await pool.query(
    "SELECT p.*, u.name as owner_name, u.timezone as owner_timezone FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = $1",
    [req.params.id]
  );
  const project = projectResult.rows[0];

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  project.roles_needed = JSON.parse(project.roles_needed);
  project.skills_needed = JSON.parse(project.skills_needed);

  // Get collaborators
  const collabResult = await pool.query(`
    SELECT c.*, u.name, u.role, u.skills FROM collaborations c
    JOIN users u ON c.user_id = u.id WHERE c.project_id = $1
  `, [project.id]);
  const collaborators = collabResult.rows;
  for (const c of collaborators) c.skills = JSON.parse(c.skills);
  project.collaborators = collaborators;

  res.json(project);
});

// Update project (status-only or full detail edit)
router.put("/:id", requireAuth, async (req, res) => {
  const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
  const project = projectResult.rows[0];
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  if (project.owner_id !== req.session.userId) {
    res.status(403).json({ error: "Not the project owner" });
    return;
  }

  const { status, name, project_type, stage, roles_needed, skills_needed, hours_per_week, duration, goal, location } = req.body;

  // Status-only update
  if (status !== undefined && Object.keys(req.body).length === 1) {
    if (!["open", "active", "completed", "dropped"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    await pool.query("UPDATE projects SET status = $1 WHERE id = $2", [status, req.params.id]);
    if (status === "completed" || status === "dropped") {
      await pool.query("UPDATE collaborations SET status = $1 WHERE project_id = $2", [status, req.params.id]);
    }
    res.json({ ok: true });
    return;
  }

  // Full detail edit
  if (!name || !project_type || !stage || !roles_needed?.length || !hours_per_week || !duration || !goal || !location) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  await pool.query(`
    UPDATE projects SET
      name = $1, project_type = $2, stage = $3, roles_needed = $4,
      skills_needed = $5, hours_per_week = $6, duration = $7, goal = $8, location = $9
    WHERE id = $10
  `, [
    name, project_type, stage,
    JSON.stringify(roles_needed), JSON.stringify(skills_needed || []),
    hours_per_week, duration, goal, location,
    req.params.id,
  ]);

  if (status && ["open", "active", "completed", "dropped"].includes(status)) {
    await pool.query("UPDATE projects SET status = $1 WHERE id = $2", [status, req.params.id]);
    if (status === "completed" || status === "dropped") {
      await pool.query("UPDATE collaborations SET status = $1 WHERE project_id = $2", [status, req.params.id]);
    }
  }

  res.json({ ok: true });
});

// Get matches for a project
router.get("/:id/matches", requireAuth, async (req, res) => {
  const projectResult = await pool.query(
    "SELECT p.*, u.timezone as owner_timezone FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = $1",
    [req.params.id]
  );
  const project = projectResult.rows[0];

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.owner_id !== req.session.userId) {
    res.status(403).json({ error: "Not the project owner" });
    return;
  }

  const rolesNeeded: string[] = JSON.parse(project.roles_needed);
  const skillsNeeded: string[] = JSON.parse(project.skills_needed);
  const ownerOffset = getTimezoneOffset(project.owner_timezone);

  const existingRequestsResult = await pool.query(
    "SELECT recipient_id FROM collaboration_requests WHERE project_id = $1 AND status IN ('pending', 'accepted')",
    [project.id]
  );
  const excludeIds = new Set([project.owner_id, ...existingRequestsResult.rows.map((r: any) => r.recipient_id)]);

  const existingCollabsResult = await pool.query(
    "SELECT user_id FROM collaborations WHERE project_id = $1",
    [project.id]
  );
  for (const c of existingCollabsResult.rows) excludeIds.add(c.user_id);

  const allUsersResult = await pool.query(
    "SELECT id, name, role, skills, availability, timezone, work_preference, portfolio_github, portfolio_website FROM users WHERE profile_complete = TRUE"
  );
  const allUsers = allUsersResult.rows;

  const candidates = [];

  for (const user of allUsers) {
    if (excludeIds.has(user.id)) continue;

    user.skills = JSON.parse(user.skills);

    if (!rolesNeeded.includes(user.role)) continue;
    if (user.availability < project.hours_per_week) continue;

    let skillScore = 0;
    if (skillsNeeded.length > 0) {
      const overlap = user.skills.filter((s: string) => skillsNeeded.includes(s)).length;
      skillScore = overlap / skillsNeeded.length;
    } else {
      skillScore = 0.5;
    }

    const userOffset = getTimezoneOffset(user.timezone);
    const tzDiff = Math.abs(ownerOffset - userOffset);
    const tzScore = 1 - Math.min(tzDiff, 12) / 12;

    let prefScore = 0;
    if (user.work_preference === project.project_type) prefScore = 1;
    else if (user.work_preference === "both") prefScore = 0.5;

    const totalScore = 0.4 * skillScore + 0.3 * tzScore + 0.3 * prefScore;

    candidates.push({ ...user, score: Math.round(totalScore * 100) });
  }

  candidates.sort((a, b) => b.score - a.score);
  res.json(candidates.slice(0, 20));
});

export default router;
