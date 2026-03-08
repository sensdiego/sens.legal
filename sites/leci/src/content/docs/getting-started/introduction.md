---
title: "Introduction to Leci"
description: "What Leci is, who it serves, and what is already operational in the current legislation engine."
lang: en
sidebar:
  order: 10
---

# Introduction to Leci

> This page explains what Leci is, why it exists, who it serves inside the sens.legal ecosystem, and what is already operational today.

## Leci is the legislation authority of the ecosystem
Leci is a document-first legislation engine focused on Brazilian federal law. Its job is not to be a generic legal chatbot or an undefined future backend; its job is to make legal text retrieval structured, traceable, and reliable enough to ground downstream reasoning in Juca and Valter.

In practical terms, Leci addresses three persistent problems:
- finding the right legal document and structural node instead of returning raw pages only;
- preserving traceability when legal text changes or is corrected;
- exposing legislation in a form that downstream systems can ground against safely.

## What is implemented today
The current implementation is already beyond foundations-only work.

### Search API baseline
Leci already exposes `GET /api/search`, with validated parameters, pagination metadata, and enriched regulation fields in the response. This is the current baseline retrieval surface for legislation.

### Functional search shell
The web layer already includes a functional search shell that supports query state in the URL, result navigation, a context panel, and incremental loading instead of just a static landing page.

### Real-data validation
The current baseline has already been exercised against real data, which matters because this project is supposed to be trusted as a grounding layer, not merely described as one.

### Auditability and structured data model
The database layer still matters: the schema models regulations and document nodes explicitly, search vectors exist at the document-node layer, and legal text mutation is constrained by revision/audit primitives.

:::danger
Do not update `document_nodes.content_text` directly in SQL or application code. The project invariant requires using `leci.apply_revision(...)` so edits stay auditable.
:::

## What Leci is not
Clear boundaries matter here:

- Leci is **not** the final end-user product of the ecosystem.
- Leci is **not** the owner of jurisprudence search, graph reasoning, or broad legal argumentation.
- Leci is **not** just a placeholder backend with no API.

Its role is narrower and more important: reliable legislation retrieval and grounding.

## Relationship with the sens.legal ecosystem
Leci is one of the four projects in sens.legal:

| Project | Responsibility |
|---------|----------------|
| **Juca** | User-facing frontend hub |
| **Valter** | Central jurisprudence and reasoning backend |
| **Leci** | Document-first legislation engine and grounding authority |
| **Douto** | Local doctrine pipeline feeding Valter |

This means Leci should be described as a supplier of trustworthy legislative context to the rest of the ecosystem, especially Valter and Juca.

## What is next
The next layer of work is about depth, not existence:

- canonical document resolution for references such as names, acronyms, and number/year citations;
- richer device-level reading and context retrieval;
- broader grounding contracts for downstream consumers such as Valter.

## Who this documentation is for
This documentation serves four audiences:

- project owners and decision-makers who need execution clarity;
- contributors who need setup and architecture constraints;
- integration owners who need to understand grounding boundaries;
- AI agents that need explicit, machine-readable distinctions between what exists and what is still planned.

:::tip
If you are integrating an AI agent, start from the current `/api/search` and the document-node model first, then layer richer grounding behaviors on top.
:::

## How to use this docs section
Use the `getting-started` section in this order:
1. `quickstart.md` for the fastest local run.
2. `installation.md` for full setup, CI-style validation, and troubleshooting.
3. `development/setup.md` for daily contribution workflow.
