---
title: Features
description: Complete feature matrix of Valter with implementation status, organized by domain.
sidebar:
  order: 1
lang: en
---

# Features

Valter ships with 33 implemented features spanning search, graph analytics, LLM integration, document processing, verification, and infrastructure. This page provides the full matrix and links to detailed documentation per domain.

## Feature Matrix

| Feature | Status | Endpoint / Module | Docs |
|---------|--------|-------------------|------|
| Hybrid Search | Implemented | `POST /v1/retrieve` | [Hybrid Search](hybrid-search/) |
| Graph Analytics (12 endpoints) | Implemented | `POST /v1/graph/*` | [Graph Analytics](graph-analytics/) |
| MCP Server (28 tools) | Implemented | stdio + HTTP/SSE | [MCP Server](mcp-server/) |
| Ingestion Workflow (17 endpoints) | Implemented | `POST /v1/ingest/*` | [Ingestion Workflow](ingestion-workflow/) |
| Verification & Enrichment | Implemented | `POST /v1/verify`, `/v1/enrich` | [Verification & Enrichment](verification-enrichment/) |
| Observability | Implemented | `/metrics`, structlog, OTel | [Observability](observability/) |
| Legal Reasoning Chain | Planned (v1.2) | `POST /v1/reasoning-chain` | [Reasoning Chain](reasoning-chain/) |

## By Domain

### Search & Retrieval

Search is Valter's core query interface. It combines multiple strategies into a single pipeline that outperforms keyword-only or vector-only approaches.

- **Hybrid Search** -- BM25 lexical + semantic vectors (Qdrant) + KG boost (Neo4j), with weighted and RRF merge strategies. Endpoint: `POST /v1/retrieve`.
- **Dual-Vector Search** -- Encodes facts and thesis separately, producing a divergence report. Endpoint: `POST /v1/factual/dual-search`.
- **Query Expansion** -- Multi-query RAG via Groq LLM generates up to 3 legal term variants per query. Integrated into the retriever.
- **Cross-Encoder Reranking** -- Reorders top results using a cross-encoder model (local or Railway-hosted). Integrated into the retriever.
- **Feature Search** -- 9 combinable filters over 21 AI-extracted fields (categorias, resultado, tipo_decisao, argumento_vencedor, etc.). Endpoint: `POST /v1/search/features`.
- **Cursor-Based Pagination** -- Opaque cursor pagination across listing endpoints.

See [Hybrid Search](hybrid-search/) for full pipeline details.

### Knowledge Graph

The Neo4j knowledge graph contains decisions, criteria, legal statutes, precedents, ministers, and categories connected by relationship types like CITA, APLICA, DIVERGE_DE, and RELATOR_DE.

- **12 graph analytics endpoints** under `POST /v1/graph/*`
- **Divergence detection** between ministers on specific legal criteria
- **Optimal argument composition** with success rates per category and outcome
- **Temporal evolution tracking** for criteria over time with trend analysis
- **Minister profiling** with decision patterns, divergences, and top precedents
- **PageRank, communities, citations** for structural graph analysis
- **Structural similarity, shortest-path, graph embeddings** for advanced case comparison

See [Graph Analytics](graph-analytics/) for the full endpoint reference.

### LLM Integration (MCP)

Valter exposes all capabilities as 28 Model Context Protocol tools, allowing any MCP-compatible LLM to act as a legal research assistant.

- **28 MCP tools** organized across knowledge, graph, and workflow domains
- **stdio server** for Claude Desktop and Claude Code (`python -m valter.mcp`)
- **HTTP/SSE remote server** for ChatGPT and other remote clients (`make mcp-remote`, port 8001)
- **API key + HMAC authentication** for remote transport
- **Rate limiting** per API key with configurable per-minute limits

See [MCP Server](mcp-server/) for tool categories and setup instructions.

### Document Processing

The ingestion workflow transforms a raw case PDF into a structured legal analysis with phase identification, jurisprudence matching, and human-reviewed suggestions.

- **Full case workflow** with 17 endpoints under `/v1/ingest/*`
- **PROJUDI pipeline** for first-instance process extraction (segmentation, classification, confidence scoring)
- **Phase analysis** via 5 core modules (interpreter, matcher, rules, recommender, jurisprudence)
- **State machine** with validated transitions and auditable events in JSONL format
- **Human-in-the-loop review** at phase and final levels, with immutable reprocessing
- **Artifact storage** via local filesystem or Cloudflare R2 with deterministic canary rollout

See [Ingestion Workflow](ingestion-workflow/) for the full pipeline description.

### Verification & Intelligence

These features ensure that legal references used by LLMs and frontends are accurate and contextually enriched.

- **Anti-hallucination verification** validates sumulas (STJ/STF), minister names, process numbers (CNJ format), and legislation references against known datasets
- **IRAC analysis** classifies decision text into Issue, Rule, Application, and Conclusion using heuristic regex patterns
- **KG enrichment** adds criteria, legal statutes, precedents, and legislation from the Neo4j graph
- **Factual extraction** via Groq LLM produces structured factual digests and legal thesis for dual-vector search
- **Temporal validity** checks whether referenced legal norms remain in effect

See [Verification & Enrichment](verification-enrichment/) for implementation details.

### Infrastructure

- **API key auth + scopes + audit** with hashed keys, path-scoped permissions, and persistent audit logging
- **Rate limiting** via Redis sliding window per API key (both REST API and MCP)
- **Observability** with structlog JSON logging, 30+ Prometheus metrics, and OpenTelemetry tracing
- **CI/CD** via GitHub Actions (lint, test, Aura validation)
- **Railway deployment** for API, worker, and MCP remote server
- **Session memory** with key-value TTL storage (60s to 30 days) in PostgreSQL

See [Observability](observability/) for monitoring details.
