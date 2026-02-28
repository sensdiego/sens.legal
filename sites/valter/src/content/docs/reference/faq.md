---
title: FAQ
description: Frequently asked questions about Valter's architecture, design choices, and usage.
lang: en
sidebar:
  order: 2

---

# Frequently Asked Questions

Common questions from developers, contributors, and AI agents working with Valter.

## Architecture

### Why does Valter use 4 databases?

Each database is optimized for a fundamentally different workload:

| Database | Role | Why Not PostgreSQL? |
|---|---|---|
| **PostgreSQL** | Relational integrity, document metadata, JSONB storage, ingestion state machine | N/A — this is the relational store |
| **Qdrant** | Purpose-built vector search with cosine similarity, HNSW indexing | pgvector exists but lacks Qdrant's filtering, performance at scale, and dedicated vector operations |
| **Neo4j** | Native graph traversal, Cypher queries, relationship-first data model | Recursive CTEs in PostgreSQL cannot match native graph performance for multi-hop traversals across 207K+ relationships |
| **Redis** | Sub-millisecond cache, rate limiting, background job queue (ARQ) | PostgreSQL is too slow for per-request rate limiting and caching |

The alternative considered was a single PostgreSQL instance with pgvector and recursive CTEs. This was rejected because graph queries (shortest path between decisions, divergence detection across citation chains) and high-throughput vector search are fundamentally different workloads that benefit from purpose-built engines.

:::tip
All four databases degrade gracefully. Search works without Neo4j (no KG boost). Search works without Redis (no cache, but rate limiting currently fails closed — see the [Troubleshooting](./troubleshooting) guide). Only PostgreSQL is strictly required.
:::

### Why a monolith instead of microservices?

Three reasons:

1. **Team size** — Valter is built by one developer assisted by AI agents. The operational overhead of multiple services (separate deployments, service discovery, distributed tracing) would slow development without providing proportional benefit.
2. **Shared business logic** — The same retriever, verifier, and enricher code runs in 4 contexts (API server, MCP stdio, MCP remote, ARQ worker). A monolith shares this code naturally. Microservices would require duplicating it or adding an internal service layer.
3. **Modular structure** — The codebase follows strict layering rules (`api/ -> core/ -> models/`, stores implement protocols) that would allow future extraction into services if scale demands it.

### Why MCP instead of a custom API for LLMs?

MCP (Model Context Protocol) is an open standard. The benefits over a custom API:

- **Any MCP-compatible LLM can use Valter** without integration work. Claude and ChatGPT both support MCP today.
- **Structured tool definitions** with JSON Schema mean the LLM understands parameters, types, and descriptions without custom prompt engineering.
- **Two transports for different use cases**: stdio for local Claude Desktop usage (low latency, no network), and HTTP/SSE for remote access (ChatGPT, other consumers).
- **No client SDK needed** — the protocol handles serialization, error reporting, and tool discovery.

The tradeoff is that MCP tools have a fixed request-response pattern. For long-running operations (like the planned reasoning chain), the endpoint may need to return intermediate results or use async polling.

### What is the difference between stdio and remote MCP?

| Aspect | stdio (local) | HTTP/SSE (remote) |
|---|---|---|
| **Transport** | Standard input/output pipes | HTTP POST + Server-Sent Events |
| **Use case** | Claude Desktop on the same machine | ChatGPT, remote clients, any network consumer |
| **Authentication** | None needed (local process) | API key + HMAC verification |
| **Startup** | `python -m valter.mcp.stdio_server` | `make mcp-remote` |
| **Latency** | Lowest (no network) | Network-dependent |
| **Configuration** | `claude_desktop_config.json` | `VALTER_MCP_SERVER_API_KEYS` env var |

Both transports expose the same set of MCP tools. The tool definitions, parameters, and responses are identical regardless of transport.

---

## Search

### How does KG Boost work?

KG Boost is a post-retrieval relevance boost based on knowledge graph connectivity. The flow:

1. **Initial retrieval** — Hybrid search (BM25 + semantic) returns a ranked list of candidate documents
2. **Graph lookup** — Each candidate document is checked against Neo4j for graph connections (citations received, shared criteria with other results, connection to known precedents)
3. **Score adjustment** — Documents with stronger graph connectivity receive a configurable score boost
4. **Re-ranking** — The final ranking reflects both textual relevance and structural importance in the jurisprudence network

Key properties:

- **Configurable** via `VALTER_KG_BOOST_BATCH_ENABLED` and `VALTER_KG_BOOST_MAX_CONCURRENCY`
- **Graceful degradation** — If Neo4j is unavailable, search results still return without the boost. No error is raised to the user.
- **Batched** — Graph lookups are batched for performance rather than queried one document at a time

### Why Legal-BERTimbau and not a larger model?

The embedding model `rufimelo/Legal-BERTimbau-sts-base` was chosen for three reasons:

1. **Domain-specific** — Fine-tuned on Portuguese legal text, specifically for semantic textual similarity (STS). A general-purpose multilingual model (e.g., `all-MiniLM-L6-v2`) performs measurably worse on legal Portuguese.
2. **768 dimensions** — A good balance of quality versus storage and computation cost. Each of the ~23,400 documents requires a 768-float vector. Doubling the dimension doubles storage and search time.
3. **Open source** — Available on Hugging Face, can be downloaded and run locally without API dependencies.

:::note
Pending decision: whether to migrate to a 1024-dimension model for better quality. This would require re-indexing all documents and is tracked as decision #8 in the [Roadmap](../roadmap/).
:::

---

## Data

### How does anti-hallucination verification work?

The verifier (`core/verifier.py`) checks that cited decisions actually exist and contain what is claimed. The process:

1. **Reference extraction** — Parse decision numbers (REsp, AgRg, etc.) from text
2. **Existence check** — Verify each cited decision exists in the PostgreSQL corpus
3. **Content validation** — Confirm that the cited decision actually discusses the claimed legal point
4. **Metadata cross-reference** — Check minister, turma, date, and other metadata against STJ public records

If a reference cannot be verified, it is flagged. This prevents LLMs from citing non-existent decisions or misattributing legal positions — a common and serious problem in AI-assisted legal work.

### What is IRAC analysis?

IRAC (Issue, Rule, Application, Conclusion) is a standard framework for structuring legal analysis:

- **Issue** — The legal question the court is deciding
- **Rule** — The statute, regulation, or legal principle that applies
- **Application** — How the court applies the rule to the specific facts
- **Conclusion** — The court's decision

Valter uses IRAC to decompose court decisions into structured components (`models/irac.py`). This structure enables more precise search (search by issue or rule, not just full text) and powers the planned reasoning chain feature.

### Can Valter handle tribunals beyond STJ?

Not yet, but it is planned for v2.0.

The current codebase has STJ-specific assumptions in several places: the verifier checks against STJ's public portal, the metadata store is STJ-specific (`stores/stj_metadata.py`), and the ingestion pipeline parses STJ document formats.

The approach for multi-tribunal expansion:

1. **v1.2 TRF spike** — Ingest 50 TRF decisions to identify exactly what breaks
2. **v2.0 abstraction** — Factor out tribunal-specific logic behind interfaces
3. **Incremental rollout** — Add TRF first, then TST, then STF

:::caution
Multi-tribunal is the highest-risk item on the roadmap. The TRF spike in v1.2 exists specifically to validate feasibility before committing to v2.0.
:::

### How does the ingestion workflow work?

The ingestion pipeline transforms raw court documents into searchable, graph-connected knowledge. The stages:

1. **PDF extraction** — Extract text from court decision PDFs (`core/pdf_extraction.py`). Falls back to OCR via pytesseract for scanned documents.
2. **Text processing** — Clean, normalize, and segment the extracted text. Handle encoding issues, header/footer removal, and page boundary artifacts.
3. **Metadata parsing** — Extract structured metadata: decision number, minister, turma, date, legal provisions cited.
4. **Feature extraction** — Identify legal features: IRAC components, key arguments, cited precedents.
5. **Embedding generation** — Generate vector embeddings using Legal-BERTimbau for semantic search.
6. **Graph insertion** — Create nodes and relationships in Neo4j following the FRBR-based ontology.
7. **State tracking** — The workflow state machine (`core/workflow_state_machine.py`) tracks each document through these stages, enabling retry on failure.

The pipeline can be triggered manually via the ingest API endpoint or automatically via ARQ background workers.

---

## Operations

### What happens if Redis goes down?

Currently, the rate limiter is **fail-closed** — if Redis is unavailable, all requests are blocked, even from valid API keys. This is a known issue (premortem #1) and is the highest-priority fix for v1.0.

The planned fix: fail-open for requests with valid API keys when Redis is unreachable. Rate limiting will be best-effort rather than a hard gate.

Other Redis-dependent features (caching, ARQ job queue) degrade more gracefully: cache misses simply hit the database directly, and background jobs wait until Redis recovers.

### What monitoring does Valter have?

Current state:

- **30+ Prometheus metrics** instrumented across API endpoints, search latency, graph queries, and ingestion
- **structlog JSON logging** with `trace_id` on every request for tracing
- **OpenTelemetry tracing** with console exporter (traces visible in logs)

Gaps being addressed in v1.0:

- No Prometheus server scraping the metrics (metrics are exposed but not collected)
- No dashboards (Grafana or similar)
- No alert dispatcher (alerts not yet wired to Slack or PagerDuty)
