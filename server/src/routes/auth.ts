import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, password, and name are required" });
    return;
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id",
    [email, hash, name]
  );

  const newUser = result.rows[0];
  req.session.userId = newUser.id;
  res.status(201).json({ id: newUser.id, email, name, profile_complete: false });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  const { password_hash, ...safe } = user;
  safe.skills = JSON.parse(safe.skills);
  res.json(safe);
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.session.userId]);
  const user = result.rows[0];
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password_hash, ...safe } = user;
  safe.skills = JSON.parse(safe.skills);
  res.json(safe);
});

export default router;
