---
title: Milestones
description: Detailed milestone plan from v1.0 (production stability) through v2.1 (scale and public presence).
lang: en
sidebar:
  order: 2

---

# Milestones

Sequential milestone plan: v1.0 through v2.1. Each milestone depends on the previous one being complete. Estimated timeline runs from March 2026 through late 2026.

## v1.0 — Stable Production

**Objective:** Stabilize production, fix premortem vulnerabilities, prevent silent degradation.

**Prerequisite:** None (current state).

**Estimated effort:** 2-3 weeks.

### Features

| Feature | Priority | Description |
|---|---|---|
| Rate limiter fail-open | P0 | When Redis is down, allow requests from valid API keys instead of blocking all traffic |
| Indexation gap closure | P0 | Batch-index the ~19,700 ementa-only documents that lack embeddings (3,673 -> 20,000+ vectors) |
| Alerting wiring | P1 | Connect Railway logs to Slack for critical errors and degradation alerts |
| HTTPS fix | P1 | Resolve certificate validation issues on production domain |
| Merge pending PRs | P1 | Close out open pull requests blocking downstream work |
| Privacy policy / terms | P1 | Add required legal pages for App Directory submission |
| Datetime migration | P2 | Migrate naive datetime fields to timezone-aware (`datetime` -> `datetime(timezone.utc)`) |
| README update | P2 | Update README to reflect current state and setup instructions |
| Absence runbook | P2 | Document operational procedures for when the primary developer is unavailable |
| R2 canary activation | P2 | Activate canary rollout for R2 artifact storage (currently at ~90% implementation) |

### Completion Criteria

- Rate limiter allows requests when Redis is down (fail-open for valid keys)
- Qdrant contains >= 20,000 indexed vectors
- Slack alerts firing on critical errors
- HTTPS certificate valid on production domain
- Zero `DeprecationWarning` from naive datetime usage

---

## v1.1 — Resilience + Search Quality

**Objective:** Resilience to partial infrastructure failures and measurable search quality improvements.

**Prerequisite:** v1.0 complete.

**Estimated effort:** 2-3 weeks.

### Features

| Feature | Priority | Description |
|---|---|---|
| Circuit breaker | P0 | Stop calling Neo4j after repeated failures/timeouts (>5s), allow recovery without blocking requests |
| Connection pool configuration | P1 | Tune PostgreSQL, Neo4j, and Redis connection pools for production load patterns |
| ARQ cron ingestion | P1 | Scheduled background jobs to check for new STJ decisions and ingest automatically |
| Fallback extraction to core | P1 | Move fallback text extraction logic from `stores/` into `core/` (proper layer) |
| Heuristic maps externalization | P2 | Move hardcoded classification heuristics to configuration files |
| Stopwords unification | P2 | Single stopwords source shared between BM25 and query expansion |
| Fallback metrics | P2 | Prometheus counters for how often fallback paths are exercised |
| Store unit tests | P2 | Unit test coverage for `stores/` layer (currently undertested) |

### Completion Criteria

- Circuit breaker active: Neo4j hang > 5s opens circuit, requests proceed without graph features
- Connection pools configured with explicit limits and timeouts
- ARQ checks for new decisions at least weekly
- Fallback extraction logic lives in `core/`, not `stores/`

---

## v1.2 — Legal Reasoning Chain

**Objective:** Transform Valter from a search backend into a **reasoning engine**. This is the flagship feature.

**Prerequisite:** v1.1 complete (circuit breaker and connection pools required for heavy multi-store queries).

**Estimated effort:** 2-3 weeks.

### Features

| Feature | Priority | Description |
|---|---|---|
| `core/reasoning_chain.py` orchestrator | P0 | Server-side orchestrator that composes verified legal arguments from knowledge graph paths |
| `POST /v1/reasoning-chain` endpoint | P0 | REST endpoint exposing the reasoning chain to frontends |
| `compose_legal_argument` MCP tool | P0 | MCP tool allowing LLMs to request composed legal arguments with provenance |
| Provenance tracking | P0 | Every step in the reasoning chain links back to specific decisions, with citation counts and graph position |
| Temporal intelligence integration | P1 | Reasoning chain weights recent decisions higher, flags overturned precedents |
| TRF spike (50 decisions) | P1 | Ingest 50 TRF decisions to test multi-tribunal feasibility before committing to v2.0 |

### How It Works

The reasoning chain orchestrator follows this flow:

1. **Query expansion** — parse the legal question, identify relevant criteria and legal provisions
2. **Multi-strategy retrieval** — hybrid search (BM25 + semantic + KG boost) for relevant decisions
3. **Graph traversal** — follow citation paths, shared criteria, and precedent chains in Neo4j
4. **Argument composition** — assemble a multi-step legal argument from the strongest graph paths
5. **Verification** — every cited decision is verified against real STJ data (anti-hallucination)
6. **Provenance attachment** — each step includes the source decision, citation count, recency, and graph connectivity score

### Completion Criteria

- Reasoning chain returns >= 3 verified steps with full provenance
- MCP tool functional and tested with Claude and ChatGPT
- Latency p95 < 5s for reasoning chain requests
- TRF spike completed with documented breakpoints and feasibility assessment

---

## v2.0 — Multi-Tribunal Platform

**Objective:** Expand beyond STJ to other Brazilian courts.

**Prerequisite:** v1.2 complete (TRF spike executed, multi-tribunal breakpoints documented).

**Estimated effort:** 2-3 months (scope depends on spike results from v1.2).

:::caution
This milestone is significantly more complex than it appears. The current codebase — `core/verifier.py`, `pipeline/`, `stores/stj_metadata.py` — has STJ-specific assumptions throughout. The TRF spike in v1.2 will identify exactly what needs to change.
:::

### Features

| Feature | Priority | Description |
|---|---|---|
| Multi-tribunal architecture | P0 | Abstract tribunal-specific logic behind interfaces, support multiple courts in the same deployment |
| TRF support | P0 | Federal Regional Courts — starting with the court identified in the v1.2 spike |
| TST support | P1 | Superior Labor Court |
| STF support | P1 | Supreme Federal Court (constitutional matters) |
| Leci integration | P1 | Integration with Leci (sister product) for enriched legal analysis |
| Juca integration | P1 | Integration with Juca (frontend) for seamless user experience |
| Automatic ingestion pipeline | P1 | Continuous ingestion from multiple tribunal portals without manual intervention |

### Completion Criteria

- At least 1 additional court with searchable, verified data
- Reasoning chain works across tribunals (e.g., STJ decision citing TRF precedent)
- Ingestion pipeline running for >= 2 courts

---

## v2.1 — Scale + Public Presence

**Objective:** Multi-consumer platform with SLA guarantees and public ChatGPT App Directory presence.

**Prerequisite:** v2.0 complete (multi-tribunal working, stable enough for external users).

**Estimated effort:** Depends on demand and App Directory review timeline.

:::note
App Directory submission was originally planned for v1.2 but was demoted to v2.1 based on premortem analysis (#6: low ROI risk if submitted before the product is mature enough).
:::

### Features

| Feature | Priority | Description |
|---|---|---|
| ChatGPT App Directory submission | P1 | Submit Valter as a public MCP tool in the ChatGPT App Directory |
| MCP hardening | P0 | Rate limiting per consumer, request validation, abuse prevention |
| Multi-tenancy | P1 | Support multiple organizations with isolated data and billing |
| SLA guarantees | P1 | Documented uptime, latency, and availability targets |
| Load testing | P0 | Validate that the system handles target concurrent load |
| Store test coverage > 80% | P2 | Comprehensive test coverage for all store implementations |

### Completion Criteria

- At least 1 external user (beyond the developer) actively using the system
- App Directory submission completed (pending review)
- Load tests validate SLA targets under concurrent load

---

## Timeline

```
2026-03       v1.0 — Stable Production (~2-3 weeks)
                |
2026-03/04    v1.1 — Resilience + Search Quality (~2-3 weeks)
                |
2026-04       v1.2 — Legal Reasoning Chain (~2-3 weeks) *** FLAGSHIP ***
                |
2026-05-07    v2.0 — Multi-Tribunal Platform (~2-3 months, scope from spike)
                |
2026-H2       v2.1 — Scale + Public Presence (depends on demand)
```

:::tip
The v1.x series is designed for a single developer + AI agents working in 2-3 week sprints. The v2.0 timeline is deliberately wider because multi-tribunal complexity is the highest-risk item in the roadmap.
:::
