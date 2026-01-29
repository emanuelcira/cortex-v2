import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "cortex.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '[]',
    availability INTEGER NOT NULL DEFAULT 0,
    timezone TEXT NOT NULL DEFAULT '',
    portfolio_github TEXT NOT NULL DEFAULT '',
    portfolio_figma TEXT NOT NULL DEFAULT '',
    portfolio_website TEXT NOT NULL DEFAULT '',
    work_preference TEXT NOT NULL DEFAULT '',
    profile_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    stage TEXT NOT NULL,
    roles_needed TEXT NOT NULL DEFAULT '[]',
    skills_needed TEXT NOT NULL DEFAULT '[]',
    hours_per_week INTEGER NOT NULL,
    duration TEXT NOT NULL,
    goal TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS collaboration_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS collaborations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'active',
    joined_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collaboration_id INTEGER NOT NULL REFERENCES collaborations(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    completed TEXT NOT NULL,
    blocked TEXT NOT NULL DEFAULT '',
    next_steps TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
