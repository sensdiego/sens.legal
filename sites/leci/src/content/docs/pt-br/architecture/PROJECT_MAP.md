---
title: "Snapshot Diagnóstico do Projeto"
description: "Snapshot técnico de baseline da estrutura, stack, riscos e maturidade do código no momento da análise."
lang: pt-BR
sidebar:
  order: 5
---


# Snapshot Diagnóstico do Projeto

## What this snapshot represents
This page captures the technical diagnosis that was used to bootstrap documentation and planning. It is intentionally static and should be treated as a dated baseline, not as a live source of truth.

## Observed maturity at snapshot time
The repository was assessed as an early-stage product with:
- strong database foundations;
- minimal user-facing UI;
- no implemented internal API routes;
- roadmap-heavy planned capabilities.

## Key verified technical facts
At snapshot time, the following were code-verified:
- Next.js + React + TypeScript stack in a monorepo-style single app repository.
- PostgreSQL schema `leci` with legal entities and revision audit model.
- FTS support via generated `tsvector` and GIN index.
- Vector search foundation via `pgvector` and IVFFlat indexing.
- Migration runner in `scripts/migrate.ts` applying ordered SQL files.

## Known constraints captured in the snapshot
The snapshot emphasized several constraints:
- the `document_nodes.content_text` integrity invariant through `leci.apply_revision()`;
- missing test suites despite a test command baseline;
- documentation and implementation drift risk for roadmap-defined features.

## How to use this artifact today
Use this page when you need historical context for why current docs/roadmap shape exists. For current implementation status, prefer:
- code in `src/`, `drizzle/`, and `scripts/`;
- live docs pages under architecture/features/configuration;
- latest planning artifacts.
