import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Check server/.env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

// Bootstrap schema on startup
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
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
      profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collaboration_requests (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      sender_id INTEGER NOT NULL REFERENCES users(id),
      recipient_id INTEGER NOT NULL REFERENCES users(id),
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collaborations (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'active',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id SERIAL PRIMARY KEY,
      collaboration_id INTEGER NOT NULL REFERENCES collaborations(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      completed TEXT NOT NULL,
      blocked TEXT NOT NULL DEFAULT '',
      next_steps TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("Database schema ready");
}

initSchema().catch((err) => {
  console.error("Failed to initialise schema:", err);
  process.exit(1);
});

export default pool;
