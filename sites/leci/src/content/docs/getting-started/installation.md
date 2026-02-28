---
title: "Installation"
description: "Complete installation guide for local, CI-like, and reproducible Leci environments."
lang: en
sidebar:
  order: 30
---

# Installation

> This page provides the full installation process for reproducible local and validation environments.

## Installation should prioritize reproducibility over speed
A successful installation is not only "the app runs once"; it is also deterministic across contributors and CI contexts. This guide standardizes tool versions, environment variables, migration behavior, and validation checks.

## System requirements are defined by runtime and tooling
Leci currently requires:
- Node.js `>=20.0.0`
- npm `>=10.0.0`
- PostgreSQL instance reachable via `DATABASE_URL`

Recommended verification commands:

```bash
node -v
npm -v
```

If you use `nvm`, the repository includes:

```bash
cat .nvmrc
# expected: 20
```

## Environment variables are required for database and workflows
The project ships `.env.example` with currently recognized variables:

```env
DATABASE_URL=
DISCORD_PR_REVIEW_WEBHOOK=
```

### Variable purpose and usage
- `DATABASE_URL` is required for local migration and Drizzle tooling.
- `DISCORD_PR_REVIEW_WEBHOOK` is used by GitHub Actions and is optional for local app development.

:::tip
For local development, set `DATABASE_URL` first. You can leave `DISCORD_PR_REVIEW_WEBHOOK` empty unless you are validating CI notification behavior.
:::

## Standard local installation flow
Use this flow for developer machines.

```bash
# Clone and enter repository
git clone https://github.com/sensdiego/leci.git
cd leci

# Ensure correct Node version (if using nvm)
nvm use || nvm install

# Install dependencies
npm install

# Prepare env
cp .env.example .env

# Edit .env and set DATABASE_URL

# Run migrations
npx tsx scripts/migrate.ts

# Run baseline checks
npm run lint
npm test

# Start app
npm run dev
```

## Migration internals and operational implications
The migration workflow is SQL-file based and currently simple by design.

### How migration order is computed
`script/migrate.ts` sorts migration files by numeric prefix before execution (e.g., `0001_`, `0002_`, ...).

### How migration execution works
For each SQL file in order, the script:
1. reads file contents;
2. executes SQL against the configured PostgreSQL connection;
3. prints `Applied <filename>` on success.

### Current safety profile
The initial migration (`drizzle/0001_init.sql`) uses mostly idempotent DDL patterns (`IF NOT EXISTS`) and `ON CONFLICT DO NOTHING` for seed values.

:::caution
The migration runner does not maintain a dedicated migrations history table. If future SQL files are not idempotent, reruns can fail or behave unexpectedly.
:::

## Installation mode: CI-like validation
Use this mode to emulate pipeline checks before opening a PR.

```bash
npm ci
cp .env.example .env
# set DATABASE_URL for validation environment
npx tsx scripts/migrate.ts
npm run lint
npm test
npm run build
```

Why this mode matters:
- `npm ci` catches lockfile drift.
- `build` catches production-compile issues not visible in dev mode.

## Installation mode: production-like smoke
This mode validates the artifact lifecycle locally.

```bash
npm ci
cp .env.example .env
# set DATABASE_URL
npx tsx scripts/migrate.ts
npm run build
npm run start
```

Expected result:
- server starts successfully;
- homepage loads;
- metadata/title aligns with Leci branding.

## Deterministic validation checklist
Use this checklist to confirm installation quality.

- [ ] Node and npm versions satisfy `engines`.
- [ ] Dependencies install without lockfile conflicts.
- [ ] `.env` exists and `DATABASE_URL` is valid.
- [ ] Migration command completes and prints applied files.
- [ ] `npm run lint` passes.
- [ ] `npm test` executes successfully.
- [ ] `npm run build` succeeds.
- [ ] `npm run dev` serves the homepage on port 3000.

## Upgrade and clean reinstall procedure
Use this when switching branches, resolving dependency drift, or onboarding after major updates.

```bash
# Optional cleanup
rm -rf node_modules

# Reinstall dependencies
npm ci

# Re-verify environment variables
cp .env.example .env   # if needed

# Re-run schema migrations
npx tsx scripts/migrate.ts

# Re-run quality checks
npm run lint
npm test
npm run build
```

:::note
If you are installing for roadmap-only features (search API, ingestion, agent integrations), remember these are not fully implemented in current code.
:::

> 🚧 **Planned Feature** — Internal API endpoint groups are roadmap-defined but not present in `src/app/api` yet.

> 🚧 **Planned Feature** — Source ingestion pipeline is a roadmap workstream and not part of current repository runtime.

## Known unknowns requiring owner confirmation
Some installation/operations details need explicit owner decisions.

> ⚠️ **Unverified** — Official production deployment topology and secret management platform beyond current repository context.

<!-- NEEDS_INPUT: Confirm production hosting model, database backup policy, and deployment environment matrix (staging/prod). -->
