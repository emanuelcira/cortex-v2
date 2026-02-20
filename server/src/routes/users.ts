import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:id", requireAuth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, role, skills, availability, timezone, portfolio_github, portfolio_figma, portfolio_website, work_preference, profile_complete, created_at FROM users WHERE id = $1",
    [req.params.id]
  );
  const user = result.rows[0];

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  user.skills = JSON.parse(user.skills);
  res.json(user);
});

router.put("/me", requireAuth, async (req, res) => {
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

  await pool.query(`
    UPDATE users SET
      name = $1, role = $2, skills = $3, availability = $4, timezone = $5,
      portfolio_github = $6, portfolio_figma = $7, portfolio_website = $8,
      work_preference = $9, profile_complete = TRUE
    WHERE id = $10
  `, [
    name, role, JSON.stringify(skills), availability, timezone,
    portfolio_github || "", portfolio_figma || "", portfolio_website || "",
    work_preference, userId,
  ]);

  const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  const user = result.rows[0];
  const { password_hash, ...safe } = user;
  safe.skills = JSON.parse(safe.skills);
  res.json(safe);
});

export default router;
