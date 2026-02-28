---
title: Search Endpoints
description: API reference for search endpoints — hybrid retrieval, similar cases, feature search, and dual-vector search.
lang: en
sidebar:
  order: 2

---

# Search Endpoints

Four endpoints for searching and retrieving STJ legal decisions using hybrid strategies, AI-extracted features, and dual-vector analysis.

## POST /v1/retrieve

Hybrid search over the jurisprudence corpus combining BM25 lexical matching with semantic vector similarity, optional knowledge graph boost, and optional cross-encoder reranking.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | `string` | **required** | Natural-language legal query (1-1000 chars) |
| `top_k` | `integer` | `20` | Number of results to retrieve (1-100) |
| `strategy` | `string` | `"weighted"` | Scoring strategy: `weighted`, `rrf`, `bm25`, or `semantic` |
| `include_kg` | `boolean` | `false` | Apply knowledge graph relevance boost before final ordering |
| `rerank` | `boolean` | `false` | Apply cross-encoder reranking. Improves precision, adds ~100-300ms |
| `expand_query` | `boolean` | `false` | Expand query with LLM-generated legal variants. Improves recall, adds ~500-1500ms |
| `weights` | `object` | `null` | Custom signal weights (see below) |
| `filters` | `object` | `null` | Post-retrieval filters (see below) |
| `page_size` | `integer` | `null` | Enable cursor pagination (1-50, must be <= `top_k`) |
| `cursor` | `string` | `null` | Continuation cursor from previous page |
| `include_stj_metadata` | `boolean` | `false` | Include STJ metadata via PostgreSQL lookup (~5-20ms extra) |

### Weights object

| Field | Type | Default | Description |
|---|---|---|---|
| `bm25` | `float` | `0.5` | BM25 lexical signal weight |
| `semantic` | `float` | `0.4` | Semantic embedding signal weight |
| `kg` | `float` | `0.1` | Knowledge graph boost weight |

### Filters object

| Field | Type | Description |
|---|---|---|
| `ministro` | `string` | Minister name (auto-normalized to uppercase) |
| `data_inicio` | `string` | Start date filter (YYYYMMDD format) |
| `data_fim` | `string` | End date filter (YYYYMMDD format) |
| `tipos_recurso` | `string[]` | Appeal type filter (array) |
| `resultado` | `string` | Outcome filter: `provido`, `improvido`, `parcialmente provido` |
| `source` | `string` | Source type filter: `corpus`, `embedding_only`, `ementa_only` |

:::note
Filters are applied **post-retrieval**, so the actual number of returned results may be less than `top_k` when filters exclude matches.
:::

### Example request

```bash
curl -X POST http://localhost:8000/v1/retrieve \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "dano moral atraso voo overbooking companhia aerea",
    "top_k": 10,
    "strategy": "weighted",
    "rerank": true,
    "filters": {
      "resultado": "provido",
      "data_inicio": "20200101"
    }
  }'
```

### Example response

```json
{
  "data": [
    {
      "id": "doc-stj-resp-1234567",
      "processo": "REsp 1.234.567/SP",
      "ministro": "NANCY ANDRIGHI",
      "data": "20230615",
      "orgao": "TERCEIRA TURMA",
      "ementa": "RECURSO ESPECIAL. TRANSPORTE AEREO. ...",
      "ementa_preview": "RECURSO ESPECIAL. TRANSPORTE AEREO...",
      "tese": "O atraso significativo de voo gera dano moral presumido...",
      "razoes_decidir": null,
      "score": 0.92,
      "has_integra": true,
      "score_breakdown": {
        "bm25": 0.78,
        "semantic": 0.95,
        "kg_boost": null,
        "rerank_score": 0.92
      },
      "matched_terms": ["dano", "moral", "atraso", "voo"],
      "stj_metadata": null
    }
  ],
  "meta": {
    "trace_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "latency_ms": 245.3,
    "cache_hit": false,
    "model_version": "legal-bertimbau-v1.0",
    "expansion_queries": null
  },
  "pagination": {
    "cursor": null,
    "has_more": false,
    "total_estimate": 8
  }
}
```

## POST /v1/similar_cases

Find cases similar to a given decision using a blend of 70% semantic similarity and 30% structural knowledge graph overlap.

:::note
The URL uses an underscore (`similar_cases`) for legacy compatibility. This cannot be renamed without breaking existing consumers.
:::

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `document_id` | `string` | **required** | Source document ID to compare against |
| `top_k` | `integer` | `10` | Number of similar cases to return (1-100) |
| `include_structural` | `boolean` | `true` | Include KG structural similarity in the score. Disabling uses semantic-only (faster). |

### Example request

```bash
curl -X POST http://localhost:8000/v1/similar_cases \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "doc-stj-resp-1234567",
    "top_k": 5,
    "include_structural": true
  }'
```

:::tip
On timeout with structural mode enabled, the endpoint automatically retries with semantic-only fallback.
:::

## POST /v1/search/features

Structured search over AI-extracted document features with 9 combinable AND filters. At least one filter is required.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `categorias` | `string[]` | `null` | Legal categories (OR/ANY semantics within the list) |
| `dispositivo_norma` | `string` | `null` | Legal statute filter (e.g., `CDC`, `CC/2002`). Exact containment match. |
| `resultado` | `string` | `null` | Outcome filter (exact, case-sensitive) |
| `unanimidade` | `boolean` | `null` | Unanimous decision filter |
| `tipo_decisao` | `string` | `null` | Decision type (exact, case-sensitive) |
| `tipo_recurso` | `string` | `null` | Appeal type (exact, case-sensitive) |
| `ministro_relator` | `string` | `null` | Reporting minister (exact, case-sensitive) |
| `argumento_vencedor` | `string` | `null` | Winning argument text (partial match, case-insensitive) |
| `argumento_perdedor` | `string` | `null` | Losing argument text (partial match, case-insensitive) |
| `limit` | `integer` | `20` | Results per page (1-100) |
| `offset` | `integer` | `0` | Pagination offset |

:::caution
Most scalar filters use **exact case-sensitive** matching. Only `argumento_vencedor` and `argumento_perdedor` support partial case-insensitive matching (SQL `ILIKE`). The `categorias` field uses OR semantics (any listed category matches), while all other filters combine with AND.
:::

### Example request

```bash
curl -X POST http://localhost:8000/v1/search/features \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "categorias": ["Direito do Consumidor"],
    "resultado": "provido",
    "dispositivo_norma": "CDC",
    "limit": 10
  }'
```

### Example response

```json
{
  "data": [
    {
      "document_id": "doc-stj-resp-9876543",
      "processo": "REsp 9.876.543/RJ",
      "ementa_preview": "CONSUMIDOR. PRODUTO DEFEITUOSO...",
      "categorias": ["Direito do Consumidor"],
      "resultado": "provido",
      "tipo_decisao": "Acórdão",
      "unanimidade": true,
      "dispositivo_norma": ["CDC", "CC/2002"],
      "argumento_vencedor": "Responsabilidade objetiva do fornecedor..."
    }
  ],
  "total": 42,
  "meta": {
    "trace_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "latency_ms": 35.8
  }
}
```

## POST /v1/factual/dual-search

Dual-vector search that separates facts from legal thesis, searches each independently, then produces a divergence report. The pipeline: text input, LLM extraction (via Groq), encode each digest into separate vectors, vector search, divergence analysis.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `null` | Legal text for analysis (50-15000 chars). Required if `document_id` is not provided. |
| `document_id` | `string` | `null` | Corpus document ID. Required if `text` is not provided. |
| `top_k` | `integer` | `10` | Max results per dimension (1-50) |
| `filters` | `object` | `null` | Same filter object as `/v1/retrieve` (ministro, resultado, source) |

:::note
Either `text` or `document_id` must be provided. When `document_id` is used, the text is assembled from the document's ementa, tese, and razoes_decidir fields.
:::

### Example request

```bash
curl -X POST http://localhost:8000/v1/factual/dual-search \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "doc-stj-resp-1234567",
    "top_k": 5
  }'
```

### Example response

```json
{
  "data": {
    "factual_digest": {
      "bullets": [
        { "index": 0, "text": "Consumidor adquiriu produto com defeito...", "source_excerpt": "...", "uncertainty": false }
      ],
      "digest_text": "Consumidor adquiriu produto com defeito de fabricacao...",
      "extraction_model": "llama-3.3-70b-versatile"
    },
    "thesis_digest": {
      "thesis_text": "Responsabilidade objetiva do fornecedor por vicio do produto...",
      "legal_basis": ["CDC art. 12", "CDC art. 18"],
      "precedents_cited": ["REsp 1.234.567/SP"],
      "extraction_model": "llama-3.3-70b-versatile"
    },
    "factual_results": [
      { "id": "doc-001", "processo": "REsp 111.222/MG", "ministro": "NANCY ANDRIGHI", "data": "20230101", "score": 0.89 }
    ],
    "thesis_results": [
      { "id": "doc-002", "processo": "REsp 333.444/PR", "ministro": "MARCO BUZZI", "data": "20220615", "score": 0.85 }
    ],
    "overlap_ids": [],
    "fact_only_ids": ["doc-001"],
    "thesis_only_ids": ["doc-002"],
    "divergence_summary": "Os fatos sao similares a doc-001 mas a tese juridica diverge. doc-002 compartilha a mesma tese mas com fatos distintos."
  },
  "meta": {
    "trace_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "latency_ms": 1850.5
  }
}
```

The divergence report reveals three categories:
- **overlap_ids** -- cases matching on both facts and thesis (strong precedent).
- **fact_only_ids** -- factually similar but legally different (potential distinguishing).
- **thesis_only_ids** -- same legal thesis but different facts (thematic precedent).
