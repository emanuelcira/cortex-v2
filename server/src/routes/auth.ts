import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, password, and name are required" });
    return;
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)"
  ).run(email, hash, name);

  req.session.userId = Number(result.lastInsertRowid);
  res.status(201).json({ id: result.lastInsertRowid, email, name, profile_complete: 0 });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
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

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId) as any;
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { password_hash, ...safe } = user;
  safe.skills = JSON.parse(safe.skills);
  res.json(safe);
});

export default router;
