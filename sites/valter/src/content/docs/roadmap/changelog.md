---
title: Changelog
description: History of significant changes, features shipped, and milestones reached.
lang: en
sidebar:
  order: 3

---

# Changelog

Significant changes organized by date, newest first. For session-level development logs, see `PROGRESS.md` in the repository root.

Categories: **Added** (new feature), **Changed** (modification to existing feature), **Fixed** (bug fix), **Security** (security-related change), **Removed** (removed feature or dead code).

---

## February 2026

### 2026-02-28 — Reorg, Roadmap v2, Project Map

**Changed**
- Reorg Phases 0-2: security fixes, dependency cleanup, dead code removal
- Roadmap v2: premortem analysis, reasoning chain vision, milestone restructuring with risk-informed planning
- Issue organization: 5 GitHub milestones created, 9 new issues filed, 2 closed, 11 updated with labels and milestones

### 2026-02-27 — App Directory Preparation

**Added**
- Security hardening for App Directory requirements (input validation, error sanitization)
- UX improvements for MCP tool descriptions and parameter schemas
- Metadata alignment with App Directory submission format
- Dry-run validation of App Directory submission flow

### 2026-02-25 — Quality Gates

**Added**
- Enforced `ruff check` and `ruff format` as quality gates
- `mypy` strict typing on critical modules (`api/deps.py`, `api/routes/ingest.py`, `mcp/tools.py`)
- `make quality` target combining lint + type check + test

### 2026-02-24 — Rate Limit Fail-Safe, Tracing, Decoupling

**Added**
- Rate limit fail-safe mechanism (initial implementation)
- OpenTelemetry tracing with console exporter and `trace_id` propagation
- Architectural decoupling: 10 sprints separating concerns across layers

**Changed**
- Store implementations decoupled from direct core imports (dependency injection)

### 2026-02-22 — ChatGPT Integration, Search Enrichment

**Added**
- ChatGPT integration live via MCP remote (HTTP/SSE transport)
- Search result enrichment with graph metadata (citation count, connectivity score)

### 2026-02-21 — KG Quality, MCP Remote, Auth, Governance

**Added**
- MCP remote server with HTTP/SSE transport (`mcp/remote_server.py`)
- Authentication hardening (API key validation, HMAC verification)
- Operational governance documentation (`CLAUDE.md` governance section)

**Changed**
- Knowledge graph quality improvements (node deduplication, relation validation)

### 2026-02-17 — Batch Classification, Railway Deploy

**Added**
- Batch document classification pipeline
- Railway production deployment configuration

### 2026-02-16 — Pagination, STJ Metadata, Ingestion, Embeddings

**Added**
- Cursor-based pagination for search results
- STJ metadata store (`stores/stj_metadata.py`) for tribunal-specific data
- Ingestion workflow with state machine (`core/workflow_state_machine.py`)
- Shortest-path graph queries between decisions
- Embedding service with configurable model (`embeddings/`)

### 2026-02-15 — Features Search, MCP Desktop, Reranking, Graph Endpoints

**Added**
- Features search endpoint (search by extracted legal features)
- MCP server for Claude Desktop (stdio transport)
- Cross-encoder reranking for search results
- 4 additional graph analytics endpoints (temporal analysis, minister comparison, criterion evolution, citation network)

### 2026-02-13 — Graph Analytics Endpoints

**Added**
- Graph analytics endpoints via `POST /v1/graph/`:
  - Divergence detection between ministers and turmas
  - Optimal legal argument path finding
  - Minister profile analysis (voting patterns, specializations)
  - Temporal evolution of legal criteria

### 2026-02-10 — Data Ingestion at Scale

**Added**
- Large-scale data ingestion: 23,441 documents, 2,119 extracted features, 810,225 metadata records
- Ingestion pipeline with PDF extraction, text processing, and metadata parsing

### 2026-02-09 — Project Foundation

**Added**
- Hybrid search engine (BM25 lexical + semantic vector search with RRF fusion)
- Anti-hallucination verification against STJ public data (`core/verifier.py`)
- IRAC legal analysis framework (`models/irac.py`)
- MCP server skeleton with tool definitions
- Initial corpus: 3,673 documents indexed with embeddings
- PostgreSQL document store with JSONB metadata
- Qdrant vector store for semantic search
- Redis cache layer with rate limiting
- Neo4j knowledge graph with FRBR-based ontology
- FastAPI REST API with structured error handling
- structlog JSON logging with request-scoped `trace_id`
