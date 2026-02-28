---
title: "Resolução de Problemas"
description: "Guia de troubleshooting para problemas de setup, migration, runtime e workflow no Leci."
lang: pt-BR
sidebar:
  order: 3
---


# Resolução de Problemas

## Dependency installation issues
If dependency install fails:
1. verify Node/npm versions match repository engine constraints;
2. remove `node_modules` and reinstall with `npm ci`;
3. ensure lockfile is not conflicting with local tooling.

## Environment variable issues
If migration reports missing DB URL, verify `.env` exists and contains `DATABASE_URL`.

```bash
cp .env.example .env
# then set DATABASE_URL
```

## Migration failures
Common migration failure causes:
- invalid DB credentials
- insufficient permissions
- extension requirements not available
- non-idempotent SQL assumptions in future migration files

## Runtime startup issues
If `npm run dev` fails:
- run `npm run lint` and `npm test` first;
- check dependency installation integrity;
- check for TypeScript or config-level errors in terminal output.

## CI workflow issues
If CI review notifications fail:
- confirm `DISCORD_PR_REVIEW_WEBHOOK` is configured in repository secrets;
- verify workflow trigger event and permissions.

## Escalation guidance
Escalate when issues involve:
- potential legal text corruption risk;
- migration inconsistencies across environments;
- repeated integration failures affecting roadmap milestones.
