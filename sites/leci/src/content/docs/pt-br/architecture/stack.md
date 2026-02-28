---
title: "Stack Tecnológica"
description: "Referência versionada da stack de runtime, banco, tooling e dependências de integração externa."
lang: pt-BR
sidebar:
  order: 2
---


# Stack Tecnológica

## Stack choices optimize legal data integrity first
The selected stack emphasizes reliable schema evolution, explicit typing, and compatibility with both human-facing and AI-agent-facing layers.

## Runtime and language stack
Core runtime components:
- Node.js `>=20.0.0`
- npm `>=10.0.0`
- TypeScript (strict mode)
- Next.js 16 + React 19

## Primary dependencies and roles
| Dependency | Role in project |
|---|---|
| `next` | Web runtime and routing shell |
| `react`, `react-dom` | UI rendering |
| `drizzle-orm` | Type-safe schema modeling |
| `pg` | PostgreSQL client for scripts/runtime integration |
| `drizzle-kit` | Schema/migration tooling support |
| `tsx` | TypeScript script execution (migrations and tooling) |
| `eslint`, `eslint-config-next` | Linting baseline |
| `tailwindcss`, `@tailwindcss/postcss` | Styling pipeline |

## Database and indexing stack
Database layer uses PostgreSQL with `pgvector` enabled. Search and retrieval foundations include:
- generated `tsvector` index for Portuguese full-text search;
- IVFFlat vector index for embedding similarity workflows.

## Build and quality toolchain
Key commands from `package.json`:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm test`

## External services currently referenced
- Railway PostgreSQL (connection through `DATABASE_URL`)
- GitHub Actions workflow using `DISCORD_PR_REVIEW_WEBHOOK`

## Upgrade posture
Dependency updates should be staged by risk:
1. patch upgrades for low-risk runtime/tooling;
2. minor upgrades after lint/build/test validation;
3. major upgrades only with explicit compatibility testing.

:::caution
Keep migration and schema tooling compatible before bumping DB-related dependencies. Stack upgrades that break migration flow have high operational impact.
:::
