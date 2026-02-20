import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// --- Collaboration Requests ---

router.post("/requests", requireAuth, async (req, res) => {
  const senderId = req.session.userId;
  const { project_id, message } = req.body;

  if (!project_id) {
    res.status(400).json({ error: "project_id is required" });
    return;
  }

  const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [project_id]);
  const project = projectResult.rows[0];
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.owner_id === senderId) {
    res.status(400).json({ error: "You cannot request to collaborate on your own project" });
    return;
  }

  const recipientId = project.owner_id;

  const existingResult = await pool.query(
    "SELECT id FROM collaboration_requests WHERE project_id = $1 AND sender_id = $2 AND status = 'pending'",
    [project_id, senderId]
  );
  if (existingResult.rows.length > 0) {
    res.status(409).json({ error: "Request already sent" });
    return;
  }

  const result = await pool.query(
    "INSERT INTO collaboration_requests (project_id, sender_id, recipient_id, message) VALUES ($1, $2, $3, $4) RETURNING id",
    [project_id, senderId, recipientId, message || ""]
  );

  res.status(201).json({ id: result.rows[0].id });
});

router.get("/requests/incoming", requireAuth, async (req, res) => {
  const result = await pool.query(`
    SELECT cr.*, p.name as project_name, p.project_type, p.hours_per_week, p.duration,
           u.name as sender_name
    FROM collaboration_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN users u ON cr.sender_id = u.id
    WHERE cr.recipient_id = $1 AND cr.status = 'pending'
    ORDER BY cr.created_at DESC
  `, [req.session.userId]);

  res.json(result.rows);
});

router.get("/requests/outgoing", requireAuth, async (req, res) => {
  const result = await pool.query(`
    SELECT cr.*, p.name as project_name, u.name as recipient_name
    FROM collaboration_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN users u ON cr.recipient_id = u.id
    WHERE cr.sender_id = $1
    ORDER BY cr.created_at DESC
  `, [req.session.userId]);

  res.json(result.rows);
});

router.put("/requests/:id", requireAuth, async (req, res) => {
  const requestResult = await pool.query(
    "SELECT * FROM collaboration_requests WHERE id = $1",
    [req.params.id]
  );
  const request = requestResult.rows[0];

  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  if (request.recipient_id !== req.session.userId) {
    res.status(403).json({ error: "Not the recipient" });
    return;
  }

  const { status } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    res.status(400).json({ error: "Status must be 'accepted' or 'declined'" });
    return;
  }

  await pool.query("UPDATE collaboration_requests SET status = $1 WHERE id = $2", [status, req.params.id]);

  if (status === "accepted") {
    await pool.query(
      "INSERT INTO collaborations (project_id, user_id) VALUES ($1, $2)",
      [request.project_id, request.sender_id]
    );

    await pool.query(
      "UPDATE projects SET status = 'active' WHERE id = $1 AND status = 'open'",
      [request.project_id]
    );
  }

  res.json({ ok: true });
});

// --- Collaborations ---

router.get("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;

  const asCollaboratorResult = await pool.query(`
    SELECT c.id as collaboration_id, c.status as collab_status, c.joined_at,
           p.id as project_id, p.name as project_name, p.project_type, p.status as project_status,
           p.hours_per_week, p.duration, p.goal,
           owner.name as owner_name, owner.id as owner_id
    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users owner ON p.owner_id = owner.id
    WHERE c.user_id = $1
    ORDER BY c.joined_at DESC
  `, [userId]);

  const asOwnerResult = await pool.query(`
    SELECT c.id as collaboration_id, c.status as collab_status, c.joined_at,
           p.id as project_id, p.name as project_name, p.project_type, p.status as project_status,
           p.hours_per_week, p.duration, p.goal,
           collab_user.name as collaborator_name, collab_user.id as collaborator_id
    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users collab_user ON c.user_id = collab_user.id
    WHERE p.owner_id = $1
    ORDER BY c.joined_at DESC
  `, [userId]);

  res.json({ asCollaborator: asCollaboratorResult.rows, asOwner: asOwnerResult.rows });
});

router.get("/:id", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const collabResult = await pool.query(`
    SELECT c.*, p.name as project_name, p.project_type, p.stage, p.status as project_status,
           p.hours_per_week, p.duration, p.goal, p.location, p.owner_id,
           p.roles_needed, p.skills_needed,
           u.name as collaborator_name, u.role as collaborator_role,
           owner.name as owner_name
    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users u ON c.user_id = u.id
    JOIN users owner ON p.owner_id = owner.id
    WHERE c.id = $1
  `, [req.params.id]);
  const collab = collabResult.rows[0];

  if (!collab) {
    res.status(404).json({ error: "Collaboration not found" });
    return;
  }

  if (collab.owner_id !== userId && collab.user_id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  collab.roles_needed = JSON.parse(collab.roles_needed);
  collab.skills_needed = JSON.parse(collab.skills_needed);
  res.json(collab);
});

// --- Check-ins ---

router.post("/:id/checkins", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const collabId = req.params.id;

  const collabResult = await pool.query("SELECT * FROM collaborations WHERE id = $1", [collabId]);
  const collab = collabResult.rows[0];
  if (!collab) {
    res.status(404).json({ error: "Collaboration not found" });
    return;
  }

  const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [collab.project_id]);
  const project = projectResult.rows[0];
  if (collab.user_id !== userId && project.owner_id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { completed, blocked, next_steps } = req.body;
  if (!completed || !next_steps) {
    res.status(400).json({ error: "completed and next_steps are required" });
    return;
  }

  const result = await pool.query(
    "INSERT INTO checkins (collaboration_id, user_id, completed, blocked, next_steps) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [collabId, userId, completed, blocked || "", next_steps]
  );

  res.status(201).json({ id: result.rows[0].id });
});

router.get("/:id/checkins", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const collabId = req.params.id;

  const collabResult = await pool.query("SELECT * FROM collaborations WHERE id = $1", [collabId]);
  const collab = collabResult.rows[0];
  if (!collab) {
    res.status(404).json({ error: "Collaboration not found" });
    return;
  }

  const projectResult = await pool.query("SELECT * FROM projects WHERE id = $1", [collab.project_id]);
  const project = projectResult.rows[0];
  if (collab.user_id !== userId && project.owner_id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const result = await pool.query(`
    SELECT ch.*, u.name as user_name
    FROM checkins ch
    JOIN users u ON ch.user_id = u.id
    WHERE ch.collaboration_id = $1
    ORDER BY ch.created_at DESC
  `, [collabId]);

  res.json(result.rows);
});

export default router;
