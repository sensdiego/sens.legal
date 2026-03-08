---
title: "Leci Documentation Home"
description: "Navigation hub for Leci architecture, setup, roadmap, and operations for humans and AI agents."
lang: en
sidebar:
  order: 1
---

# Leci Documentation Home

## What this documentation covers
This documentation explains how Leci works today, what is planned next, and how to contribute safely to a document-first legislation engine. It is designed for developers, project stakeholders, and AI agents that consume project context.

## Who should start here
Use this page as the entry point if you are:
- a contributor setting up the project for the first time;
- a reviewer validating architecture and roadmap consistency;
- an integration owner evaluating API-readiness and legal data reliability;
- an AI agent requiring structured, explicit, and machine-parseable context.

## Recommended reading paths
### Fast onboarding path
1. `getting-started/introduction`
2. `getting-started/quickstart`
3. `development/setup`

### Architecture and implementation path
1. `architecture/overview`
2. `architecture/stack`
3. `features/index`

### Planning and risk path
1. `roadmap/index`
2. `roadmap/milestones`
3. `planning/PREMORTEM.md`

## Current maturity in one paragraph
Leci is no longer just a schema-and-roadmap repository. The current baseline already includes a working `/api/search`, typed search contracts, a functional search shell, and validation against real data, while keeping the core product direction focused on document-first legislation retrieval and reliable grounding for the broader sens.legal ecosystem. Richer canonical reference resolution, deeper reader workflows, and expanded grounding contracts remain the next layer of work.

## Source-of-truth policy
When docs and implementation diverge, trust this order:
1. Source code (`src/`, `drizzle/`, `scripts/`)
2. Configuration files (`package.json`, `.env.example`, build configs)
3. Planning artifacts (`docs/planning/*`)
4. Narrative pages in docs

:::caution
Do not infer implementation status from roadmap language alone. Always verify against code paths and migration artifacts.
:::
