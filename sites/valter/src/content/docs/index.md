---
title: Valter — Legal Knowledge Backend
description: Central backend for jurisprudence retrieval, reasoning, verification, and MCP consumption.
lang: en
sidebar:
  order: 0
---

# Valter

> The central legal knowledge backend of the sens.legal ecosystem — serving Brazilian STJ jurisprudence through REST API and MCP.

## What is Valter?

Valter is the backend where jurisprudence retrieval, verification, and reasoning are being centralized for the ecosystem. It transforms STJ decisions into structured legal knowledge that can be consumed by frontend applications, internal workflows, and MCP-compatible LLMs.

Its architecture combines PostgreSQL, Qdrant, Neo4j, and Redis, but the important point is not the list of stores. The important point is the current retrieval paradigm: **graph-led retrieval**. The knowledge graph is no longer described as a small optional boost layered on top of search. It is a primary path for discovery and explainability, with lexical and semantic search acting as complementary retrieval signals and graceful fallback paths.

Valter also owns the anti-hallucination and explainability layer of the ecosystem. Consumers use it to retrieve precedents, verify references, compare similar cases, inspect divergences, and obtain reasoning traces that stay grounded in tribunal data.

## Quick Links

- **[Getting Started](/getting-started/quickstart)** — Docker setup, first API call, first MCP connection
- **[Architecture Overview](/architecture/overview)** — Modular monolith, dependency rule, and runtime boundaries
- **[Technology Stack](/architecture/stack)** — Python, FastAPI, and the four-store runtime architecture
- **[API Reference](/api/)** — REST endpoints for retrieval, verification, graph analytics, and ingestion
- **[MCP Tools](/api/mcp-tools)** — The MCP surface exposed by Valter
- **[Search and Retrieval](/features/hybrid-search)** — Current retrieval model and how graph-led search works
- **[Architecture Decisions](/architecture/decisions)** — ADRs documenting key choices and their rationale
- **[Glossary](/reference/glossary)** — Legal and technical terms used throughout the project

## Part of sens.legal

Valter is one of four projects in the sens.legal ecosystem:

| Project | Role |
|---------|------|
| **Juca** | Frontend hub for lawyers and user-facing orchestration |
| **Valter** | Central backend for jurisprudence retrieval, reasoning, verification, and MCP |
| **Leci** | Document-first legislation engine for reliable grounding |
| **Douto** | Local doctrine pipeline that supplies doctrinal artifacts to Valter |

This also means Valter is the destination of the ongoing backend migration out of Juca. Search, reasoning, and related backend concerns are being moved into Valter so the frontend can stay focused on user experience and orchestration.

## What Valter is responsible for

- retrieval over STJ jurisprudence
- graph-led reasoning and explainability
- verification against tribunal data
- MCP and REST access for external consumers
- ingest and enrichment pipelines that support the knowledge layer

## What Valter is not responsible for

- being the frontend hub for lawyers, which belongs to Juca
- being the legislation authority, which belongs to Leci
- being the standalone doctrine product, which is not Douto's role either

Instead, Valter is the central jurisprudence and reasoning backend that coordinates with the rest of the ecosystem.
