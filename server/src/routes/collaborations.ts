import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// --- Collaboration Requests ---

router.post("/requests", requireAuth, (req, res) => {
  const senderId = req.session.userId;
  const { project_id, recipient_id, message } = req.body;

  if (!project_id || !recipient_id) {
    res.status(400).json({ error: "project_id and recipient_id are required" });
    return;
  }

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(project_id) as any;
  if (!project || project.owner_id !== senderId) {
    res.status(403).json({ error: "Not the project owner" });
    return;
  }

  const existing = db.prepare(
    "SELECT id FROM collaboration_requests WHERE project_id = ? AND recipient_id = ? AND status = 'pending'"
  ).get(project_id, recipient_id);
  if (existing) {
    res.status(409).json({ error: "Request already sent" });
    return;
  }

  const result = db.prepare(
    "INSERT INTO collaboration_requests (project_id, sender_id, recipient_id, message) VALUES (?, ?, ?, ?)"
  ).run(project_id, senderId, recipient_id, message || "");

  res.status(201).json({ id: result.lastInsertRowid });
});

router.get("/requests/incoming", requireAuth, (req, res) => {
  const requests = db.prepare(`
    SELECT cr.*, p.name as project_name, p.project_type, p.hours_per_week, p.duration,
           u.name as sender_name
    FROM collaboration_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN users u ON cr.sender_id = u.id
    WHERE cr.recipient_id = ? AND cr.status = 'pending'
    ORDER BY cr.created_at DESC
  `).all(req.session.userId);

  res.json(requests);
});

router.get("/requests/outgoing", requireAuth, (req, res) => {
  const requests = db.prepare(`
    SELECT cr.*, p.name as project_name, u.name as recipient_name
    FROM collaboration_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN users u ON cr.recipient_id = u.id
    WHERE cr.sender_id = ?
    ORDER BY cr.created_at DESC
  `).all(req.session.userId);

  res.json(requests);
});

router.put("/requests/:id", requireAuth, (req, res) => {
  const request = db.prepare(
    "SELECT * FROM collaboration_requests WHERE id = ?"
  ).get(req.params.id) as any;

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

  db.prepare("UPDATE collaboration_requests SET status = ? WHERE id = ?")
    .run(status, req.params.id);

  if (status === "accepted") {
    db.prepare(
      "INSERT INTO collaborations (project_id, user_id) VALUES (?, ?)"
    ).run(request.project_id, request.recipient_id);

    db.prepare("UPDATE projects SET status = 'active' WHERE id = ? AND status = 'open'")
      .run(request.project_id);
  }

  res.json({ ok: true });
});

// --- Collaborations ---

router.get("/", requireAuth, (req, res) => {
  const userId = req.session.userId;

  const asCollaborator = db.prepare(`
    SELECT c.id as collaboration_id, c.status as collab_status, c.joined_at,
           p.id as project_id, p.name as project_name, p.project_type, p.status as project_status,
           p.hours_per_week, p.duration, p.goal,
           owner.name as owner_name, owner.id as owner_id
    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users owner ON p.owner_id = owner.id
    WHERE c.user_id = ?
    ORDER BY c.joined_at DESC
  `).all(userId);

  const asOwner = db.prepare(`
    SELECT c.id as collaboration_id, c.status as collab_status, c.joined_at,
           p.id as project_id, p.name as project_name, p.project_type, p.status as project_status,
           p.hours_per_week, p.duration, p.goal,
           collab_user.name as collaborator_name, collab_user.id as collaborator_id
    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users collab_user ON c.user_id = collab_user.id
    WHERE p.owner_id = ?
    ORDER BY c.joined_at DESC
  `).all(userId);

  res.json({ asCollaborator, asOwner });
});

router.get("/:id", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const collab = db.prepare(`
    SELECT c.*, p.name as project_name, p.project_type, p.stage, p.status as project_status,
           p.hours_per_week, p.duration, p.goal, p.location, p.owner_id,
           p.roles_needed, p.skills_needed,
           u.name as collaborator_name, u.role as collaborator_role,
           owner.name as owner_name
    FROM collaborations c
    JOIN projects p ON c.project_id = p.id
    JOIN users u ON c.user_id = u.id
    JOIN users owner ON p.owner_id = owner.id
    WHERE c.id = ?
  `).get(req.params.id) as any;

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

router.post("/:id/checkins", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const collabId = req.params.id;

  const collab = db.prepare("SELECT * FROM collaborations WHERE id = ?").get(collabId) as any;
  if (!collab) {
    res.status(404).json({ error: "Collaboration not found" });
    return;
  }

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(collab.project_id) as any;
  if (collab.user_id !== userId && project.owner_id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const { completed, blocked, next_steps } = req.body;
  if (!completed || !next_steps) {
    res.status(400).json({ error: "completed and next_steps are required" });
    return;
  }

  const result = db.prepare(
    "INSERT INTO checkins (collaboration_id, user_id, completed, blocked, next_steps) VALUES (?, ?, ?, ?, ?)"
  ).run(collabId, userId, completed, blocked || "", next_steps);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.get("/:id/checkins", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const collabId = req.params.id;

  const collab = db.prepare("SELECT * FROM collaborations WHERE id = ?").get(collabId) as any;
  if (!collab) {
    res.status(404).json({ error: "Collaboration not found" });
    return;
  }

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(collab.project_id) as any;
  if (collab.user_id !== userId && project.owner_id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const checkins = db.prepare(`
    SELECT ch.*, u.name as user_name
    FROM checkins ch
    JOIN users u ON ch.user_id = u.id
    WHERE ch.collaboration_id = ?
    ORDER BY ch.created_at DESC
  `).all(collabId);

  res.json(checkins);
});

export default router;
