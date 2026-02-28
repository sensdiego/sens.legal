---
title: Content Map
description: Maps every documentation file to its content source, priority, and status.
lang: en
sidebar:
  order: 99
---

# Content Map

> Maps every documentation file to its content, source, and priority for the content-writing phase.

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Essential — must be complete before docs site goes live |
| **P1** | Important — should be complete for a useful docs site |
| **P2** | Can wait — nice to have, not blocking |

---

## Home & Getting Started

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `index.md` | Project overview, key capabilities, ecosystem diagram, quick links | ROADMAP.md, PROJECT_MAP.md | **P0** |
| `getting-started/introduction.md` | What is Juca, why it exists, ecosystem context, key concepts | ROADMAP.md "Visao do Produto", PROJECT_MAP.md §1, §5 | **P0** |
| `getting-started/quickstart.md` | 5-minute setup: clone, minimal .env, npm run dev, first interaction | README.md, PROJECT_MAP.md §4 | **P0** |
| `getting-started/installation.md` | Full setup: all services, Docker, Git hooks, troubleshooting | README.md, PROJECT_MAP.md §3-§4, docker-compose.yml | **P1** |

## Architecture

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `architecture/overview.md` | Hub architecture, entry points, data flow, responsibility matrix | PROJECT_MAP.md §5, ROADMAP.md | **P0** |
| `architecture/stack.md` | Full dependency table with versions, status, justifications | PROJECT_MAP.md §3, REORG_PLAN.md §2.3 | **P1** |
| `architecture/decisions.md` | 7 ADRs: Unified Home, SQLite, KG adapter, orchestrator decomp, briefing, hub pivot, Liquid Legal | PROJECT_MAP.md §8, ROADMAP.md decisions, docs/ui-reference.tsx | **P1** |
| `architecture/diagrams.md` | 6 Mermaid diagrams: ecosystem, components, query lifecycle, briefing flow, block types, deployment | PROJECT_MAP.md §5 diagrams, ROADMAP.md ecosystem | **P1** |
| `architecture/ecosystem.md` | sens.legal 3-project overview: Juca, Valter, Leci | ROADMAP.md ecosystem, Valter/Leci project exploration | **P0** |

## Features

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `features/index.md` | Feature inventory with status badges (implemented/in-progress/planned/deprecated) | ROADMAP.md features tables | **P0** |
| `features/block-system.md` | 11 block types, lifecycle, factory pattern, component reference, "adding new block" guide | PROJECT_MAP.md §2 §5, src/lib/blocks/types.ts, src/components/blocks/ | **P0** |
| `features/briefing/index.md` | Briefing Progressivo overview, phase flow, PhaseRail, implementation approach | ROADMAP.md, Issues #283-289 | **P0** |
| `features/briefing/phase-1-diagnosis.md` | F1 detail: diagnosis card, Valter endpoints, UX flow | Issue #285, src/actions/briefing.ts | **P1** |
| `features/briefing/phase-2-precedents.md` | F2 detail: precedent cards, selection, Valter search | Issue #286 | **P1** |
| `features/briefing/phase-3-risks.md` | F3 detail: risk balance, Contradição Estratégica, Valter graph | Issue #287, INNOVATION_LAYER.md | **P1** |
| `features/briefing/phase-4-delivery.md` | F4 detail: 4 delivery modes, exit card, PDF integration | Issue #288 | **P1** |
| `features/composer.md` | Composer UI, intent detection, tool registry, SSE streaming, clarification flow | PROJECT_MAP.md §2 §5, src/lib/unified/ | **P1** |
| `features/session-management.md` | Sessions, SQLite persistence, sidebar, server actions, known issues | PROJECT_MAP.md §2, src/lib/db/ | **P1** |
| `features/pdf-export.md` | PDF generation, API endpoint, future briefing PDF | src/lib/pdf/generator.ts, Issue #289 | **P2** |
| `features/auth.md` | NextAuth v5, Google OAuth, magic links, dev bypass, known issues | PROJECT_MAP.md §3 §4, src/lib/auth.ts | **P2** |
| `features/feature-flags.md` | Flag system, available flags, usage patterns | src/lib/featureFlags.ts | **P2** |

## Configuration

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `configuration/environment.md` | All 30+ env vars organized by category with descriptions and defaults | PROJECT_MAP.md §4 complete table | **P0** |
| `configuration/settings.md` | 11 config files reference: next.config, tsconfig, tailwind, vitest, playwright, etc. | REORG_PLAN.md §2.2, root config files | **P1** |
| `configuration/integrations.md` | External service setup: Valter, LLM providers, auth providers, Neo4j, Railway | PROJECT_MAP.md §3, ROADMAP.md | **P1** |

## Development

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `development/setup.md` | Dev environment setup, scripts, multi-agent workflow, important rules | README.md, CLAUDE.md, package.json | **P0** |
| `development/conventions.md` | Code style, naming, auth patterns, block creation, commit format, animations | patterns.md, CLAUDE.md | **P0** |
| `development/testing.md` | Test stack, running tests, organization, writing unit/E2E tests, coverage status | PROJECT_MAP.md §9, patterns.md "Test Patterns" | **P1** |
| `development/contributing.md` | Branching, PR guidelines, AI agent rules, architecture principles | CLAUDE.md, agent_docs/ | **P1** |

## API Reference

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `api/index.md` | API architecture overview, route groups table, auth pattern | PROJECT_MAP.md §2 | **P1** |
| `api/valter-adapter.md` | Valter adapter layer, endpoints table, auth, request/response mapping | ROADMAP.md, Valter API exploration | **P0** |
| `api/unified.md` | Unified endpoints: sessions CRUD, analyze, SSE stream | src/app/api/unified/, src/app/api/v2/ | **P1** |
| `api/briefing.md` | Briefing server actions, PDF export, transitional endpoints list | src/actions/briefing.ts | **P2** |
| `api/export.md` | PDF export endpoint detail, generation internals | src/app/api/export/, src/lib/pdf/ | **P2** |

## Roadmap

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `roadmap/index.md` | Strategic direction, current milestone, overview table, pending decisions | ROADMAP.md | **P0** |
| `roadmap/milestones.md` | Detailed v0.3–v1.0 milestone breakdowns with features and criteria | ROADMAP.md milestones | **P1** |
| `roadmap/changelog.md` | History: rewrite (Waves 0-5), cleanup, KG migration, auth, origins | MEMORY.md, REORG_PLAN.md, PROJECT_MAP.md | **P2** |

## Reference

| File | Content | Source | Priority |
|------|---------|--------|----------|
| `reference/glossary.md` | Legal terms (STJ, sumula, acordao, etc.) + technical terms (block, hub, etc.) | Codebase, Brazilian legal system | **P1** |
| `reference/faq.md` | Common questions about architecture, development, troubleshooting | All docs sources | **P2** |
| `reference/troubleshooting.md` | Install issues, runtime errors, test failures, build rules | Common issues, PROJECT_MAP.md §10 | **P1** |

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 12 | Essential for docs launch — overview, architecture, key features, setup, config |
| **P1** | 17 | Important for completeness — detailed features, ADRs, testing, integrations |
| **P2** | 7 | Can wait — PDF export, auth details, FAQ, changelog, briefing endpoints |
| **Total** | **36** | |

---

## Legacy Docs — Resolution

| File | Status | Resolution |
|------|--------|------------|
| `docs/SEMANTIC_SEARCH_SETUP.md` | Archived | Moved to `_archive/docs/`. Transitional content (local embedding service being replaced by Valter). |
| `docs/LOGGER_USAGE.md` | Archived | Moved to `_archive/docs/`. Logger usage documented in conventions. |
| `docs/truncation-audit.md` | Archived | Previously archived. Historical — no longer relevant post-Valter migration. |
| `docs/ANALYZER_CONSOLIDATED_SPEC.md` | Absorbed | Key parts absorbed into `features/composer.md` (analyzer section). |
| `docs/api-response.md` | Absorbed | Absorbed into `api/index.md` (Response Envelope section). Archived. |
| `docs/orchestrator-diagnostics.md` | Archived | Moved to `_archive/docs/`. Transitional (orchestrator pipeline moving to Valter). |
| `docs/database-architecture-decisions.md` | Absorbed | Content absorbed into `architecture/decisions.md` (ADR-002). |
| `docs/ui-reference.tsx` | Kept | Design reference — referenced by ADR-007 and features docs. |
