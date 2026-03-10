---
title: Glossary
description: Definitions of legal, technical, and domain-specific terms used throughout Juca.
lang: en
sidebar:
  order: 1
---

# Glossary

> Definitions of legal, technical, and domain-specific terms used throughout Juca and the sens.legal ecosystem.

## Legal Terms

| Term | Definition |
|------|-----------|
| **Acordao** | Appellate court decision — the primary document type in Juca's corpus. Each acordao has an ementa (summary), tese (thesis), and full text (integra). |
| **Dispositivo Legal** | A specific legal provision or article from legislation (e.g., Art. 927 do Codigo Civil). |
| **Ementa** | Summary or headnote of a court decision. Used as the primary search field in Juca's hybrid search. |
| **Integra** | Full text of a court decision. Accessed via SlideOver panel or exported to PDF. |
| **IRAC** | Issue, Rule, Application, Conclusion — a structured legal analysis framework used by the Ratio tool for extraction. |
| **Jurisprudencia** | Case law — the body of court decisions that forms binding or persuasive precedent. |
| **Ministro** | Minister (judge) of the STJ. Juca tracks which ministro authored each decision for divergence analysis. |
| **Parecer** | Formal legal opinion — one of the 4 delivery modes in the Briefing Progressivo. |
| **Precedente** | A previous court decision used as authority to support a legal argument. |
| **Ratio Decidendi** | The core legal reasoning or principle behind a decision — what makes it a precedent. |
| **STJ** | Superior Tribunal de Justica — Brazil's highest court for non-constitutional federal matters. Juca's corpus contains 23,400+ STJ decisions. |
| **Sumula** | Binding summary of consolidated jurisprudence issued by the STJ. Validated by Juca's anti-hallucination system. |
| **Tese** | Legal thesis or argument extracted from a decision. Searchable field in Juca's search engine. |
| **Turma** | Division or panel of the STJ that decided a case (e.g., 1a Turma, 2a Turma). |

## Technical Terms

| Term | Definition |
|------|-----------|
| **Block** | Typed UI content unit — the fundamental building block of Juca's interface. 11 types: `message`, `progress`, `diagnosis`, `action_prompt`, `precedent`, `precedent_picker`, `summary`, `risk_balance`, `chart`, `delivery`, `exit_card`. |
| **Block Factory** | Pure functions that create typed block data with defaults. Located in `src/lib/blocks/types.ts` (e.g., `createDiagnosisData()`, `createRiskBalanceData()`). |
| **Briefing Progressivo** | Juca's 4-phase progressive disclosure system: Diagnosis → Precedents → Risks → Delivery. Each phase reveals information incrementally based on user interaction. |
| **Composer** | Input component where users type queries and submit them. Supports tool hints and pipeline mode selection. |
| **G,C,R Pipeline** | Generate → Criticize → Revise — Juca's multi-LLM processing pattern where a generator creates content, critics evaluate it, and a revisor produces the final output. |
| **Hub** | Juca's architectural role: a lightweight frontend that orchestrates backend agents (Valter, Leci) rather than processing data locally. |
| **Liquid Legal** | The design language for Juca's UI. Palette: `bg-paper` (#F0F0EE), `ink-primary` (#1A161F), `accent` (#FFF06D). |
| **PhaseRail** | Visual navigation component showing briefing phase progress (4 phases as a vertical rail). |
| **SlideOver** | Sliding panel for viewing full decision text (integra) without leaving the current context. |
| **Tool Registry** | Pattern that routes user intents to specialized handler tools. 5 tools registered with priority-based selection: `analyzer` (9), `juris` (8), `ratio` (7), `compare` (5), `insights` (4). |
| **WorkCanvas** | Main content area that renders blocks in sequence. The primary viewport of the Unified Home interface. |

## Ecosystem Terms

| Term | Definition |
|------|-----------|
| **sens.legal** | The parent platform encompassing Juca, Valter, and Leci — an AI-powered legal analysis ecosystem. |
| **Valter** | Backend agent for STJ jurisprudence. Python/FastAPI service with 23,400+ decisions, 28 MCP tools, BM25 + semantic search, Neo4j knowledge graph, and multi-LLM pipeline. Production URL: `https://valter-api-production.up.railway.app`. |
| **Leci** | Backend agent for federal legislation. TypeScript/Next.js with Drizzle ORM. Currently in early development (v0.1-pre) with database schema ready but no public API yet. |
| **MCP** | Model Context Protocol — standardized interface for AI tool interaction. Valter exposes 28 MCP tools for search, verification, graph analysis, and ingestion. |
| **Adapter Layer** | Planned abstraction (v0.3) that provides a unified interface for Juca to communicate with any backend agent (Valter, Leci, future agents). |
