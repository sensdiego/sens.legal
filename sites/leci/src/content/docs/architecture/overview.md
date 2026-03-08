---
title: "Architecture Overview"
description: "System architecture summary for the current legislation engine, search flow, and grounding boundaries."
lang: en
sidebar:
  order: 1
---

# Architecture Overview

## Leci uses a document-first architecture
Leci currently runs as a single Next.js repository where PostgreSQL is the system of record and legislation is modeled through regulations and hierarchical document nodes. The runtime is intentionally focused on trustworthy retrieval and grounding instead of broad product sprawl.

## Current implemented components
The current codebase already includes these operational components:
- Next.js App Router shell and search experience
- `GET /api/search` for legislation retrieval
- typed search contracts and validation
- PostgreSQL schema + SQL migrations
- search vectors on `document_nodes`
- revision/audit primitives for legal text mutation

## Current data flow
The current runtime flow is straightforward:
1. a search request reaches `/api/search`;
2. parameters are validated by the search contract layer;
3. PostgreSQL full-text search runs over `document_nodes.search_vector`;
4. the response is enriched with regulation metadata and pagination fields;
5. the search shell renders and paginates the results.

## Data model responsibilities
The schema separates legal concerns into explicit tables:
- `regulation_types` and `regulations` for top-level legal documents;
- `document_nodes` for hierarchical legal text and search vector generation;
- `embeddings` for semantic retrieval groundwork;
- `suggestions` and `revisions` for controlled correction and auditability.

## Architectural invariants
The most important invariant is revision safety for legal text changes.

:::danger
Never mutate `document_nodes.content_text` directly. Apply legal text changes through `leci.apply_revision()` to preserve revision history integrity.
:::

## Current boundaries
Leci already has a retrieval API, but it is not the final shape of the legislation product yet. The current architecture should be understood as:

- operational enough to ground legislation retrieval now;
- intentionally narrow so canonical resolution and richer reader flows can be added safely;
- focused on being a legislation authority for Valter and Juca rather than a standalone jurisprudence/reasoning backend.

## Planned architecture expansion
The next architectural layer is about depth:

- canonical document resolution for imperfect legal references;
- device-level reading with stronger structural context;
- broader grounding contracts for downstream consumers;
- ingestion automation beyond the current runtime baseline.

## Operational constraints
Current architecture carries practical constraints:
- migration rerun safety depends on SQL idempotence (no migrations history table in script);
- search is still a baseline endpoint rather than the full legislation product surface;
- production-grade observability and SLO enforcement are roadmap work.
