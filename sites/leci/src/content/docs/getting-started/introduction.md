---
title: "Introduction to Leci"
description: "What Leci is, who it serves, and what is implemented today versus planned."
lang: en
sidebar:
  order: 10
---

# Introduction to Leci

> This page explains what Leci is, why it exists, who should use it, and how to interpret its current maturity.

## Leci solves legal retrieval trust and structure problems
Leci is a legal-information platform focused on Brazilian federal legislation, designed to make legal text retrieval more structured, traceable, and ready for both human and AI-agent consumption. The codebase already reflects this goal in the data model: regulations are represented as hierarchical document nodes, with full-text and vector-search foundations plus a revision audit trail.

In practical terms, Leci addresses three common pain points:
- Finding the right legal content quickly in a structured format, not only as raw pages.
- Preserving traceability when legal text is corrected or revised.
- Preparing legal content for downstream systems (APIs, agents, and product surfaces) without rebuilding the data layer every time.

## Leci exists to become trustable legal infrastructure, not just a UI
The current architecture indicates a deliberate "DB-first" strategy: schema design, indexing, and revision safety were prioritized before rich product surfaces. This is visible in the implemented artifacts:
- `src/db/schema.ts` defines core entities such as `regulations`, `document_nodes`, `embeddings`, `suggestions`, and `revisions`.
- `drizzle/0001_init.sql` creates the same core model in PostgreSQL and includes indexing for FTS and vectors.
- `scripts/migrate.ts` provides deterministic migration execution using ordered SQL files.

This design choice matters because legal products fail quickly when data integrity is weak. Leci is currently optimizing for integrity and future evolvability.

## What is implemented today (code-verified)
The current implementation is intentionally narrow and verifiable from source code.

### Database foundation is implemented
The PostgreSQL schema in the `leci` namespace is in place, including:
- canonical regulation types;
- regulation metadata;
- hierarchical legal text nodes;
- full-text index support (`tsvector` + GIN);
- vector embedding storage (`vector(768)` + IVFFlat index);
- suggestions and revision history.

### Revision safety primitive is implemented
A key invariant exists at database level: legal text updates must go through `leci.apply_revision(...)`, which logs old/new values and updates revision history.

:::danger
Do not update `document_nodes.content_text` directly in SQL or application code. The project invariant requires using `leci.apply_revision(...)` so edits stay auditable.
:::

### Web application surface is minimal
The Next.js application currently renders a minimal homepage (`src/app/page.tsx`) and does not yet expose internal API routes for legal search.

### Tooling baseline is available
`package.json` includes scripts for development, build, lint, and tests (`node --test`, currently with no test files yet).

## What is planned versus already available
The roadmap contains significant planned capabilities that are not implemented in this repository yet.

> 🚧 **Planned Feature** — Internal search/API layer for legal retrieval is roadmap scope, not current code.

> 🚧 **Planned Feature** — Rich web flows (search, browse, read) are planned milestones, while current UI is only a landing page.

> 🚧 **Planned Feature** — Ingestion from legal source providers (e.g., Planalto/LexML) is discussed in planning documents but not implemented in this codebase.

When writing or consuming technical docs, always separate:
- **current behavior** (code-verified), and
- **planned behavior** (roadmap-approved, future work).

## Who this documentation is for
This documentation is written for four audiences with different goals.

### Project owner and decision-makers
You need execution clarity: what is implemented, what is risky, and what should be prioritized next.

### Investors and strategic stakeholders
You need credible signal: technical foundations, roadmap discipline, and risk controls.

### Future developers
You need reproducible setup, architecture constraints, and contribution-safe workflows.

### AI agents and automation systems
You need machine-parseable, stable, and explicit docs that distinguish facts from plans.

:::tip
If you are integrating an AI agent, start from code-verified sections first (setup, schema, invariants), then add planned capabilities incrementally.
:::

## Relationship with the sens.legal ecosystem
Leci is part of a 3-project sens.legal domain according to project context, and is positioned as the legal-data layer in that ecosystem.

> ⚠️ **Unverified** — The exact integration contracts, sequencing, and ownership boundaries across the other two projects need confirmation from the project owner.

<!-- NEEDS_INPUT: Provide official names and integration contracts for the other two sens.legal projects, including ownership boundaries and data/API responsibilities. -->

Until those contracts are confirmed, this documentation treats Leci as a standalone product with planned multi-project integration.

## How to use this docs section
Use the `getting-started` section in this order:
1. `quickstart.md` for the fastest local run.
2. `installation.md` for full setup, CI-style validation, and troubleshooting.
3. `development/setup.md` for daily contribution workflow.
