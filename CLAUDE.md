# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Cortex

Cortex is a web app that helps builders find collaborators for real projects. Users post structured projects, get deterministic skill/timezone/preference-based matches, send collaboration requests, and track progress with weekly check-ins. It is not a social product — no feeds, chats, ratings, or notifications.

## Commands

```bash
npm install          # Install all dependencies (root + workspaces)
npm run dev          # Start both server (:3000) and client (:5173) concurrently
npm run dev:server   # Server only (tsx watch, auto-reload)
npm run dev:client   # Client only (Vite dev server)
npm run build        # Build client for production (outputs to client/dist/)
npm run start        # Start server in production mode
```

Type-checking (no build artifacts):
```bash
npx -w client tsc --noEmit
npx -w server tsc --noEmit
```

## Architecture

Monorepo with npm workspaces: `client/` and `server/`.

### Server (`server/`)

- **Runtime**: Node.js + Express, executed via `tsx` (no compile step needed)
- **Database**: SQLite via `better-sqlite3`, file stored at `server/cortex.db`. Tables are auto-created on startup in `src/db.ts`
- **Auth**: `express-session` with cookie-based sessions. Session type is augmented in `src/middleware/auth.ts` to include `userId`
- **Entry point**: `src/index.ts` — mounts all route groups under `/api/`

Route files in `src/routes/`:
- `auth.ts` — register, login, logout, session check (`/api/auth/*`)
- `users.ts` — get/update user profile (`/api/users/*`)
- `projects.ts` — CRUD for projects + deterministic matching algorithm (`/api/projects/*`)
- `collaborations.ts` — collaboration requests, active collaborations, weekly check-ins (`/api/collaborations/*`)

**Matching algorithm** (`projects.ts`, `GET /:id/matches`): Filters users by role and availability, then scores by skill overlap (40%), timezone proximity (30%), and project-type preference (30%). Purely deterministic, no AI.

### Client (`client/`)

- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS 3
- **Routing**: react-router-dom v7, configured in `src/App.tsx`
- **Auth state**: React context in `src/context/AuthContext.tsx`, provides `user`, `login`, `register`, `logout`, `refreshUser`
- **API layer**: `src/lib/api.ts` — thin fetch wrapper; all endpoints return parsed JSON or throw with server error messages
- **Constants**: `src/lib/constants.ts` — roles, skills list, project types, stages, durations, goals, locations, timezones
- **Layout**: `src/components/Layout.tsx` — shared nav shell for authenticated pages

Page files in `src/pages/`:
- `Landing.tsx` — public landing page
- `Login.tsx` / `Register.tsx` — auth forms
- `Profile.tsx` — profile view/edit (doubles as first-time setup after registration)
- `Dashboard.tsx` — incoming requests, active collaborations, user's projects
- `Projects.tsx` — browse all open projects
- `CreateProject.tsx` — structured project creation form
- `ProjectDetail.tsx` — project details, matched collaborators (owner only), send requests
- `Collaborations.tsx` — list active and past collaborations
- `CollaborationDetail.tsx` — collaboration workspace with weekly check-in history

**Route guards** in `App.tsx`: `PrivateRoute` redirects unauthenticated users to `/login` and forces incomplete profiles to `/profile`. `PublicRoute` redirects authenticated users to `/dashboard`.

### Dev Proxy

Vite proxies `/api` requests to `http://localhost:3000` during development (configured in `vite.config.ts`).

## Data Model

Five tables defined in `server/src/db.ts`:
- `users` — profile fields, `profile_complete` flag, skills stored as JSON array
- `projects` — structured fields, `roles_needed` and `skills_needed` as JSON arrays, status enum (open/active/completed/dropped)
- `collaboration_requests` — links sender (project owner) to recipient, status enum (pending/accepted/declined)
- `collaborations` — created on request acceptance, links user to project
- `checkins` — weekly accountability entries (completed/blocked/next_steps), linked to collaboration

## Design Conventions

- Minimal, professional aesthetic. Neutral grays with indigo accent (`accent-50` through `accent-900` mapped to Tailwind's indigo).
- Inter font loaded from Google Fonts.
- Toggle buttons (pill-style) for structured selections instead of dropdowns where possible.
- Status badges use color-coded backgrounds: blue=open, green=active, gray=completed, red=dropped.
