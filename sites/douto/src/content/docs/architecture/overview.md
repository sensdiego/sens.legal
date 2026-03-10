---
title: "Architecture Overview"
description: "How Douto organizes its pipeline, artifacts, and Valter handoff."
lang: en
sidebar:
  order: 1
---

# Architecture Overview

Douto should not be understood as a continuously running service.
Today it is a three-layer architecture:

1. batch pipeline;
2. artifact delivery to Valter;
3. editorial markdown layer.

## Layer 1 - Batch Pipeline

Current flow:

```mermaid
flowchart LR
    PDF["PDF"] --> PB["process_books.py"]
    PB --> RC["rechunk_v3.py"]
    RC --> EN["enrich_chunks.py"]
    EN --> EM["embed_doutrina.py"]
    EM --> SE["search_doutrina_v2.py"]
```

This layer produces Douto's operational corpus.

## Layer 2 - Delivery to Valter

Today the real integration happens through static artifacts, not through an API.

```mermaid
flowchart LR
    EM["embed_doutrina.py"] --> ART["delivery artifacts"]
    ART --> VAL["Valter"]
    VAL --> JUC["Juca / lawyer"]
```

This layer is the product center in the short term.

## Layer 3 - Editorial Markdown

- `knowledge/INDEX_DOUTO.md`
- `knowledge/mocs/*.md`
- `knowledge/nodes/` (still empty)

This layer helps organize the corpus and human navigation.
It is **not** the product center.

## Architectural Units

| Type | Unit |
|------|------|
| Usage | legal institute / legal problem |
| Evidence | doctrinal chunk |
| Delivery | doctrine artifact for Valter |

## Operational Principles

1. precision before speed;
2. explicit ambiguity before false certainty;
3. reliable retrieval before synthesis;
4. delivered artifact before sophisticated service.

## Real Limitations Today

- paths are still being regularized;
- zero automated tests;
- enrichment depended on an unversioned prompt;
- retrieval still comes from flat JSON artifacts;
- current search is local and CLI-coupled.
