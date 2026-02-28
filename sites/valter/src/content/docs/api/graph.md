---
title: Graph Endpoints
description: API reference for 13 knowledge graph analytics endpoints — divergences, optimal arguments, temporal evolution, and more.
lang: en
sidebar:
  order: 3

---

# Graph Endpoints

13 endpoints under `/v1/graph/` exposing Neo4j knowledge graph analytics for legal reasoning. All endpoints use `POST` and return results wrapped in `{ data, meta }` envelopes.

All graph queries have a **15-second timeout**. If Neo4j is unreachable, the API returns `503 SERVICE_UNAVAILABLE`. Programming errors propagate as `500 INTERNAL_ERROR`.

## POST /v1/graph/divergencias

Detect active jurisprudential divergences -- clusters of decisions with split outcomes (provido vs improvido) for the same legal criteria. The `divergence_score` is computed as `minority / total`, so a perfectly balanced 50/50 split scores highest.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `categoria_id` | `string` | `null` | Filter by legal category (e.g., `cat-direito-consumidor`). Omit for all categories. |
| `limit` | `integer` | `10` | Max divergence clusters returned (1-50) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/divergencias \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "categoria_id": "cat-direito-consumidor", "limit": 5 }'
```

## POST /v1/graph/divergencias/turma

Analyze how different ministers decide on the same legal topic. Returns per-minister outcome counts for criteria matching the topic.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `tema` | `string` | **required** | Legal topic for divergence analysis (1-500 chars, e.g., `dano moral`) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/divergencias/turma \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "tema": "dano moral em relacoes de consumo" }'
```

:::note
Despite the name, this endpoint currently matches criteria by topic substring rather than using explicit turma (court division) metadata.
:::

## POST /v1/graph/optimal-argument

Find arguments (criteria, legal statutes, precedents) with the highest success rate for a given legal category and desired outcome.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `categoria_id` | `string` | **required** | Legal category ID (e.g., `cat-direito-consumidor`) |
| `resultado_desejado` | `string` | `"provido"` | Target outcome: `provido`, `improvido`, or `parcialmente provido` |
| `tipo_argumento` | `string` | `"all"` | Filter by type: `criterio`, `dispositivo`, `precedente`, or `all` |
| `min_decisions` | `integer` | `2` | Minimum supporting decisions for statistical relevance (2-100, internal floor is 2) |
| `top_k` | `integer` | `10` | Max arguments returned (1-50) |

:::tip
The graph store returns at most ~11 items (5 criteria + 3 statutes + 3 precedents). Setting `top_k` higher than 11 will not yield more results.
:::

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/optimal-argument \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": "cat-direito-consumidor",
    "resultado_desejado": "provido",
    "tipo_argumento": "criterio",
    "min_decisions": 3
  }'
```

## POST /v1/graph/optimal-argument-by-ministro

Minister-specific variant of optimal argument. Compares a specific minister's success rates against the overall category average. The `delta` field shows the difference: positive means the argument performs better with this minister.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `categoria_id` | `string` | **required** | Legal category ID |
| `ministro` | `string` | **required** | Minister name (auto-normalized to uppercase) |
| `resultado_desejado` | `string` | `"provido"` | Target outcome |
| `tipo_argumento` | `string` | `"all"` | Argument type filter |
| `min_decisions` | `integer` | `1` | Min minister-side decisions (1-100) |
| `min_category_decisions` | `integer` | `2` | Min category-wide decisions (2-100, internal floor is 2) |
| `top_k` | `integer` | `10` | Max arguments returned (1-50) |

The response includes `recommended_arguments` (delta > 0) and `avoid_arguments` (delta < -0.1).

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/optimal-argument-by-ministro \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": "cat-direito-consumidor",
    "ministro": "Nancy Andrighi",
    "resultado_desejado": "provido"
  }'
```

## POST /v1/graph/ministro-profile

Comprehensive judicial behavior profile for a specific STJ minister: total decisions, date range, top criteria, outcome distribution, peer divergences, and most-cited decisions.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `ministro` | `string` | **required** | Minister name (auto-normalized to uppercase) |
| `include_divergencias` | `boolean` | `true` | Include peer divergences on the same criteria |
| `include_precedentes` | `boolean` | `true` | Include most-cited decisions by this minister |
| `limit_criterios` | `integer` | `10` | Max criteria in the ranking (1-50, store cap is 10) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/ministro-profile \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ministro": "Nancy Andrighi",
    "include_divergencias": true,
    "include_precedentes": true,
    "limit_criterios": 5
  }'
```

:::note
Internal graph caps: up to 10 criteria, 20 peer divergences, 5 most-cited decisions. The `limit_criterios` parameter cannot exceed these store-level limits.
:::

## POST /v1/graph/temporal-evolution

Track how a legal criterion's application changes over time. Returns per-period buckets with provido/improvido splits and a heuristic trend label (growing, declining, or stable).

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `criterio` | `string` | **required** | Legal criterion to analyze (1-500 chars, e.g., `dano moral`) |
| `granularity` | `string` | `"year"` | Temporal granularity: `year` or `month` |
| `periodo_inicio` | `string` | `null` | Period start. Format must match granularity: `YYYY` for year, `YYYY-MM` for month. |
| `periodo_fim` | `string` | `null` | Period end. Same format requirement. |

:::caution
The period format must match the granularity. Using `YYYY-MM` with `granularity: "year"` returns a `400 INVALID_REQUEST` error.
:::

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/temporal-evolution \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "criterio": "boa-fe objetiva",
    "granularity": "year",
    "periodo_inicio": "2018",
    "periodo_fim": "2024"
  }'
```

## POST /v1/graph/citation-chain

Trace the outbound citation chain from a root decision through `CITA_PRECEDENTE` relationships up to the specified depth.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `decisao_id` | `string` | **required** | Root decision ID |
| `max_depth` | `integer` | `3` | Maximum citation hops (1-5) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/citation-chain \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "decisao_id": "doc-stj-resp-1234567", "max_depth": 3 }'
```

:::note
This endpoint traces outbound citations only (which decisions the root cites). It does not include inbound citations (who cites the root). The response includes a `max_depth_reached` flag.
:::

## POST /v1/graph/pagerank

Rank the most influential decisions in the citation graph using a simplified PageRank score: `in_citations * 10 + second_order * 3`.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `integer` | `20` | Top-N most influential decisions (1-100) |
| `min_citations` | `integer` | `0` | Minimum direct citations post-filter (0 = no filter) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/pagerank \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "limit": 10, "min_citations": 5 }'
```

## POST /v1/graph/communities

Identify thematic communities of decisions that share legal criteria. Returns decision pairs grouped by shared criteria count (pairwise co-occurrence).

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `min_shared` | `integer` | `3` | Minimum shared criteria to form a community pair (1-20) |
| `limit` | `integer` | `20` | Maximum communities returned (1-100) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/communities \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "min_shared": 4, "limit": 10 }'
```

:::note
This is pairwise co-occurrence (size=2 per item), not full graph-theory community detection (e.g., Louvain). Each community entry represents a pair of decisions with their shared criteria.
:::

## POST /v1/graph/structural-similarity

Compare two decisions across five graph dimensions (criteria, facts, evidence, statutes, precedents) using weighted Jaccard scoring. Returns per-dimension similarity stats and a combined `weighted_score` in [0, 1].

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `source_id` | `string` | **required** | First decision ID |
| `target_id` | `string` | **required** | Second decision ID |

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/structural-similarity \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "doc-stj-resp-1234567",
    "target_id": "doc-stj-resp-7654321"
  }'
```

## POST /v1/graph/shortest-path

Find the shortest bidirectional path between two decisions in the knowledge graph, using all relationship types.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `source_id` | `string` | **required** | Source decision ID |
| `target_id` | `string` | **required** | Target decision ID |
| `max_depth` | `integer` | `10` | Maximum path depth in hops (1-20) |

Returns nodes and edges with real relationship types, or `found: false` when no path exists within the depth limit.

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/shortest-path \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "doc-stj-resp-1234567",
    "target_id": "doc-stj-resp-7654321",
    "max_depth": 5
  }'
```

## POST /v1/graph/embeddings

Compute 7-dimensional structural feature vectors for decisions based on graph topology: criteria count, facts count, evidence count, statutes count, inbound citations, outbound citations, and encoded outcome.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `decisao_ids` | `string[]` | `null` | Specific decision IDs. Omit for random sample mode. Max 500 IDs per request. |
| `limit` | `integer` | `100` | Sample size cap when `decisao_ids` is omitted (1-500) |

Results are cached in Redis for 1 hour.

### Example request

```bash
curl -X POST http://localhost:8000/v1/graph/embeddings \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "decisao_ids": ["doc-stj-resp-1234567", "doc-stj-resp-7654321"]
  }'
```

:::tip
Graph embeddings are useful for clustering, visualization (t-SNE/UMAP), and as features for downstream ML models. They represent structural properties in the knowledge graph, not semantic text embeddings.
:::
