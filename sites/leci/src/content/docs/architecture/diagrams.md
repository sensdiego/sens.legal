---
title: "Architecture Diagrams"
description: "Mermaid diagrams for system context, data model, and planned end-to-end lifecycle flows."
lang: en
sidebar:
  order: 4
---

# Architecture Diagrams

## System context diagram
This diagram represents currently implemented runtime boundaries plus immediate planned extensions.

```mermaid
flowchart TD
  Dev[Developer] -->|npm run dev| Web[Next.js App Shell]
  Dev -->|npx tsx scripts/migrate.ts| Migrator[Migration Script]
  Migrator --> PG[(PostgreSQL schema: leci)]

  PG --> RT[regulation_types]
  PG --> R[regulations]
  PG --> DN[document_nodes]
  PG --> E[embeddings]
  PG --> S[suggestions]
  PG --> RV[revisions]

  CI[GitHub Actions] --> Discord[PR Review Webhook]

  Web -. planned .-> API[Internal Search API]
  API -. planned .-> Agents[AI Agent Integrations]
```

## Data model relationship diagram
This diagram shows core table relationships used by legal retrieval and revision auditing.

```mermaid
erDiagram
  REGULATION_TYPES ||--o{ REGULATIONS : classifies
  REGULATIONS ||--o{ DOCUMENT_NODES : contains
  DOCUMENT_NODES ||--o{ DOCUMENT_NODES : parent_child
  DOCUMENT_NODES ||--o{ EMBEDDINGS : vectorizes
  DOCUMENT_NODES ||--o{ SUGGESTIONS : receives
  DOCUMENT_NODES ||--o{ REVISIONS : records
  SUGGESTIONS o|--o{ REVISIONS : links
```

## Revision lifecycle diagram
This sequence diagram highlights the integrity path for legal text updates.

```mermaid
sequenceDiagram
  participant User
  participant App
  participant DB

  User->>App: submit correction suggestion
  App->>DB: insert into suggestions
  App->>DB: call leci.apply_revision(...)
  DB->>DB: insert revision record
  DB->>DB: update document_nodes field
  DB->>DB: mark suggestion as applied (if linked)
  DB-->>App: revision id
  App-->>User: revision applied confirmation
```

## Planned end-to-end flow diagram
This view shows the intended target lifecycle once roadmap capabilities are implemented.

```mermaid
flowchart LR
  Sources[Planalto / LexML] --> Ingestion[Ingestion Pipeline]
  Ingestion --> Normalize[Normalize + Validate]
  Normalize --> PG[(PostgreSQL leci)]
  PG --> SearchAPI[Search/API Layer]
  SearchAPI --> UI[Web UI: search/browse/read]
  SearchAPI --> AgentConsumers[AI Agents / External Consumers]
  PG --> RevisionGov[Revision Governance]
```
