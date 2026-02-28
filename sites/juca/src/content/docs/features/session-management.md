---
title: "Session Management"
description: "How Juca manages user sessions, persists blocks in SQLite, and handles the session sidebar."
lang: en
sidebar:
  order: 9
---

# Session Management

Every conversation in Juca is a **session** — a persistent container of ordered blocks. Sessions are stored in SQLite, listed in the SessionSidebar, and loaded into the WorkCanvas.

## Session Structure

A session consists of:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | TEXT (PK) | Unique session identifier |
| `user_id` | TEXT | Owner of the session |
| `title` | TEXT | Display title (auto-generated or user-set) |
| `status` | TEXT | Session state |
| `created_at` | TEXT | Creation timestamp |
| `updated_at` | TEXT | Last modification timestamp |
| `message_count` | INTEGER | Number of messages/blocks |
| `metadata` | TEXT (JSON) | Phase state, preferences, etc. |

Sessions contain **messages** (blocks) in a child table:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | TEXT (PK) | Block identifier |
| `session_id` | TEXT (FK) | Parent session (CASCADE delete) |
| `role` | TEXT | Block role (user, assistant, system) |
| `content` | TEXT | Block content (JSON) |
| `timestamp` | TEXT | Creation time |
| `metadata` | TEXT (JSON) | Block type, phase, etc. |

## Persistence Layer

Session operations are centralized in `src/lib/db/sessions.ts` (the `SessionsDB` class):

```typescript
// Database configuration
const db = new Database(process.env.SQLITE_PATH || './data/juca.db');
db.pragma('journal_mode = WAL');      // Write-Ahead Logging for concurrency
db.pragma('foreign_keys = ON');        // Enforce referential integrity
```

All session access from other parts of the codebase goes through this module — direct SQLite access from components or API routes is not allowed.

## SessionSidebar

The `SessionSidebar` component (`src/components/shell/SessionSidebar.tsx`) displays the user's session history:

- Lists sessions ordered by `updated_at DESC`
- Shows title, date, and phase status for each session
- Click loads the session's blocks into the WorkCanvas
- Supports creating new sessions

## Server Actions

Session mutations happen through Server Actions in `src/actions/`:

| Action File | Key Functions | Purpose |
|-------------|---------------|---------|
| `session.ts` | Create, load, delete sessions | CRUD operations |
| `briefing.ts` | Phase transitions, evaluations | Briefing-specific state |
| `message.ts` | Add messages/blocks | Content creation |

All actions use `requireActionAuth()` from `src/actions/utils.ts`:

```typescript
// Every server action starts with auth
const user = await requireActionAuth();
// In dev mode (ENABLE_DEV_AUTH=true), returns:
// { id: 'dev-user', email: 'dev@localhost', name: 'Dev User', role: 'admin' }
```

## Known Limitations

:::caution
**BOLA Vulnerability ([#227](https://github.com/sensdiego/juca/issues/227)):** Session API endpoints accept any `sessionId` without verifying that the requesting user owns the session. This is an OWASP #1 vulnerability. Currently acceptable because only the dev uses the system. Fix planned for v0.6+ when multi-user support is added.
:::

:::caution
**SQLite Scalability ([#231](https://github.com/sensdiego/juca/issues/231)):** `better-sqlite3` uses synchronous operations that block the Node.js event loop. At approximately 50 concurrent users, the server becomes unresponsive. Migration to PostgreSQL is planned for v0.6+.
:::
