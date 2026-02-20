import { Router } from "express";
import db from "../db.js";
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
router.post("/", requireAuth, (req, res) => {
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

  const result = db.prepare(`
    INSERT INTO projects (owner_id, name, project_type, stage, roles_needed, skills_needed, hours_per_week, duration, goal, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, name, project_type, stage,
    JSON.stringify(roles_needed), JSON.stringify(skills_needed || []),
    hours_per_week, duration, goal, location
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// List projects (optionally filter by owner)
router.get("/", requireAuth, (req, res) => {
  const { mine } = req.query;
  let projects: any[];

  if (mine === "true") {
    projects = db.prepare(
      "SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.owner_id = ? ORDER BY p.created_at DESC"
    ).all(req.session.userId);
  } else {
    projects = db.prepare(
      "SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.status = 'open' ORDER BY p.created_at DESC"
    ).all();
  }

  for (const p of projects) {
    p.roles_needed = JSON.parse(p.roles_needed);
    p.skills_needed = JSON.parse(p.skills_needed);
  }

  res.json(projects);
});

// Get single project
router.get("/:id", requireAuth, (req, res) => {
  const project = db.prepare(
    "SELECT p.*, u.name as owner_name, u.timezone as owner_timezone FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?"
  ).get(req.params.id) as any;

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  project.roles_needed = JSON.parse(project.roles_needed);
  project.skills_needed = JSON.parse(project.skills_needed);

  // Get collaborators
  const collaborators = db.prepare(`
    SELECT c.*, u.name, u.role, u.skills FROM collaborations c
    JOIN users u ON c.user_id = u.id WHERE c.project_id = ?
  `).all(project.id) as any[];

  for (const c of collaborators) c.skills = JSON.parse(c.skills);
  project.collaborators = collaborators;

  res.json(project);
});

// Update project (status-only or full detail edit)
router.put("/:id", requireAuth, (req, res) => {
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id) as any;
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
    db.prepare("UPDATE projects SET status = ? WHERE id = ?").run(status, req.params.id);
    if (status === "completed" || status === "dropped") {
      db.prepare("UPDATE collaborations SET status = ? WHERE project_id = ?").run(status, req.params.id);
    }
    res.json({ ok: true });
    return;
  }

  // Full detail edit
  if (!name || !project_type || !stage || !roles_needed?.length || !hours_per_week || !duration || !goal || !location) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  db.prepare(`
    UPDATE projects SET
      name = ?, project_type = ?, stage = ?, roles_needed = ?,
      skills_needed = ?, hours_per_week = ?, duration = ?, goal = ?, location = ?
    WHERE id = ?
  `).run(
    name, project_type, stage,
    JSON.stringify(roles_needed), JSON.stringify(skills_needed || []),
    hours_per_week, duration, goal, location,
    req.params.id
  );

  // If status is also provided alongside field edits, apply it too
  if (status && ["open", "active", "completed", "dropped"].includes(status)) {
    db.prepare("UPDATE projects SET status = ? WHERE id = ?").run(status, req.params.id);
    if (status === "completed" || status === "dropped") {
      db.prepare("UPDATE collaborations SET status = ? WHERE project_id = ?").run(status, req.params.id);
    }
  }

  res.json({ ok: true });
});

// Get matches for a project
router.get("/:id/matches", requireAuth, (req, res) => {
  const project = db.prepare(
    "SELECT p.*, u.timezone as owner_timezone FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?"
  ).get(req.params.id) as any;

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

  const existingRequests = db.prepare(
    "SELECT recipient_id FROM collaboration_requests WHERE project_id = ? AND status IN ('pending', 'accepted')"
  ).all(project.id) as any[];
  const excludeIds = new Set([project.owner_id, ...existingRequests.map((r: any) => r.recipient_id)]);

  const existingCollabs = db.prepare(
    "SELECT user_id FROM collaborations WHERE project_id = ?"
  ).all(project.id) as any[];
  for (const c of existingCollabs) excludeIds.add(c.user_id);

  const allUsers = db.prepare(
    "SELECT id, name, role, skills, availability, timezone, work_preference, portfolio_github, portfolio_website FROM users WHERE profile_complete = 1"
  ).all() as any[];

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
