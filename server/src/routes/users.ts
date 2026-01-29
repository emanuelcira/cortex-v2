import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:id", requireAuth, (req, res) => {
  const user = db.prepare(
    "SELECT id, name, role, skills, availability, timezone, portfolio_github, portfolio_figma, portfolio_website, work_preference, profile_complete, created_at FROM users WHERE id = ?"
  ).get(req.params.id) as any;

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  user.skills = JSON.parse(user.skills);
  res.json(user);
});

router.put("/me", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const {
    name, role, skills, availability, timezone,
    portfolio_github, portfolio_figma, portfolio_website,
    work_preference,
  } = req.body;

  if (!name || !role || !skills || !availability || !timezone || !work_preference) {
    res.status(400).json({ error: "All profile fields are required" });
    return;
  }

  db.prepare(`
    UPDATE users SET
      name = ?, role = ?, skills = ?, availability = ?, timezone = ?,
      portfolio_github = ?, portfolio_figma = ?, portfolio_website = ?,
      work_preference = ?, profile_complete = 1
    WHERE id = ?
  `).run(
    name, role, JSON.stringify(skills), availability, timezone,
    portfolio_github || "", portfolio_figma || "", portfolio_website || "",
    work_preference, userId
  );

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
  const { password_hash, ...safe } = user;
  safe.skills = JSON.parse(safe.skills);
  res.json(safe);
});

export default router;
