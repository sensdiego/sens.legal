---
title: Graph Analytics
description: 12 knowledge graph endpoints for legal reasoning -- divergences, optimal arguments, temporal evolution, minister profiles, and structural analysis.
sidebar:
  order: 3
lang: en
---

# Graph Analytics

Valter exposes 12 endpoints under `POST /v1/graph/*` that query the Neo4j knowledge graph for legal reasoning tasks: divergence detection, optimal argument composition, temporal trend analysis, minister profiling, and structural similarity.

## Overview

The knowledge graph contains decisions, criteria, legal statutes (dispositivos), precedents, ministers, and categories connected by typed relationships such as CITA, APLICA, DIVERGE_DE, and RELATOR_DE. The ontology is adapted from FRBR (Functional Requirements for Bibliographic Records) for Brazilian law.

All graph endpoints share common patterns:

- **15-second timeout** per Neo4j query, enforced via `asyncio.wait_for`
- **Structured error handling**: Neo4j connection/driver errors return `SERVICE_UNAVAILABLE`; programming bugs (`KeyError`, `TypeError`) propagate as 500 errors for visibility
- **Trace ID** correlation in every response via `MetaResponse(trace_id, latency_ms)`
- **Caching** via Redis for frequently accessed queries

## Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/graph/divergencias` | POST | Detect split outcomes on legal criteria |
| `/v1/graph/divergencias/turma` | POST | Analyze split outcomes by minister/topic |
| `/v1/graph/optimal-argument` | POST | Find highest success rate arguments |
| `/v1/graph/optimal-argument-by-ministro` | POST | Compare minister vs category averages |
| `/v1/graph/ministro-profile` | POST | Comprehensive minister behavior profile |
| `/v1/graph/temporal-evolution` | POST | Track criteria trends over time |
| `/v1/graph/citation-chain` | POST | Trace outbound citation edges |
| `/v1/graph/pagerank` | POST | Rank influential decisions |
| `/v1/graph/communities` | POST | Find high-overlap decision pairs |
| `/v1/graph/structural-similarity` | POST | Compare two decisions across 5 dimensions |
| `/v1/graph/shortest-path` | POST | Find connection chains between decisions |
| `/v1/graph/graph-embeddings` | POST | Compute 7D structural vectors |

### Divergence Detection

**`POST /v1/graph/divergencias`**

Finds legal criteria where decisions have split outcomes (provido vs improvido). The divergence score is computed as `minority_count / total_count` -- a balanced split (50/50) produces the highest score.

**Parameters**: `categoria_id` (optional exact filter), `limit` (1-50, default 10).

**Use case**: Identify where law is unsettled, find active disagreements between ministers, and locate counter-arguments for a given legal position.

**`POST /v1/graph/divergencias/turma`**

Analyzes split outcomes for criteria matching a topic substring and aggregates counts by minister. Despite the name, the current graph query uses minister-level aggregation rather than explicit turma (court division) metadata.

**Parameters**: `tema` (required, case-insensitive substring match on criterion names).

### Optimal Argument

**`POST /v1/graph/optimal-argument`**

Given a category and desired outcome, finds the argument paths with the highest success rates. The graph store runs multiple Cypher queries internally to compute success rates across three argument types:

| Type | Internal Limit | Min Decisions |
|------|---------------|---------------|
| Criterio | 5 | 2 |
| Dispositivo (statute) | 3 | 2 |
| Precedente | 3 | 2 |

Each argument chain step includes: fact, criterion, success_rate, dispositivo, and supporting decisions.

**Parameters**: `categoria_id` (required), `resultado_desejado` (provido/improvido/parcialmente provido), `tipo_argumento` (all/criterio/dispositivo/precedente), `min_decisions`, `top_k` (1-50).

### Optimal Argument by Minister

**`POST /v1/graph/optimal-argument-by-ministro`**

Compares a specific minister's success rates against the category average for each argument. Returns a delta per argument:

- **Positive delta**: argument works better with this minister than the court average
- **Negative delta (< -0.1)**: argument to avoid with this minister

Internal graph limits: up to 10 criteria, 5 statutes, 5 precedents. Minister names are auto-normalized to uppercase.

**Parameters**: `categoria_id` (required), `ministro` (required), `resultado_desejado`, `tipo_argumento`, `min_decisions`, `min_category_decisions`, `top_k`.

### Temporal Evolution

**`POST /v1/graph/temporal-evolution`**

Tracks how a legal criterion's application changes over time. Aggregates decision counts by year or month, with provido/improvido split per period, and computes a heuristic trend label (growing, declining, or stable).

**Parameters**: `criterio` (required), `granularity` (year/month), `periodo_inicio`, `periodo_fim`.

:::note
Period format must match granularity: use `YYYY` for year granularity and `YYYY-MM` for month. Mismatched formats return a validation error.
:::

### Minister Profile

**`POST /v1/graph/ministro-profile`**

Returns a comprehensive profile of a minister's judicial behavior, built from 5 internal Cypher queries:

- **Summary**: total decisions, date range
- **Top criteria** used in decisions (capped at 10 internally)
- **Outcome distribution**: provido, improvido, parcialmente provido counts
- **Peer divergences**: ministers who disagree most frequently (capped at 20)
- **Most cited decisions**: the minister's most influential rulings (capped at 5)

**Parameters**: `ministro` (required), `include_divergencias` (default true), `include_precedentes` (default true), `limit_criterios` (1-50, cannot exceed internal cap of 10).

### PageRank

**`POST /v1/graph/pagerank`**

Ranks the most influential decisions using a simplified scoring formula:

```
score = in_citations * 10 + second_order_citations * 3
```

This is based on citation patterns in the graph rather than the full PageRank algorithm. The `min_citations` filter is applied in post-processing.

**Parameters**: `limit` (1-100, default 20), `min_citations` (default 0).

### Communities

**`POST /v1/graph/communities`**

Returns high-overlap decision pairs based on shared legal criteria. This is pairwise co-occurrence detection (size=2 per item), not full graph-theory community detection.

**Parameters**: `min_shared` (minimum shared criteria, default 3), `limit` (1-100, default 20).

### Citations

**`POST /v1/graph/citation-chain`**

Traces outbound citation edges from a root decision through `CITA_PRECEDENTE` relationships up to a configurable depth. Returns citation nodes, edges, and a `max_depth_reached` flag. Does not include inbound citations (decisions that cite the root).

**Parameters**: `decisao_id` (required), `max_depth` (1-5, default 3).

### Structural Similarity

**`POST /v1/graph/structural-similarity`**

Compares two decisions across five graph dimensions using weighted Jaccard scoring:

| Dimension | What It Measures |
|-----------|-----------------|
| Criteria | Shared legal criteria between decisions |
| Facts | Shared factual elements |
| Evidence | Shared evidence types |
| Statutes | Shared legal statutes cited |
| Precedents | Shared precedent citations |

Returns per-dimension stats and a `weighted_score` in [0, 1].

**Parameters**: `source_id` (required), `target_id` (required).

### Shortest Path

**`POST /v1/graph/shortest-path`**

Finds a bidirectional shortest path between two decisions using all relationship types, up to a configurable depth. Returns the path nodes, edges with real relationship types, and `found=false` when no path exists within the depth limit.

**Parameters**: `source_id` (required), `target_id` (required), `max_depth` (1-20, default 10).

### Graph Embeddings

**`POST /v1/graph/graph-embeddings`**

Computes a 7-dimensional structural vector per decision, capturing graph topology rather than text semantics:

| Dimension | Description |
|-----------|-------------|
| 1 | Criteria count |
| 2 | Facts count |
| 3 | Evidence count |
| 4 | Statutes count |
| 5 | Inbound citation count |
| 6 | Outbound citation count |
| 7 | Encoded outcome (provido/improvido/parcial) |

Supports two modes: **batch** (explicit `decisao_ids` list) and **sample** (random decisions limited by `limit`, default 100, max 500).
