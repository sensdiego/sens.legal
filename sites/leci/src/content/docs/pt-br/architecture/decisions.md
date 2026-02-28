---
title: "Decisões de Arquitetura"
description: "Decisões arquiteturais atuais e pendentes com racional, status e fronteiras de impacto."
lang: pt-BR
sidebar:
  order: 3
---


# Decisões de Arquitetura

## This page records high-impact technical choices
Architecture decisions in Leci should be explicit because legal data correctness is hard to recover after inconsistent implementation. This page summarizes current accepted decisions and pending decisions that influence roadmap sequencing.

## Accepted decisions
### DB-first product evolution
**Decision:** prioritize schema integrity and revision safety before advanced UI/API features.

**Why:** legal products degrade quickly when data correctness and traceability are weak.

**Impact:** database and migration artifacts are mature earlier than product endpoints.

### Controlled legal text mutation
**Decision:** legal text edits must flow through `leci.apply_revision()`.

**Why:** audit history is mandatory for trust, rollback analysis, and governance.

**Impact:** contributors must avoid direct SQL updates to critical text fields.

### Monolithic repository boundary
**Decision:** keep application, schema, scripts, and docs in one repository at current stage.

**Why:** team velocity and context-sharing are better while core model is still evolving.

**Impact:** future decomposition should happen only after API contracts stabilize.

## Pending decisions
These decisions remain open and block medium-term planning clarity:
- canonical roadmap source of truth (GitHub vs Linear vs hybrid)
- MVP search strategy scope (FTS-only vs hybrid from day one)
- ingestion depth for first production datasets
- MCP/agent integration timing and gating criteria

> ⚠️ **Unverified** — Final ownership and decision authority for cross-project sens.legal integrations need explicit confirmation.

<!-- NEEDS_INPUT: Confirm final governance model for roadmap source-of-truth and cross-project integration ownership. -->

## ADR workflow
Use `docs/adr/` for full decision records and keep this page as the summary index. When an accepted decision changes, add a superseding ADR rather than rewriting historical records.
