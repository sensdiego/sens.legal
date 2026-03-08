---
title: "FAQ"
description: "Frequent questions about scope, setup, roadmap status, and integration expectations in Leci."
lang: en
sidebar:
  order: 2
---

# FAQ

## Is Leci already a full legal search product?
No. Leci should not be framed as a broad consumer legal search product yet. It is a document-first legislation engine for reliable grounding, but it is also no longer "just schema": the repo already has `/api/search`, a functional shell, and real-data validation.

## Can I trust the legal data mutation path?
Yes, as long as changes follow the revision invariant. Legal text updates should pass through `leci.apply_revision()` to preserve auditability.

## Is there a production API available today?
Yes, there is already a baseline API surface in the repository today: `GET /api/search`. Broader endpoint groups and richer grounding workflows are the next layer of work.

## Are tests already comprehensive?
No. There is already a baseline test surface around the search contract, but comprehensive integration and E2E coverage are still planned.

## Where should I start as a contributor?
Start with:
1. `getting-started/quickstart`
2. `getting-started/installation`
3. `development/setup`
4. `development/conventions`

## Why are some sections marked planned or unverified?
This labeling is intentional to prevent roadmap assumptions from being interpreted as implemented behavior, especially in a project where the search baseline exists but deeper legislation workflows are still being built.
