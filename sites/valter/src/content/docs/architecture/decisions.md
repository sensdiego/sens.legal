---
title: Architecture Decision Records
description: Key architectural decisions made during Valter's development, with context, options considered, and rationale.
lang: en
sidebar:
  order: 3
---

# Architecture Decision Records

> Significant architectural decisions, documented with context, options considered, and rationale.

## What Are ADRs?

Architecture Decision Records capture the "why" behind technical choices that are expensive to reverse. Each ADR documents the context that led to a decision, the alternatives considered, and the consequences — both positive and negative. When a future contributor asks "why does Valter use four databases instead of one?", the ADR provides the answer without requiring archeological digs through commit history.

ADRs in Valter follow a simple structure: context, decision, alternatives, consequences, and status. They are stored in `docs/adr/` as Markdown files.

## ADR Index

| # | Decision | Status | Date |
|---|----------|--------|------|
| 001 | MCP Remote Transport (streamable-HTTP + HMAC) | Accepted | 2026-02-21 |
| 002 | External Consumer Connectivity Baseline | Accepted | 2026-02-27 |
| 003 | Four Data Stores | Accepted | 2026-02 |
| 004 | Protocol-Based Dependency Injection | Accepted | 2026-02 |
| 005 | App Directory Deferral to v2.1 | Accepted | 2026-02 |

## ADR-001: MCP Remote Transport

**Full document:** [`docs/adr/0001-mcp-remoto-https.md`](/adr/0001-mcp-remoto-https)

### Context

Valter's MCP server originally operated only via `stdio` for local use with Claude Desktop and Claude Code. To enable ChatGPT Apps to consume Valter's 28 MCP tools, a remote transport over HTTPS was needed — without breaking the existing local mode.

Two operational modes already existed: tools that execute logic locally in the MCP process, and tools that bridge to the REST API via HTTP. The decision had to avoid regressing the `stdio` mode and avoid tight coupling between the MCP contract and the internal REST API contract.

### Decision

Adopt a **dedicated MCP remote service over HTTPS** with **Streamable HTTP** transport (SSE-compatible), running on a separate entry point (port 8001). The `stdio` mode remains the default for local development.

Key design choices:

- **Dual transport without regression** — `python -m valter.mcp` continues to work via `stdio`. The remote mode uses a separate entry point (`remote_server.py`).
- **Separation of concerns** — the MCP remote service exposes tool contracts to external clients. The REST API remains the internal domain backend. The MCP layer bridges to the API when needed, without exposing internal details.
- **Deny-by-default security** — the remote endpoint requires HMAC authentication. No credential means 401. Invalid or revoked credentials produce auditable log entries.
- **Observability** — structured logs with `trace_id` per request, latency and error metrics per tool, health endpoints for readiness and liveness.

### Alternatives Rejected

- **REST-only for external consumers** — would not satisfy the MCP protocol requirement and would force clients to integrate a custom REST contract.
- **Single process for API + MCP remote + stdio** — lower initial overhead but higher coupling, harder rollback, and risk of `stdio` regression.

### Consequences

The system now has a third runtime to operate, monitor, and secure. But the MCP contract is isolated from the REST API contract, `stdio` remains fully operational as a development and fallback mode, and external consumers get a governed integration path.

---

## ADR-002: External Consumer Connectivity

**Full document:** [`docs/adr/0002-conectividade-consumidores-externos.md`](/adr/0002-conectividade-consumidores-externos)

### Context

With the HTTPS endpoint live, API key authentication enabled, rate limiting in place, and basic observability operational, the next challenge was making external consumption predictable for integrators. Without a clear policy, the risks included: breaking contracts for already-onboarded consumers, silent regression in knowledge graph ranking quality, operational cost from avoidable incidents, and slow onboarding due to missing guides and examples.

### Decision

Adopt a contract-oriented external connectivity model with seven pillars:

1. **Stability classification** per endpoint (experimental, beta, stable)
2. **Formal versioning and deprecation** for payload changes
3. **API key authentication** with minimal scopes and controlled rotation
4. **Operational observability** with SLOs and error signals
5. **DX kit** for onboarding in less than one day
6. **Governance** with mandatory contract tests in CI
7. **Production-eval parity** for knowledge graph logic (same scoring in production and evaluation benchmarks)

### Consequences

External onboarding becomes faster and more predictable. The cost is increased discipline: changelog maintenance, contract test upkeep, and mandatory review for PRs that impact external-facing contracts.

---

## ADR-003: Four Data Stores

### Context

Legal data has four fundamentally different access patterns:

- **Relational queries** — documents with metadata, features, jobs, audit logs. Needs transactional integrity, flexible filtering, and schema migrations.
- **Semantic search** — finding decisions by meaning, not just keywords. Requires high-dimensional vector similarity with sub-second latency.
- **Graph traversal** — following relationships between decisions, criteria, legal devices, precedents, and ministers. Needs multi-hop queries, path finding, and community detection.
- **Ephemeral caching** — query results with short TTL, rate limiting counters, and background job queues. Needs sub-millisecond access.

### Decision

Use four specialized databases, each in its optimal role:

| Store | Workload |
|-------|----------|
| PostgreSQL 16 | Relational data: documents, features, metadata, jobs, memory, auth |
| Qdrant | Vector similarity: 768-dim embeddings with payload filtering |
| Neo4j 5.x / Aura | Graph: FRBR ontology with ~28K nodes and ~207K edges |
| Redis 7 | Cache: query results (180s TTL), rate limiting, ARQ job queue |

### Alternatives Considered

- **PostgreSQL + pgvector** — would consolidate two databases into one. Rejected because pgvector at the time lacked payload filtering and the operational overhead of a dedicated vector DB was minimal with Docker Compose.
- **Single PostgreSQL for everything** — graph queries would require expensive recursive CTEs instead of native graph traversal. The knowledge graph's multi-hop queries (citation chains of depth 5, community detection, PageRank) are not practical in SQL.
- **Managed-only solutions** — would increase cost and introduce vendor lock-in at an early stage.

### Consequences

Operational complexity is higher (four services to maintain). But each store delivers optimal performance for its workload, and Docker Compose abstracts the complexity for local development. In production, Railway manages the services with health checks.

---

## ADR-004: Protocol-Based Dependency Injection

### Context

Core business logic (retriever, enricher, verifier) needs to call data stores, but must remain testable and swappable. If core modules imported concrete store classes directly, tests would require live database connections and changing a store implementation would require modifying core logic.

### Decision

Define **runtime-checkable `Protocol` classes** in `core/protocols.py`. Each protocol specifies the interface a store must satisfy (method signatures with type hints). Concrete stores in `stores/` implement these protocols. FastAPI's `Depends()` mechanism wires concrete instances into route handlers via `api/deps.py`.

```python
# core/protocols.py
from typing import Protocol, runtime_checkable

@runtime_checkable
class DocStore(Protocol):
    async def get_document(self, doc_id: str) -> Document | None: ...
    async def search_documents(self, query: str, limit: int) -> list[Document]: ...

# stores/postgres_doc_store.py
class PostgresDocStore:  # No explicit inheritance needed
    async def get_document(self, doc_id: str) -> Document | None:
        ...  # Concrete implementation
```

### Alternatives Considered

- **Abstract base classes (ABCs)** — would work but require explicit inheritance, which adds coupling. Protocols use structural subtyping (duck typing with type safety).
- **Direct imports** — simplest approach but makes testing impossible without live databases and prevents swapping implementations.
- **DI frameworks (e.g., dependency-injector)** — adds a third-party dependency for a problem already solved by FastAPI's `Depends()`.

### Consequences

Core modules have zero coupling to concrete store implementations. Tests use mock stores that satisfy the same protocol. Swapping a store (for example, replacing `QdrantVectorStore` with a different vector database) requires only implementing the protocol and updating `deps.py` — no core code changes.

---

## ADR-005: App Directory Deferral

### Context

Submitting Valter to the ChatGPT App Directory was planned for v1.2. A premortem exercise revealed that with an estimated ~200 tool calls over 3 months from App Directory discovery, the cost of compliance (HTTPS enforcement, published privacy/terms policies, metadata packaging, security audit) would not be justified by the expected usage.

### Decision

Defer App Directory submission to **v2.1**. In the near term, prioritize serving direct users (1-2 law firms) and building the Reasoning Chain feature (v1.2), which provides more differentiation than marketplace visibility.

### Consequences

Reduced short-term visibility in the ChatGPT ecosystem. But resources are redirected to the Legal Reasoning Chain — the feature that transforms Valter from a search backend into a reasoning engine, which is the actual competitive differentiator.

---

## Pending Decisions

The following decisions are open and will be resolved as the project evolves:

| # | Decision | Context |
|---|----------|---------|
| 1 | R2 canary activation timeline | Currently at 0%. When to move to 5%, then 100%? Needs E2E validation. |
| 2 | Legacy route sunset | Routes with `Sunset: 2026-06-30` header. When to remove them entirely? |
| 3 | Privacy and terms authorship | Required for App Directory and external consumers. Who writes and hosts them? |
| 4 | Leci integration model | How will the legislation backend connect to Valter? Shared database, API calls, or graph federation? |
| 5 | Juca integration level | How tightly should the frontend couple to Valter's API? SDK, OpenAPI client, or direct HTTP? |
| 6 | Multi-tribunal: which court first | TRFs, TST, or STF? Each has different data formats, metadata, and verification rules. |
| 7 | Doutrina scope | Legal doctrine was deferred to a separate repository. What is its scope and how does it relate to Valter? |
| 8 | Embedding model: keep or migrate | Current model is Legal-BERTimbau (768-dim). Should Valter migrate to a larger model? Re-indexing ~23K documents is non-trivial. |
| 9 | Reasoning chain: sync vs async vs streaming | The Legal Reasoning Chain (v1.2) orchestrates 7 queries. Should it execute synchronously, as an async job, or stream partial results? |
