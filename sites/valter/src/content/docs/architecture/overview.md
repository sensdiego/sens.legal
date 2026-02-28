---
title: Architecture Overview
description: Modular monolith with 4 runtimes, layered architecture with dependency injection via protocols.
lang: en
sidebar:
  order: 1
---

# Architecture Overview

> Valter is a modular monolith with 4 runtimes (API, Worker, MCP stdio, MCP HTTP), all sharing the same Python codebase with strict layered separation.

## Architectural Pattern

Valter follows a **modular monolith** pattern — not microservices. All runtimes share the same Python package (`src/valter/`), the same domain models, and the same business logic. What changes between runtimes is the entry point and the transport layer, not the core logic.

This design was chosen for three reasons:

1. **Consistency** — a single codebase guarantees that the behavior of an MCP tool and its equivalent REST endpoint are always identical, because they call the same core function.
2. **Simplicity** — there is one deployment unit to build, test, and reason about. No inter-service communication, no API contracts between services, no distributed state.
3. **Testability** — all four runtimes can be validated by the same test suite, since the tests target core logic rather than transport-specific code.

The runtime is selected by the entry point used to start the process. In production on Railway, multiple instances of the same codebase run with different entry points (API on port 8000, MCP remote on port 8001, ARQ worker for background jobs).

## Dependency Rule

The codebase enforces a strict one-way dependency rule between layers:

```
api/ → core/ → models/
```

This means:

- **`api/`** can import from `core/` and `models/`, but never from `stores/`.
- **`core/`** can import from `models/`, but never from `stores/` or `api/`.
- **`models/`** has zero internal imports — it is the leaf layer.
- **`stores/`** implements protocols defined in `core/protocols.py` and is injected at runtime via FastAPI's `Depends()` mechanism, configured in `api/deps.py`.

This separation ensures that `core/` contains pure business logic with no coupling to any concrete database driver. A `PostgresDocStore` can be swapped for a mock in tests (or a different implementation entirely) without changing a single line in `core/`.

:::note
The `stores/` layer sits beside the dependency chain, not within it. Core modules receive store instances through dependency injection, never through direct imports. If you see `from valter.stores import ...` inside a `core/` module, that is a violation.
:::

## Layers

### API Layer (`src/valter/api/`)

The API layer is the outermost boundary of the application. It handles HTTP transport, request validation, authentication, and response serialization. Route handlers are intentionally thin — they validate input using Pydantic schemas, call a core function, and return the result.

Key components:

- **11 FastAPI routers** — `health`, `retrieve`, `verify`, `enrich`, `similar`, `graph`, `features`, `factual`, `ingest`, `memories`, `datasets`
- **Pydantic v2 schemas** — request and response models in `api/schemas/`, separate from domain models
- **DI container** — `api/deps.py` wires concrete stores into core functions using `Depends()`
- **Middleware stack** — requests pass through 5 middleware layers in order: CORS, Metrics IP Allowlist, Request Tracking (trace_id + Prometheus), Rate Limiter (Redis sliding window), Auth (API key + scopes)

:::caution
Route handlers must never contain business logic. If a handler does more than validate input, call core, and return a response, the logic belongs in `core/`.
:::

### Core Layer (`src/valter/core/`)

The core layer contains all business logic. It has approximately 25 modules organized by domain capability:

| Group | Modules | Purpose |
|-------|---------|---------|
| Search | `HybridRetriever`, `DualVectorRetriever`, `QueryExpander` | Hybrid search with BM25 + semantic + KG boost, dual-vector factual search, multi-query expansion |
| Analysis | `DocumentEnricher`, `LegalVerifier`, `SimilarityFinder`, `FactualExtractor` | IRAC analysis, anti-hallucination verification, case similarity, factual extraction via Groq |
| Workflow | `WorkflowOrchestrator`, `ProjudiOrchestrator`, `PhaseAnalysis` (5 modules) | Full ingestion pipeline from PDF upload to human-reviewed artifacts |
| Infrastructure | `Protocols` (runtime-checkable interfaces) | Contracts that stores must implement |

Every module in `core/` depends only on protocols and models — never on concrete store implementations.

### Store Layer (`src/valter/stores/`)

The store layer provides concrete implementations of the protocols defined in `core/protocols.py`. Each store is specialized for its data backend:

| Store | Backend | Responsibility |
|-------|---------|---------------|
| `PostgresDocStore` | PostgreSQL | Document CRUD, full-text search (BM25) |
| `PostgresFeaturesStore` | PostgreSQL | AI-extracted features (21 fields per decision) |
| `PostgresSTJStore` | PostgreSQL | STJ metadata (810K records) |
| `PostgresIngestStore` | PostgreSQL | Ingestion jobs, workflow state |
| `PostgresMemoryStore` | PostgreSQL | Session memory with TTL |
| `QdrantVectorStore` | Qdrant | Semantic search (768-dim vectors, cosine similarity) |
| `Neo4jGraphStore` | Neo4j | Knowledge graph queries (12+ analytical methods) |
| `RedisCacheStore` | Redis | Query cache (180s TTL), rate limiting counters |
| `GroqLLMClient` | Groq API | LLM calls for classification, extraction, query expansion |
| `ArtifactStorage` | Cloudflare R2 / local | PDF and JSON artifact storage with canary rollout |

:::tip
The `GroqLLMClient` lives in `stores/` even though Groq is not a traditional database. In Valter's architecture, `stores/` means "external data provider" — anything that lives outside the process boundary and requires I/O.
:::

### Model Layer (`src/valter/models/`)

The model layer defines domain entities as Pydantic v2 models. These models are shared across all layers and represent the canonical shape of data in the system:

| Module | Models |
|--------|--------|
| `document.py` | `Document`, `DocumentMetadata` |
| `chunk.py` | `Chunk`, `ChunkMetadata` |
| `irac.py` | IRAC analysis structure (Issue, Rule, Application, Conclusion) |
| `graph.py` | 30+ graph entity models (divergences, minister profiles, PageRank, communities, etc.) |
| `frbr.py` | FRBR ontology models (`Work`, `Expression`, `Manifestation`) |
| `phase.py` | Legal proceeding phase models |
| `features.py` | AI-extracted document features (21 fields) |
| `factual.py` | Factual digest and legal thesis |
| `stj_metadata.py` | STJ tribunal metadata |
| `memory.py` | Session memory key-value pairs |

All models use `model_config = {"strict": False}` to allow coercion from database results while maintaining type safety in application code.

## Entry Points

Valter exposes four runtime entry points, all from the same codebase:

| Entry Point | File | Command | Port | Consumers |
|-------------|------|---------|------|-----------|
| REST API | `src/valter/main.py` | `make dev` | 8000 | Juca frontend, direct API clients |
| MCP stdio | `src/valter/mcp/__main__.py` | `python -m valter.mcp` | -- | Claude Desktop, Claude Code |
| MCP HTTP/SSE | `src/valter/mcp/remote_server.py` | `make mcp-remote` | 8001 | ChatGPT Apps via HMAC auth |
| ARQ Worker | `src/valter/workers/__main__.py` | `make worker-ingest` | -- | Background ingestion jobs |

In production (Railway), the REST API and MCP HTTP/SSE run as separate services with distinct URLs, while the ARQ Worker runs as a separate process consuming the Redis job queue.

## Data Flow

At a high level, every request flows through the same pipeline regardless of entry point:

```
Consumer (Juca / ChatGPT / Claude)
    │
    ▼
Entry Point (REST API / MCP stdio / MCP HTTP)
    │
    ▼
Middleware Stack (CORS → Metrics → Tracking → RateLimit → Auth)
    │
    ▼
Route Handler (validates input, delegates to core)
    │
    ▼
Core Logic (retriever, enricher, verifier, etc.)
    │
    ▼
Stores (PostgreSQL, Qdrant, Neo4j, Redis, Groq, R2)
    │
    ▼
Response (serialized via Pydantic schema)
```

MCP tools follow the same path: each tool's implementation calls core functions, which in turn call stores. The MCP layer adds no business logic — it is a thin adapter that translates MCP tool calls into the same core function calls that REST route handlers make.

For detailed visual diagrams of component relationships and the search pipeline, see [Architecture Diagrams](/architecture/diagrams).
