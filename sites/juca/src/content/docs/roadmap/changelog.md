---
title: Changelog
description: History of significant changes, milestones, and architectural shifts.
lang: en
sidebar:
  order: 3
---

# Changelog

> History of significant changes, completed milestones, and architectural shifts in the Juca project.

## 2026-02-28 — Structural Cleanup & Documentation

**Strategic planning and cleanup phase:**

- Created `PROJECT_MAP.md` — comprehensive technical diagnostic of the entire codebase
- Created `ROADMAP.md` — product roadmap with milestones v0.3 through v1.0
- Created `REORG_PLAN.md` — structural reorganization assessment
- Created `INNOVATION_LAYER.md` — innovation proposals for future development
- Removed 4 phantom dependencies: `zustand`, `@tanstack/react-virtual`, `next-pwa`, `resend` (290 packages removed)
- Deleted empty `src/stores/` directory (leftover from Zustand removal)
- Removed ~76MB of redundant backup files from `data/`
- Archived 4 obsolete documentation files to `_archive/`
- Created standardized documentation structure under `docs/` (36 files)

## 2026-02-25 — Rewrite Complete (Waves 0-5)

**Major architectural rewrite** migrating from tab-based navigation to the Unified Home + Block System:

- **Wave 0 (Foundation):** Block type system, factory functions, database schema
- **Wave 1 (Core Components):** WorkCanvas, PhaseRail, Composer, SessionSidebar
- **Wave 2 (Briefing Logic):** Server actions for 4-phase briefing flow, state machine
- **Wave 3 (Block Renderers):** 11 block type renderers with interactive elements
- **Wave 4 (Integration):** Unified Home page, SSE streaming, feature flags
- **Wave 5 (Testing):** 1,722 unit tests across 124 test files, 60 E2E tests across 8 spec files

**Removed:**
- Tab-based navigation (Chat, Juris, Ratio, Compare, Insights, Semantic)
- Panel system (`_panels/`, 8 lazy-loaded panels)
- Zustand state management (11 stores → React `useState` + Server Actions)

**Tags:** `wave-0-foundation` through `wave-5-final`, `pre-kill-switch`

## 2026-02 — Knowledge Graph Migration to Neo4j

- Implemented adapter pattern supporting both JSON and Neo4j backends
- Feature flag: `KG_PROVIDER=json|neo4j`
- Neo4j Aura free tier deployed in production
- 6,000+ nodes, 104,000+ relationships
- Issue #253

## 2026-01 — Authentication Implementation

- NextAuth v5 with Google OAuth + Resend magic links
- JWT-based sessions (no database session table)
- Dev bypass mode (`ENABLE_DEV_AUTH=true`)
- `isAdmin()` check for administrative operations
- Issue #226

## Earlier History

**Project origins:** Juca started as a fullstack Next.js application for STJ jurisprudence analysis. The initial corpus contained 1,556 decisions, later expanded to 23,400+ via Valter.

**Original architecture:**
- Embedded hybrid search (BM25 + semantic + KG fusion)
- Multi-LLM pipeline (Generate → Criticize → Revise) with 5 providers
- IRAC extraction (Issue, Rule, Application, Conclusion)
- Knowledge graph with Neo4j + JSON adapter
- Anti-hallucination validation (sumulas, ministros, processos)

This architecture is now transitioning to a hub model where Juca focuses on frontend orchestration and Valter handles the backend intelligence.
