---
title: "Setup de Desenvolvimento"
description: "Fluxo de setup para contribuidores rodarem, validarem e iterarem no Leci com segurança."
lang: pt-BR
sidebar:
  order: 1
---


# Setup de Desenvolvimento

## Development setup must be reproducible and explicit
Leci contribution flow depends on reproducible environment setup because database and migration behavior are central to product correctness.

## Toolchain requirements
Required baseline:
- Node.js `>=20`
- npm `>=10`
- PostgreSQL connection URL via `DATABASE_URL`

Recommended command checks:

```bash
node -v
npm -v
```

## First-time setup workflow
```bash
npm install
cp .env.example .env
# set DATABASE_URL
npx tsx scripts/migrate.ts
npm run lint
npm test
npm run dev
```

## Daily developer loop
A standard daily loop should include:
1. pull latest changes;
2. reinstall only if lockfile changed;
3. apply migrations;
4. run lint/test;
5. run app in dev mode.

## Database-sensitive workflow guidance
When changing schema-related code:
- update Drizzle schema and/or SQL migrations intentionally;
- verify migration rerun behavior;
- document any non-idempotent assumptions.

## Documentation update rule
Any change affecting commands, config, or feature behavior must update corresponding docs pages in the same branch.
