---
title: Hybrid Search
description: Multi-strategy search combining BM25 lexical, semantic vectors, knowledge graph boost, query expansion, and cross-encoder reranking.
sidebar:
  order: 2
lang: en
---

# Hybrid Search

Valter's search pipeline combines five strategies into a single query flow: BM25 lexical match, semantic vector similarity, knowledge graph boost, LLM-powered query expansion, and cross-encoder reranking. The endpoint is `POST /v1/retrieve`.

The core formula is:

```
score_final(d, q) = w_bm25 * norm(BM25) + w_sem * norm(cosine) + w_kg * kg_boost
```

Default weights: BM25 = 0.5, semantic = 0.4, KG = 0.1.

## Pipeline Stages

Every search request flows through 8 stages. Each stage is independently measurable and most can be toggled via request parameters.

### 1. Cache Check

The retriever computes a cache key from the hash of query text, filters, strategy, and feature flags. If a cached response exists in Redis (TTL 180s), it returns immediately without executing the pipeline.

A cache hit sets `cache_hit: true` in the response and records the latency as the cache lookup time only. This is the fastest path through the system.

### 2. Query Expansion

When `expand_query` is enabled, the `LLMQueryExpander` generates up to 3 query variants using a Groq LLM. The expansion prompt is domain-specific for Brazilian legal search:

```python
# From core/query_expander.py
# Rules for expansion:
# 1. Legal synonyms (e.g., "dano moral" -> "dano extrapatrimonial")
# 2. Procedural equivalents (e.g., "recurso especial" -> "REsp")
# 3. Thesis/statute reformulations (e.g., "prazo prescricional" -> "prescricao quinquenal art. 206 CC")
```

The expander has a configurable timeout (default 3.0s). On timeout or failure, expansion returns an empty list and the pipeline continues with the original query only. The expanded variants are included in the response as `expansion_queries`.

### 3. Encoding

The original query and any expansion variants are encoded into dense vectors using the embedding model defined by `VALTER_EMBEDDING_MODEL` (default: `rufimelo/Legal-BERTimbau-sts-base`, 768 dimensions).

Two encoder backends are available:

- **Local**: `SentenceTransformerEncoder` -- loads the model in-process
- **Remote**: `RailwayEncoder` -- sends HTTP requests to a dedicated GPU service on Railway

### 4. Parallel Retrieval

BM25 and semantic search run concurrently using `asyncio.gather` for latency optimization.

- **BM25**: Uses the `rank_bm25` library (`BM25Okapi`) over tokenized PostgreSQL documents. The index is built at startup from all documents' ementa, tese, and razoes_decidir fields.
- **Semantic**: Performs cosine similarity search against Qdrant using the encoded query vector. When query expansion is active, all variant vectors are searched and results are merged.

Both retrieval paths fetch up to `top_k * 3` candidates (capped at 100) to ensure sufficient diversity before merging.

### 5. Merge

Candidates from BM25 and semantic search are combined using one of two strategies, selectable via the `strategy` request parameter:

- **weighted** (default): Normalizes BM25 and semantic scores independently, then combines them using configurable weights. The `SearchWeights` dataclass defaults to `bm25=0.5, semantic=0.4, kg=0.1`.
- **rrf** (Reciprocal Rank Fusion): Position-based merging using the formula `1 / (k + rank)` with `k=60`. This approach is less sensitive to score distribution differences between retrievers.

If one retriever returns empty results, the strategy automatically falls back to the other retriever's results only.

### 6. Filtering

Post-retrieval filters are applied to the merged candidate list. Available filters in `SearchFilters`:

| Filter | Type | Behavior |
|--------|------|----------|
| `ministro` | string | Normalized to uppercase for case-insensitive matching |
| `data_inicio` | string (YYYYMMDD) | Minimum decision date |
| `data_fim` | string (YYYYMMDD) | Maximum decision date |
| `tipos_recurso` | list[string] | Extracted from processo number format |
| `resultado` | string | Decision outcome filter |

:::note
Filters are applied after retrieval, so the returned count may be less than `top_k` when filters exclude candidates.
:::

### 7. Knowledge Graph Boost

When `include_kg` is enabled and the Neo4j graph store is available, each result receives a relevance boost based on its graph connections.

The KG boost computation (`compute_kg_boost_from_entities` in `stores/graph.py`) evaluates three entity types for each decision:

- **Criterios** -- legal criteria connected to the decision, weighted by a qualitative `peso` multiplier
- **Fatos** -- factual elements linked in the graph
- **Provas** -- evidence entities

Boost queries run concurrently with configurable concurrency (`VALTER_KG_BOOST_MAX_CONCURRENCY`, default 20). The boost score is combined with the search score using the KG weight (default 0.1).

:::tip
If Neo4j is unavailable, results still return without KG boost. The system logs a warning but does not fail the request.
:::

### 8. Reranking

When `rerank` is enabled and a reranker is configured, the top results are reordered by a cross-encoder model that scores query-document pairs for relevance.

Two reranker backends are available:

- **Local**: `CrossEncoderReranker` -- runs the cross-encoder model in-process
- **Remote**: `RailwayReranker` -- sends HTTP requests to a dedicated GPU service

Reranking typically adds 200-500ms of latency but improves precision for the top results.

## Dual-Vector Search

The dual-vector retriever (`DualVectorRetriever` in `core/dual_vector_retriever.py`) takes a different approach: instead of a single query vector, it encodes facts and legal thesis separately and searches the corpus with each.

**Endpoint**: `POST /v1/factual/dual-search`

The divergence report classifies results into three categories:

| Category | Meaning |
|----------|---------|
| `fact_only` | Factually similar but legally different |
| `thesis_only` | Legally similar but factually different |
| `overlap` | Similar in both factual and legal dimensions |

This separation is valuable for identifying cases where the same facts led to different legal reasoning, or where the same legal thesis was applied to different factual scenarios.

## Feature Search

Feature search provides structured filtering over 21 AI-extracted fields (generated by Groq LLM classification).

**Endpoint**: `POST /v1/search/features`

Nine combinable filters with AND semantics (except `categorias` which uses OR/ANY):

| Filter | Match Type |
|--------|-----------|
| `categorias` | OR/ANY semantics across listed categories |
| `dispositivo_norma` | Exact match (e.g., "CDC", "CC/2002") |
| `resultado` | Exact, case-sensitive |
| `unanimidade` | Boolean |
| `tipo_decisao` | Exact, case-sensitive |
| `tipo_recurso` | Exact, case-sensitive |
| `ministro_relator` | Exact, case-sensitive |
| `argumento_vencedor` | Partial ILIKE, case-insensitive |
| `argumento_perdedor` | Partial ILIKE, case-insensitive |

## Configuration

Key environment variables controlling the search pipeline:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VALTER_EMBEDDING_MODEL` | `rufimelo/Legal-BERTimbau-sts-base` | Embedding model for encoding |
| `VALTER_EMBEDDING_DIMENSION` | `768` | Vector dimension |
| `VALTER_KG_BOOST_BATCH_ENABLED` | `true` | Enable batch KG boost |
| `VALTER_KG_BOOST_MAX_CONCURRENCY` | `20` | Max concurrent Neo4j queries for KG boost |
| `VALTER_QUERY_EXPANSION_MAX_VARIANTS` | `3` | Max query expansion variants |
