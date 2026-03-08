---
title: Search Endpoints
description: Overview of Valter's current retrieval endpoints and how they fit the graph-led search model.
lang: en
sidebar:
  order: 2
---

# Search Endpoints

Valter exposes four main retrieval surfaces for jurisprudence work. The important architectural point is that these endpoints belong to a **graph-led retrieval** system, not a search-first pipeline with a small knowledge-graph boost.

## Retrieval surfaces

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/retrieve` | General jurisprudence retrieval through Valter's current pipeline |
| `POST /v1/similar_cases` | Similar-case retrieval with structural and semantic signals |
| `POST /v1/search/features` | Filtered retrieval over extracted legal metadata |
| `POST /v1/factual/dual-search` | Separate factual and thesis-oriented retrieval views |

## POST /v1/retrieve

Use this endpoint when you need the main jurisprudence retrieval experience.

Conceptually, it:

- discovers relevant material through graph-aware retrieval logic
- uses search signals as complementary evidence and fallback
- returns structured results suitable for downstream reasoning, verification, or UI rendering

If you are integrating a strict client, prefer the current runtime schema or generated OpenAPI surface for exact request and response fields.

## POST /v1/similar_cases

Use this endpoint when you start from one decision and want nearby jurisprudence. Similarity is no longer just "text looks alike"; it can also incorporate structural evidence from the graph-backed knowledge layer.

## POST /v1/search/features

Use this endpoint when you need filtered retrieval over extracted metadata such as categories, result labels, or other structured legal attributes.

## POST /v1/factual/dual-search

Use this endpoint when you need to separate factual similarity from thesis-oriented similarity. This is useful for contrastive analysis and for understanding whether two decisions are close because of their facts, their legal framing, or both.

## Integration guidance

- Treat `POST /v1/retrieve` as the primary entry point for jurisprudence retrieval.
- Treat the other endpoints as specialized retrieval tools built around the same knowledge layer.
- Avoid describing the whole search surface as "BM25 + semantic + KG boost"; that is no longer the right system narrative.
