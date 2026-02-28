---
title: "Introduction"
description: "What Valter is, why it exists, who it serves, and what makes it different from every other legal tech platform."
lang: en
sidebar:
  order: 1
---

# Introduction

Valter is a legal knowledge backend that serves Brazilian STJ jurisprudence through a REST API and Model Context Protocol (MCP) server. It transforms raw court decisions into structured, verified, composable legal reasoning — enabling LLMs and lawyers to query precedents, analyze divergences between ministers, and compose arguments backed by a knowledge graph.

Valter is part of the [sens.legal](https://sens.legal) ecosystem, alongside Leci (legislation) and Juca (frontend for lawyers).

## Why Valter exists

LLMs are powerful legal research assistants, but they have a fundamental problem: **they hallucinate legal references**. An LLM will confidently cite a Súmula that doesn't exist, attribute a decision to the wrong minister, or invent a process number that was never filed.

Valter exists to solve this. Instead of letting LLMs generate legal knowledge from their training data, Valter provides a structured knowledge backend where every reference is traceable to real tribunal data. When an LLM uses Valter as a tool (via MCP), it can:

- **Search** jurisprudence with hybrid retrieval (lexical + semantic + knowledge graph)
- **Verify** that any legal reference actually exists before presenting it to a user
- **Compose** arguments from patterns of success found in the knowledge graph
- **Understand** who judges what, and how their positions diverge over time

## What Valter knows

Valter's knowledge base is built from public STJ (Superior Tribunal de Justiça) data:

| Store | Records | What it contains |
|-------|---------|-----------------|
| PostgreSQL | ~23,400 decisions | Full text, ementas, metadata, AI-extracted features |
| Neo4j | ~28,500 nodes, ~207,000 edges | Decisions connected by criteria, dispositivos, precedents |
| Qdrant | ~3,700 vectors (768-dim) | Semantic embeddings for similarity search |
| PostgreSQL | ~810,000 metadata records | Raw STJ tribunal metadata |

:::note
The vector coverage gap (3,700 out of 23,400 documents) is a known issue being addressed in milestone v1.0. See the [Roadmap](/roadmap/) for details.
:::

## Who uses Valter

Valter serves three types of consumers through two protocols:

### REST API consumers (port 8000)

**Juca** is a Next.js frontend for lawyers that consumes Valter's REST API directly. It provides a user-friendly interface for searching jurisprudence, analyzing cases, and reviewing AI-generated insights.

### MCP consumers

**Claude Desktop and Claude Code** connect via MCP stdio — a direct process-level connection that requires no network. Configuration is a single entry in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "cwd": "/path/to/Valter"
    }
  }
}
```

**ChatGPT** connects via MCP remote — an HTTP/SSE server running on port 8001 with HMAC authentication. This is deployed on Railway alongside the main API.

All three consumers access the same 28 MCP tools and the same underlying data stores.

## What makes Valter different

Most legal tech platforms are search engines with a legal skin. Valter is a **knowledge graph with a reasoning layer**. Here's how that difference plays out:

| What others do | What Valter does |
|----------------|-----------------|
| Search by keywords | Hybrid search: BM25 lexical + semantic vectors + knowledge graph boost + cross-encoder reranking |
| Return a list of similar cases | Compose arguments from success patterns in the graph — which criteria lead to which outcomes, with what success rate |
| "The jurisprudence says..." | "REsp 1.234.567 says X, verified against tribunal data, cited 14 times in the graph, applied by Minister Y in 73% of category Z cases" |
| Treat all decisions as equal | Temporal intelligence — recent decisions weighted higher, trend detection (growing, declining, stable) |
| Ignore who judges | Minister profiles — per-minister success rates, active divergences, behavioral patterns |
| Hallucinate references | Anti-hallucination verification: every súmula, minister name, process number, and legislation reference checked against real data |
| Closed, proprietary systems | MCP-native — any MCP-compatible LLM can use Valter as a tool |
| Documents as text blobs | Knowledge graph — decisions connected by criteria, dispositivos, precedents, and legislation in a FRBR-based ontology |

## Core capabilities

Valter's capabilities are organized into six domains:

### Search and retrieval

The search pipeline combines five strategies into a single query flow. A search request hits BM25 lexical matching and Qdrant semantic similarity in parallel, merges results via weighted scoring or Reciprocal Rank Fusion (RRF), boosts scores using Neo4j graph connectivity, and reranks the top results with a cross-encoder. Query expansion via Groq LLM can generate up to 3 query variants for better recall.

**Endpoints:** `POST /v1/retrieve`, `POST /v1/similar_cases`, `POST /v1/search/features`, `POST /v1/factual/dual-search`

### Knowledge graph analytics

Twelve graph endpoints expose the Neo4j knowledge graph for legal reasoning. You can detect active divergences between ministers, find the optimal argument path for a legal category, track how criteria application evolves over time, and generate comprehensive minister profiles.

**Endpoints:** `POST /v1/graph/*` (12 endpoints)

### Verification and enrichment

The verification system checks legal references against real tribunal data — súmulas, minister names, process numbers, and legislation. The enrichment system adds IRAC analysis (Issue, Rule, Application, Conclusion) and knowledge graph context to any decision.

**Endpoints:** `POST /v1/verify`, `POST /v1/enrich`, `POST /v1/factual/extract`

### Document ingestion

A full case analysis workflow processes PDFs from upload to reviewed legal analysis. The PROJUDI pipeline extracts and segments the document, phase analysis identifies procedural stages, and jurisprudence matching finds relevant precedents for each phase. A state machine ensures audit-safe transitions, and human-in-the-loop review allows approval or rejection at each stage.

**Endpoints:** `POST /v1/ingest/*` (17 endpoints)

### MCP integration

Twenty-eight MCP tools expose all of Valter's capabilities to LLMs. Tools are organized into knowledge, graph, and workflow categories. Both stdio (Claude) and HTTP/SSE (ChatGPT) transports are supported, with API key and HMAC authentication respectively.

### Observability

Structured JSON logging via structlog with trace IDs on every request, 30+ Prometheus metrics, and OpenTelemetry tracing provide visibility into system behavior.

## Architecture at a glance

Valter is a **modular monolith with four runtimes** — all sharing the same Python codebase:

| Runtime | Command | Port | Purpose |
|---------|---------|------|---------|
| REST API | `make dev` | 8000 | HTTP endpoints for Juca and direct consumers |
| MCP stdio | `python -m valter.mcp` | — | Local connection for Claude Desktop/Code |
| MCP HTTP/SSE | `make mcp-remote` | 8001 | Remote connection for ChatGPT |
| ARQ Worker | `make worker-ingest` | — | Background job processing for PDF ingestion |

The codebase follows a strict layered architecture: `api/` → `core/` → `models/`, with `stores/` implementing protocol interfaces from `core/protocols.py`. Core business logic never imports stores directly — everything flows through dependency injection.

For a deeper dive into the architecture, see [Architecture Overview](/architecture/overview/).

## Next steps

- **[Quickstart](/getting-started/quickstart/)** — Get Valter running locally in under 5 minutes
- **[Installation](/getting-started/installation/)** — Full setup guide with all databases and options
- **[API Reference](/api/)** — Complete endpoint documentation
- **[MCP Tools](/api/mcp-tools/)** — All 28 MCP tools with parameters and examples
