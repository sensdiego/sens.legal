---
title: Technology Stack
description: Complete technology stack with versions, justifications, and role of each component.
lang: en
sidebar:
  order: 2
---

# Technology Stack

> Every technology choice in Valter, with versions, purpose, and why it was chosen.

## Language

Valter is written in **Python >=3.12** (production uses the `3.12-slim` Docker image). Python was chosen for three reasons:

1. **ML ecosystem** — sentence-transformers, cross-encoders, and NLP libraries for legal text processing are Python-native. There is no viable alternative in other languages for Legal-BERTimbau embeddings.
2. **Async performance** — Python 3.12 with `asyncio`, `asyncpg`, and `uvicorn` delivers throughput sufficient for the expected load (single-digit concurrent users during early adoption).
3. **Rich typing** — type hints with `mypy --strict` and Pydantic v2 validation catch errors at development time that would otherwise surface as runtime bugs in legal data processing, where correctness is paramount.

All public functions require type hints. This is enforced by `mypy` in CI and by convention in `CLAUDE.md`.

## Web Framework

**FastAPI >=0.115.0** with **Uvicorn >=0.34.0** serves as the HTTP layer.

FastAPI was chosen because it aligns with every architectural constraint in the project:

- **Async-first** — every I/O operation in Valter (database queries, vector search, graph traversal, LLM calls) is `async/await`. FastAPI is built on Starlette's async foundation.
- **Pydantic v2 integration** — request and response validation uses the same Pydantic models that define domain entities, eliminating translation layers.
- **OpenAPI auto-generation** — the REST API produces a complete OpenAPI spec from type annotations, which is consumed by external integrators.
- **`Depends()` DI** — FastAPI's dependency injection system powers the protocol-based architecture. Stores are wired in `api/deps.py` and injected into route handlers without the core layer knowing about concrete implementations.

## Data Stores

Valter uses four specialized databases, each chosen for a specific workload:

| Store | Version | Role | Data Volume | Why This Store |
|-------|---------|------|-------------|----------------|
| PostgreSQL | 16 (Alpine) | Documents, features, STJ metadata, ingestion jobs, workflow state, session memory, API keys, audit logs | ~23,441 docs, 2,119 features, 810,225 metadata records | Relational integrity for legal documents, JSONB for flexible metadata, mature async support via `asyncpg`, Alembic migrations |
| Qdrant | latest | Semantic vector search | ~3,673 vectors (768-dim, cosine similarity) | Purpose-built vector database with payload filtering, native cosine similarity, and sub-second query latency for legal embeddings |
| Neo4j | 5.x / Aura | Knowledge graph (FRBR ontology) | ~28,482 nodes, ~207,163 edges | Native graph traversal for multi-hop queries (citation chains, divergence detection, community discovery), Cypher query language, managed Aura option for production |
| Redis | 7 (Alpine) | Cache, rate limiting, job queue | Ephemeral | Sub-millisecond latency for query cache (180s TTL), native TTL for rate limiting sliding windows, ARQ integration for background job queues |

:::note
The decision to use four databases instead of consolidating (for example, PostgreSQL with pgvector for vectors) is documented in [ADR-002: Four Data Stores](/architecture/decisions#adr-002-four-data-stores). The short version: each store is optimized for its workload, and the operational complexity is managed by Docker Compose locally and Railway in production.
:::

## Production Dependencies

All production dependencies with their purpose, grouped by function:

### Web and HTTP

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | >=0.115.0 | Web framework, routing, DI, OpenAPI generation |
| `uvicorn[standard]` | >=0.34.0 | ASGI server with HTTP/1.1 and WebSocket support |
| `httpx` | >=0.28.0 | Async HTTP client for bridge calls (MCP remote to API, Railway encoder) |

### Data Validation and Configuration

| Package | Version | Purpose |
|---------|---------|---------|
| `pydantic` | >=2.10.0 | Domain models, request/response schemas, runtime validation |
| `pydantic-settings` | >=2.7.0 | Environment variable parsing into typed settings objects |

### Database Drivers

| Package | Version | Purpose |
|---------|---------|---------|
| `sqlalchemy[asyncio]` | >=2.0.36 | Async ORM and query builder for PostgreSQL |
| `asyncpg` | >=0.30.0 | High-performance async PostgreSQL driver |
| `alembic` | >=1.14.0 | Database migration management |
| `qdrant-client` | >=1.12.0 | Qdrant vector database client |
| `neo4j` | >=5.27.0 | Neo4j graph database driver (async bolt protocol) |
| `redis` | >=5.2.0 | Redis client for cache, rate limiting, and ARQ |

### Search and ML

| Package | Version | Purpose |
|---------|---------|---------|
| `rank-bm25` | >=0.2.2 | BM25 scoring for keyword-based search |
| `sentence-transformers` | >=3.3.0 | Legal-BERTimbau embedding model (768-dim) and cross-encoder reranking |

### Observability

| Package | Version | Purpose |
|---------|---------|---------|
| `structlog` | >=24.4.0 | Structured JSON logging with `trace_id` per request |
| `prometheus-client` | >=0.21.0 | 30+ Prometheus metrics (latency, error rates, cache hits) |
| `opentelemetry-api` | >=1.29.0 | Distributed tracing API |
| `opentelemetry-sdk` | >=1.29.0 | OpenTelemetry SDK for trace export |
| `opentelemetry-instrumentation-fastapi` | >=0.50b0 | Auto-instrumentation of FastAPI routes |

### Background Jobs and Storage

| Package | Version | Purpose |
|---------|---------|---------|
| `arq` | >=0.26.1 | Async job queue backed by Redis (ingestion workflow) |
| `aioboto3` | >=13.3.0 | Async S3-compatible client for Cloudflare R2 artifact storage |

### Document Processing

| Package | Version | Purpose |
|---------|---------|---------|
| `pdfplumber` | >=0.11.0 | PDF text extraction for legal documents |
| `pypdf` | >=5.0.0 | PDF reading and metadata extraction |

### Protocol

| Package | Version | Purpose |
|---------|---------|---------|
| `mcp` | >=1.3.0 | Model Context Protocol SDK for stdio and HTTP/SSE transport |

## Development Dependencies

Development tools are installed via `pip install -e ".[dev]"`:

| Package | Version | Purpose |
|---------|---------|---------|
| `pytest` | >=8.0.0 | Test framework |
| `pytest-asyncio` | >=0.24.0 | Async test support (auto mode) |
| `pytest-cov` | >=6.0.0 | Coverage reporting |
| `ruff` | >=0.8.0 | Linter and formatter (replaces flake8 + isort + black) |
| `mypy` | >=1.13.0 | Static type checker |

Optional OCR dependencies (for scanned PDF processing):

| Package | Version | Purpose |
|---------|---------|---------|
| `pytesseract` | >=0.3.13 | OCR via Tesseract engine |
| `pdf2image` | >=1.17.0 | PDF to image conversion for OCR pipeline |

## External Services

Valter integrates with several external services, most of which are optional for local development:

| Service | Purpose | Required? | Notes |
|---------|---------|-----------|-------|
| Groq API | LLM for document classification, factual extraction, query expansion | Optional | Enables AI-powered features (21 fields per decision). Without it, these features are unavailable but the system still works. |
| Cloudflare R2 | Artifact storage (PDFs, JSON analysis files) | Optional | Canary rollout at 0%. Local filesystem is the default. |
| Railway | Production/staging deployment | Production only | Hosts API, MCP remote, and ARQ worker as separate services. |
| Neo4j Aura | Managed graph database | Staging/prod | Local Neo4j 5.x for development. PRs touching graph code must pass Aura validation in CI. |
| HuggingFace | Embedding model hosting | One-time download | `make download-model` fetches `rufimelo/Legal-BERTimbau-sts-base` (or the model specified by `VALTER_EMBEDDING_MODEL`). |

## Build and Deploy

| Tool | Purpose |
|------|---------|
| `make` | Canonical command interface. All common operations have `make` targets. Direct commands (`pytest`, `uvicorn`) only for debugging. |
| `uv` / `pip` | Dependency management. `uv` preferred for speed; `pip` as fallback. |
| Docker + docker-compose | Local development stack (PostgreSQL, Qdrant, Redis). Neo4j can run locally or via Aura. |
| Alembic | PostgreSQL schema migrations with upgrade/downgrade support. |
| GitHub Actions | CI/CD pipeline: `make lint` + `make test` + Aura validation for graph-related PRs. |
| Railway | Production deployment via `railway.json` and `Dockerfile`. Supports multi-service deploy (API, Worker, MCP remote). |
| Hatchling | Python build backend (configured in `pyproject.toml`). |
