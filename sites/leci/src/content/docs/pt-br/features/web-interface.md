---
title: "Interface Web"
description: "Baseline atual de UI e experiência planejada de produto para descoberta e leitura jurídica."
lang: pt-BR
sidebar:
  order: 5
---


# Interface Web

## The current UI is intentionally minimal
Leci currently ships a minimal homepage that validates runtime wiring and branding but does not yet implement full legal discovery workflows.

## Current implemented behavior
Current page (`src/app/page.tsx`) renders:
- product title (`Leci`)
- concise product subtitle in Portuguese
- centered minimal layout using Tailwind utility classes

## Planned product UX
> 🚧 **Planned Feature** — Search, browse, and legal reading interfaces are roadmap scope and not yet implemented.

Planned user journeys include:
- searching legal text by terms and metadata;
- navigating legal hierarchy structures;
- reading node-level legal content with context.

## Data dependencies for future UI
Future UI layers require:
- stable search API contracts;
- pagination and sorting semantics;
- explicit revision provenance display for trust-sensitive contexts.

## UX quality constraints
Legal users need predictability and source clarity.

:::caution
Do not present generated or inferred legal answers without clear evidence context once advanced UI flows are introduced.
:::
