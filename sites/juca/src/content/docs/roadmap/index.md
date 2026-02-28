---
title: Roadmap
description: Product roadmap overview with current milestone status and strategic direction.
lang: en
sidebar:
  order: 1
---

# Roadmap

> Product roadmap for Juca — the frontend hub of the sens.legal ecosystem.

## Strategic Direction

Juca is pivoting from a fullstack monolith to a **lightweight frontend hub** for the sens.legal ecosystem. Backend intelligence (search, LLM pipeline, knowledge graph, validation) is being delegated to specialized agents: **Valter** for STJ jurisprudence and **Leci** for federal legislation. Juca's role is to provide an elegant, conversational interface (Fintool/Perplexity-style) that orchestrates these agents, manages user sessions, and delivers results through the Briefing Progressivo (4-phase progressive disclosure system).

## Current Milestone

**v0.3 — "Hub Foundation"** is in progress. Key deliverables:

- UI reset with Fintool/Perplexity-style design (Liquid Legal design language)
- Adapter layer for external agents (Valter, Leci, future agents)
- Juca → Valter integration (search, verify, graph endpoints)
- Fix 72 failing test files (#270)
- Update README.md to reflect hub architecture

See [Milestones](/roadmap/milestones) for full details on all milestones.

## Milestone Overview

| Milestone | Name | Status | Focus |
|-----------|------|--------|-------|
| **v0.3** | Hub Foundation | In Progress | UI reset + Valter integration |
| **v0.4** | Briefing Progressivo | Planned | 4-phase briefing with Valter as backend |
| **v0.5** | Polish & Expand | Planned | Graph features, memo export, E2E in CI |
| **v0.6+** | Multi-Agent Platform | Planned | Leci integration, scale preparation |
| **v1.0** | Platform Release | Planned | Multi-tenancy, billing, public launch |

## Pending Architectural Decisions

| # | Question | Impact | Status |
|---|----------|--------|--------|
| 1 | How does Juca authenticate with Valter? (Single key vs per-user vs service token) | Adapter layer (v0.3) | Pending |
| 3 | What happens with ~55 API routes post-migration? (Remove vs proxy vs fallback) | Codebase size (v0.4) | Pending |
| 4 | Keep SQLite for sessions or migrate to Postgres? | Aligns with ecosystem | Pending (can wait for v0.6+) |
| 7 | What to do with local `data/` directory (~80MB)? | Repo size | Pending (keep until v0.4) |

Decisions #2 (UI template), #5 (briefing scope), and #6 (Valter deployment) have been resolved. See [Architecture Decisions](/architecture/decisions) for details.

## Detailed Pages

- [Milestones](/roadmap/milestones) — Detailed milestone breakdowns with features, criteria, and dependencies
- [Changelog](/roadmap/changelog) — History of significant changes and architectural shifts
