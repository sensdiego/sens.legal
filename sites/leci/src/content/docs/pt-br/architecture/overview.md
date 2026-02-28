---
title: "Visão Geral da Arquitetura"
description: "Resumo da arquitetura do sistema com componentes atuais, fluxo de dados e limites de evolução planejados."
lang: pt-BR
sidebar:
  order: 1
---


# Visão Geral da Arquitetura

## Leci uses a DB-first monolithic architecture
Leci currently runs as a single Next.js repository where PostgreSQL is the core system of record and the app layer is intentionally lightweight. This architecture prioritizes legal data integrity and traceability before expanding product surfaces.

## Current implemented components
The codebase currently includes these operational components:
- Next.js App Router shell (`src/app/layout.tsx`, `src/app/page.tsx`)
- Drizzle schema definitions (`src/db/schema.ts`)
- SQL migrations (`drizzle/*.sql`)
- migration execution script (`scripts/migrate.ts`)
- CI notification workflow (`.github/workflows/pr-review-notify.yml`)

## Current data flow
The current runtime flow is straightforward:
1. migrations are applied to PostgreSQL via `npx tsx scripts/migrate.ts`;
2. app server starts via `next dev`/`next start`;
3. homepage renders static UI copy;
4. legal-domain operations are represented at data layer, not exposed through API routes yet.

## Data model responsibilities
The schema separates legal concerns into explicit tables:
- `regulation_types` and `regulations` for top-level legal documents;
- `document_nodes` for hierarchical legal text and search vector generation;
- `embeddings` for semantic search groundwork;
- `suggestions` and `revisions` for controlled correction and auditability.

## Architectural invariants
The most important invariant is revision safety for legal text changes.

:::danger
Never mutate `document_nodes.content_text` directly. Apply legal text changes through `leci.apply_revision()` to preserve revision history integrity.
:::

## Planned architecture expansion
> 🚧 **Planned Feature** — Internal API and search service layers are planned but not implemented in current code.

> 🚧 **Planned Feature** — Source ingestion automation and richer UI workflows are roadmap milestones, not current runtime behavior.

## Operational constraints
Current architecture carries practical constraints:
- migration rerun safety depends on SQL idempotence (no migrations history table in script);
- testing coverage is not yet implemented at suite level;
- production-grade observability and SLO enforcement are roadmap work.
