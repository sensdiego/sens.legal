---
title: "Introduction"
description: "What Juca is, why it exists, and how it fits into the sens.legal legal AI ecosystem."
lang: en
sidebar:
  order: 1
---

# Introduction

Juca (Jurisprudence Understanding for Contextual Analysis) is the frontend hub for the **sens.legal** platform — a legal AI ecosystem designed to replace fragmented research tools with a single, intelligent interface for Brazilian legal professionals.

## The Problem

Brazilian legal research is fragmented across dozens of disconnected tools. Lawyers spend hours searching court databases, cross-referencing decisions, and manually extracting legal reasoning — only to produce analyses that may miss critical precedents or contain hallucinated citations from AI tools.

Existing AI legal tools either lack domain depth (generic chatbots) or lack usability (dump raw results without structure). None provide adversarial analysis, progressive disclosure, or graph-based reasoning traces.

## The Solution

Juca is a **conversational frontend hub** — not a monolithic application. It provides:

1. **A clean, Fintool/Perplexity-style interface** where lawyers type natural-language queries
2. **Progressive disclosure** via the Briefing Progressivo (4-phase system that reveals analysis incrementally)
3. **Orchestration** of specialized backend agents that handle the heavy lifting (search, LLM processing, knowledge graph queries)
4. **Structured output** through the Block System — 11 typed UI blocks that render diagnoses, precedents, risk analyses, and strategic recommendations

Juca itself is intentionally lightweight. The intelligence lives in the backend agents.

## The Ecosystem

sens.legal consists of four projects, each with a distinct responsibility:

| Project | Role | Stack | Status |
|---------|------|-------|--------|
| **Juca** (this project) | Frontend hub + lightweight orchestrator | Next.js 16, React 19, TypeScript, Tailwind v4 | Active development (v0.3) |
| **Valter** | Central jurisprudence and reasoning backend | Python, FastAPI, PostgreSQL, Qdrant, Neo4j Aura, Redis | Production and absorbing backend responsibilities from Juca |
| **Leci** | Document-first legislation engine for reliable grounding | TypeScript, Next.js, Drizzle ORM, PostgreSQL + pgvector | Operational baseline with `/api/search`, functional shell, and real-data validation |
| **Douto** | Local doctrine pipeline that supplies doctrinal artifacts to Valter | Python pipeline + markdown knowledge base | Internal data-production layer |

Juca primarily communicates with Valter via REST API while the backend migration out of Juca is completed. Leci is the legislation layer when grounding against normative text is needed, and Douto contributes doctrine artifacts through Valter rather than acting as a standalone end-user product.

## Who Is This For?

This documentation serves four audiences:

- **Legal professionals** — End users who interact with the Juca interface to research case law
- **Developers** — Engineers contributing to the codebase (human or AI)
- **AI agents** — Claude Code, Codex, and future agents that operate on the codebase via CLAUDE.md instructions
- **Stakeholders** — The project owner and potential investors evaluating the platform

## Key Concepts

Before diving deeper, familiarize yourself with these core concepts:

| Concept | Definition |
|---------|-----------|
| **Block** | A typed UI content unit. Juca has 11 block types (message, diagnosis, precedent, risk_balance, delivery, etc.). Blocks are the fundamental building unit of the interface. |
| **Briefing Progressivo** | A 4-phase progressive disclosure system: Diagnosis → Precedents → Risks → Delivery. Each phase produces specific block types. |
| **WorkCanvas** | The main content area that renders blocks in sequence. |
| **Composer** | The input component where users type queries. Behind it, an intent detector routes queries to specialized tools. |
| **PhaseRail** | A visual navigation rail showing the current briefing phase and allowing navigation between completed phases. |
| **Tool Registry** | A pattern that maps detected user intents to specialized handler functions (juris, ratio, analyzer, compare, insights). |
| **Hub** | Juca's architectural role — a thin frontend that delegates backend intelligence to Valter and coordinates the broader ecosystem. |

## Next Steps

- **[Quickstart](/getting-started/quickstart)** — Get Juca running locally in 5 minutes
- **[Architecture Overview](/architecture/overview)** — Understand how the pieces fit together
- **[Block System](/features/block-system)** — Learn about the core UI composition unit
