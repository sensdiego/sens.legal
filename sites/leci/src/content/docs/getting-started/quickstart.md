---
title: "Quickstart"
description: "Run Leci locally with the minimum commands and verify the baseline environment."
lang: en
sidebar:
  order: 20
---

# Quickstart

> This page gives you the fastest reliable path to run Leci locally and confirm your setup works.

## Quickstart is optimized for first successful run
The goal of this quickstart is to validate the repository baseline in minutes, not to explain every option. You will install dependencies, configure environment variables, run migrations, and start the app.

## Prerequisites are explicit and minimal
You need the following before running commands:
- Node.js `>=20.0.0` (from `package.json` engines)
- npm `>=10.0.0` (from `package.json` engines)
- Access to a PostgreSQL database URL for `DATABASE_URL`

The project currently uses:
- Next.js for the app runtime
- `pg` for database connectivity in migration script
- Drizzle schema/migration conventions via SQL files in `drizzle/`

## Run these commands in order
Use the exact command sequence below from the repository root.

```bash
# 1) Install dependencies
npm install

# 2) Create local env file
cp .env.example .env

# 3) Set DATABASE_URL in .env
# Example format:
# DATABASE_URL=postgresql://user:password@host:5432/database

# 4) Apply SQL migrations
npx tsx scripts/migrate.ts

# 5) Start the dev server
npm run dev
```

Then open:
- `http://localhost:3000`

Expected UI baseline:
- title text `Leci`
- subtitle `Plataforma de busca de legislação brasileira federal`

## Verify baseline quality commands
After the app starts, run the quality checks below.

```bash
# Lint checks
npm run lint

# Test runner (currently no suites yet, but command must execute)
npm test
```

Expected current test output includes zero suites/tests; this is normal for the current roadmap stage.

:::note
`npm test` is intentionally present as a quality-gate command even before full test suites are implemented.
:::

## Understand migration behavior before rerunning
The migration runner (`scripts/migrate.ts`) reads every `.sql` file in `drizzle/`, sorts by numeric prefix, and executes each file in sequence every run.

```ts
const files = fs.readdirSync(drizzleDir)
  .filter((file) => file.endsWith(".sql"))
  .sort((a, b) => {
    const aNum = Number.parseInt(a.split("_")[0] ?? "0", 10);
    const bNum = Number.parseInt(b.split("_")[0] ?? "0", 10);
    return aNum - bNum;
  });
```

:::caution
Because there is no migration-history table in the runner, future non-idempotent SQL files can fail on reruns. Keep migration SQL idempotent when possible and document assumptions per migration.
:::

## Common quickstart failures and immediate fixes
These are the most likely first-run issues.

### Error: `DATABASE_URL is not set`
Cause: `.env` missing or variable unset.

Fix:
1. Confirm `.env` exists.
2. Confirm `DATABASE_URL=` is present and non-empty.
3. Re-run migration command.

### Error: PostgreSQL connection refused / timeout
Cause: database host unreachable or wrong credentials.

Fix:
1. Verify host/port/user/password in `DATABASE_URL`.
2. Confirm network access (VPN/firewall) if using hosted DB.
3. Test URL with a DB client, then rerun.

### Error while applying migration SQL
Cause: schema permissions, extension availability, or non-idempotent statements.

Fix:
1. Ensure target DB user can create schema/extensions as needed.
2. Check `drizzle/0001_init.sql` requirements (`vector` extension).
3. Inspect the failing SQL statement and validate target DB state.

### App starts but page is not what you expected
Cause: current UI is intentionally minimal.

> 🚧 **Planned Feature** — Search/browse/read product flows are roadmap items and not implemented yet.

## What to do after quickstart
After baseline run succeeds, continue with:
1. `docs/getting-started/installation.md` for full setup and reproducible environment standards.
2. `docs/development/setup.md` for contributor workflow.
3. `docs/features/index.md` to understand implementation status by capability.
