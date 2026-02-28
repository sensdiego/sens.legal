---
title: "Leci Documentation Home"
description: "Navigation hub for Leci architecture, setup, roadmap, and operations for humans and AI agents."
lang: en
sidebar:
  order: 1
---

# Leci Documentation Home

## What this documentation covers
This documentation explains how Leci works today, what is planned next, and how to contribute safely to a legal-data-first platform. It is designed for developers, project stakeholders, and AI agents that consume project context.

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
Leci currently provides strong database and migration foundations for Brazilian federal legislation, including structured legal entities, search indexes, and revision audit primitives. Product-facing capabilities such as richer UI flows, internal API groups, and ingestion automation are roadmap-driven and should be treated as planned scope until code is present.

## Source-of-truth policy
When docs and implementation diverge, trust this order:
1. Source code (`src/`, `drizzle/`, `scripts/`)
2. Configuration files (`package.json`, `.env.example`, build configs)
3. Planning artifacts (`docs/planning/*`)
4. Narrative pages in docs

:::caution
Do not infer implementation status from roadmap language alone. Always verify against code paths and migration artifacts.
:::
