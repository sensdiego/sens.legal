---
title: "Legal Search Foundation"
description: "Current search data foundations and planned evolution toward user-facing retrieval APIs."
lang: en
sidebar:
  order: 3
---

# Legal Search Foundation

## Search foundations are implemented at the data layer
Leci already includes structural prerequisites for legal search, even though full API/product search flows are still roadmap work. This allows incremental implementation without redesigning the core schema.

## Implemented search primitives
Current code provides:
- generated Portuguese `tsvector` on `document_nodes`;
- GIN index for full-text search performance;
- embeddings table with `vector(768)` column;
- IVFFlat vector index for similarity retrieval.

## Practical implication today
The database is ready for full-text and semantic query strategies, but no internal API route currently exposes a production search contract.

> 🚧 **Planned Feature** — Endpoint-level search contracts, ranking strategies, and pagination semantics are part of roadmap milestones.

## Relevance and quality direction
Planned relevance model should include:
- lexical precision baseline (FTS);
- optional semantic reranking where data quality supports it;
- explicit traceability of match origin for legal confidence.

## Performance considerations
Search performance risk grows with ingestion scale and combined lexical/vector querying.

:::note
Before enabling broad production traffic, benchmark query latency against realistic corpus size and tune index strategy accordingly.
:::
