---
title: Valter — Legal Knowledge Backend
description: Backend powering legal reasoning for LLMs and lawyers, serving STJ jurisprudence via REST API and MCP.
lang: en
sidebar:
  order: 0
---

# Valter

> The legal knowledge backend for the Diego Sens ecosystem — serving Brazilian STJ jurisprudence via REST API and Model Context Protocol (MCP).

## What is Valter?

Valter is a specialized backend that transforms raw legal data from Brazil's Superior Tribunal de Justica (STJ) into structured, verifiable legal knowledge. It combines four purpose-built data stores — PostgreSQL for documents and metadata, Qdrant for semantic vector search, Neo4j for a knowledge graph of legal relationships, and Redis for caching — to deliver hybrid search with knowledge-graph boosting, anti-hallucination verification, and graph analytics across tens of thousands of court decisions.

Unlike general-purpose legal search engines that treat decisions as isolated text blobs, Valter connects decisions through a knowledge graph based on the FRBR ontology. Criteria, legal devices, precedents, and ministers are linked as first-class graph entities, enabling queries like "which legal arguments have the highest success rate for this minister in this category" or "how has the application of this criterion evolved over the last five years." Every claim returned by the system is traceable to a specific graph node or verified against real tribunal data.

Valter is MCP-native: 28 tools are exposed via the Model Context Protocol, allowing LLMs like Claude and ChatGPT to query jurisprudence, verify references, analyze divergences, and compose arguments directly. The same capabilities are available through a REST API for traditional frontend consumption.

## Key Numbers

| Metric | Value |
|--------|-------|
| STJ decisions in knowledge graph | ~28,000 |
| Relations between legal entities | 207,000+ |
| STJ metadata records | 810,225 |
| Classified document features | 2,119 |
| Semantic vectors (768-dim) | ~3,673 |
| MCP tools for LLM integration | 28 |
| Graph analytics endpoints | 12 |
| Data stores | 4 (PostgreSQL, Qdrant, Neo4j, Redis) |
| REST API routers | 11 |
| Ingestion workflow endpoints | 17 |

## Quick Links

- **[Getting Started](/getting-started/quickstart)** — Docker setup, first API call, first MCP connection
- **[Architecture Overview](/architecture/overview)** — Modular monolith, dependency rule, 4 runtimes
- **[Technology Stack](/architecture/stack)** — Python, FastAPI, 4 databases, and why each was chosen
- **[API Reference](/api/)** — REST endpoints for search, verification, graph analytics, and ingestion
- **[MCP Tools](/api/mcp-tools)** — All 28 tools available to Claude, ChatGPT, and other MCP clients
- **[Features](/features/)** — Hybrid search, graph analytics, anti-hallucination, and more
- **[Architecture Decisions](/architecture/decisions)** — ADRs documenting key choices and their rationale
- **[Glossary](/reference/glossary)** — Legal and technical terms used throughout the project

## Part of sens.legal

Valter is one of three projects that form the sens.legal ecosystem:

| Project | Role | Stack | Status |
|---------|------|-------|--------|
| **Valter** | Legal knowledge backend — jurisprudence from STJ, served via REST API and MCP | Python, FastAPI, PostgreSQL, Qdrant, Neo4j, Redis | In production |
| **Leci** | Legislation backend — Brazilian statutes and norms as a complementary data source | Planned | Integration planned for v2.0 |
| **Juca** | Frontend for lawyers — the interface through which legal professionals interact with the ecosystem | Next.js | In development |

Valter acts as the knowledge engine: Juca calls Valter's REST API for search and analysis, while Claude and ChatGPT connect through MCP to use the same capabilities as tools in their reasoning process. When Leci is integrated, Valter will be able to cross-reference jurisprudence with the specific legislative provisions being applied, closing the loop between how courts interpret the law and what the law actually says.
