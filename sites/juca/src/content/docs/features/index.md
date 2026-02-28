---
title: "Features"
description: "Complete feature inventory with implementation status, milestone assignments, and links to detailed documentation."
lang: en
sidebar:
  order: 1
---

# Features

This page inventories every feature in Juca with its current status. Features are organized by lifecycle stage: implemented, in progress, planned, and deprecated.

## Status Legend

| Badge | Meaning |
|-------|---------|
| ✅ Implemented | Fully functional in production |
| 🔨 In Progress | Partially implemented, active development |
| 📋 Planned | Designed but not yet started |
| ⚠️ Transitional | Works but will be removed/replaced during Valter migration |
| ❌ Deprecated | Removed or superseded |

## Core Features

| Feature | Status | Milestone | Docs |
|---------|--------|-----------|------|
| [Block System](/features/block-system) (11 types) | ✅ Implemented | — | [Details](/features/block-system) |
| [Briefing Progressivo](/features/briefing/) (4 phases) | 🔨 In Progress | v0.4 | [Details](/features/briefing/) |
| [Composer + Intent Detection](/features/composer) | ✅ Implemented | — | [Details](/features/composer) |
| [Session Management](/features/session-management) | ✅ Implemented | — | [Details](/features/session-management) |
| [PDF Export](/features/pdf-export) | ✅ Implemented | — | [Details](/features/pdf-export) |
| [Authentication](/features/auth) (NextAuth v5) | ✅ Implemented | — | [Details](/features/auth) |
| [Feature Flags](/features/feature-flags) | ✅ Implemented | — | [Details](/features/feature-flags) |
| SSE Streaming | ✅ Implemented | — | [Composer](/features/composer) |
| OpenTelemetry tracing | ✅ Implemented | — | [Integrations](/configuration/integrations) |
| Docker + Railway deploy | ✅ Implemented | — | [Installation](/getting-started/installation) |
| CI (GitHub Actions) | ✅ Implemented | — | [Testing](/development/testing) |

## Transitional Features (Moving to Valter)

These features exist in Juca's local backend but are being replaced by Valter API calls:

| Feature | Current Location | Valter Replacement | Removal |
|---------|-----------------|-------------------|---------|
| Hybrid Search (BM25 + Semantic + KG) | `src/lib/backend/search/` | `/v1/retrieve` | v0.4 |
| Multi-LLM Pipeline (G,C,R) | `src/lib/backend/llm/`, `chat-pipeline/` | Valter internal pipeline | v0.4 |
| IRAC Extraction | `src/lib/backend/reasoning/` | Valter internal | v0.4 |
| Knowledge Graph adapter | `src/lib/backend/kg/` | `/v1/graph/*` | v0.4 |
| Anti-Hallucination Validation | `src/lib/validation/` | `/v1/verify` | v0.4 |
| Case Analyzer pipeline | `src/lib/backend/analyzer/` | Adapted to call Valter | v0.4 |

## Planned Features

| Feature | Priority | Milestone | Issue |
|---------|----------|-----------|-------|
| UI Reset (Liquid Legal design) | P0 | v0.3 | [#273](https://github.com/sensdiego/juca/issues/273) |
| Valter adapter layer | P0 | v0.3 | [#292](https://github.com/sensdiego/juca/issues/292) |
| Juca → Valter integration | P0 | v0.3 | [#293](https://github.com/sensdiego/juca/issues/293) |
| Fix 72 failing tests | P1 | v0.3 | [#270](https://github.com/sensdiego/juca/issues/270) |
| Briefing F1–F4 complete | P1 | v0.4 | [#285](https://github.com/sensdiego/juca/issues/285)–[#288](https://github.com/sensdiego/juca/issues/288) |
| Briefing PDF | P1 | v0.4 | [#289](https://github.com/sensdiego/juca/issues/289) |
| Remove duplicated backend | P1 | v0.4 | [#295](https://github.com/sensdiego/juca/issues/295) |
| Divergence comparison | P2 | v0.5 | [#155](https://github.com/sensdiego/juca/issues/155) |
| Memo export (PDF/DOCX) | P2 | v0.5 | [#158](https://github.com/sensdiego/juca/issues/158) |
| E2E in CI | P2 | v0.5 | — |
| Leci integration | P2 | v0.6+ | — |
| LLM cost ledger | P3 | v0.6+ | [#232](https://github.com/sensdiego/juca/issues/232) |
| SQLite → PostgreSQL | P3 | v0.6+ | [#231](https://github.com/sensdiego/juca/issues/231) |
| Skills Platform | P3 | v1.0+ | [#193](https://github.com/sensdiego/juca/issues/193) |

## Deprecated Features

| Feature | Reason | Replaced By |
|---------|--------|-------------|
| Tab-based navigation (6 tabs) | Replaced in rewrite | Unified Home + Block System |
| Panel system (`_panels/`, 8 panels) | Removed in rewrite | Block System |
| Zustand stores (11 stores) | Removed in rewrite | React `useState` + Server Actions |
| Juca Semantic (embedding search) | Never production-ready | Valter `/v1/retrieve` |
| Juca Compare (multi-model) | Low priority with hub focus | May return via Valter |
| Juca Insights (analytics) | Low priority | Valter graph endpoints |
| Local backend (search/LLM/KG) | Duplicated by Valter | Valter REST API |
