---
title: "Environment Variables"
description: "Canonical environment variable reference for local development, CI workflows, and secure operations."
lang: en
sidebar:
  order: 1
---

# Environment Variables

## Environment variables define runtime and operational boundaries
Leci currently uses a small but critical environment variable surface. Correct configuration is required for migrations, DB access, and CI webhook behavior.

## Variable catalog
| Variable | Required | Used by | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes (local + CI for migrations) | `scripts/migrate.ts`, Drizzle config | PostgreSQL connection string |
| `DISCORD_PR_REVIEW_WEBHOOK` | Optional local, required in CI workflow context | GitHub Actions workflow | PR review notification webhook |

## Local configuration flow
1. copy `.env.example` to `.env`;
2. set `DATABASE_URL`;
3. run migrations and validation commands.

```bash
cp .env.example .env
npx tsx scripts/migrate.ts
```

## Safety and handling rules
- never commit filled `.env` files;
- treat DB credentials and webhook secrets as sensitive;
- use dedicated credentials per environment where possible.

## Validation behavior
If `DATABASE_URL` is missing, migration script fails fast with explicit error:

```ts
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
```
