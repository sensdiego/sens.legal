---
title: "Search and Retrieval"
description: "Current retrieval model in Valter: graph-led discovery with complementary search signals and graceful fallback."
sidebar:
  order: 2
lang: en
---

# Search and Retrieval

This page keeps the historical `/features/hybrid-search` slug, but the current retrieval model should be described as **graph-led retrieval**.

## The current model

Valter no longer treats the knowledge graph as a small optional score boost layered on top of a search-first pipeline. The current model uses the graph as a primary path for discovery and explanation, while lexical and semantic search remain complementary signals and fallback mechanisms.

In practice, the retrieval stack now combines:

- graph discovery and traversal for structure-aware relevance
- lexical and semantic retrieval for parallel evidence gathering
- reranking and fusion where helpful
- explainability outputs that describe why a decision surfaced
- graceful degradation when graph paths are unavailable

## What this changes

The difference is not just wording. It changes how consumers should think about Valter:

- relevance is not only a weighted search score;
- retrieval can be explained through entities, paths, and precedent structure;
- search remains important, but not as the sole center of the system.

## Main retrieval surfaces

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/retrieve` | Retrieve jurisprudence through the current graph-led pipeline |
| `POST /v1/similar_cases` | Find structurally and semantically similar decisions |
| `POST /v1/search/features` | Filter over extracted legal metadata |
| `POST /v1/factual/dual-search` | Compare factual and thesis-oriented retrieval views |

## Notes for implementers

- Compatibility knobs and low-level weights may still exist in the runtime during migration.
- The conceptual model should still be described as graph-led retrieval.
- If you need strict request and response details for a client, prefer the current runtime schema or generated API surface over manually copied parameter inventories.
