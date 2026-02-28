---
title: "FAQ"
description: "Perguntas frequentes sobre escopo, setup, status de roadmap e expectativas de integração no Leci."
lang: pt-BR
sidebar:
  order: 2
---


# FAQ

## Is Leci already a full legal search product?
No. Leci currently provides strong database and migration foundations plus a minimal UI shell. Rich search APIs and product workflows are roadmap scope.

## Can I trust the legal data mutation path?
Yes, as long as changes follow the revision invariant. Legal text updates should pass through `leci.apply_revision()` to preserve auditability.

## Is there a production API available today?
Not in this repository at the moment.

> 🚧 **Planned Feature** — API endpoint groups are roadmap-defined and not yet implemented.

## Are tests already comprehensive?
No. The test command exists, but comprehensive suites are still planned.

## Where should I start as a contributor?
Start with:
1. `getting-started/quickstart`
2. `getting-started/installation`
3. `development/setup`
4. `development/conventions`

## Why are some sections marked planned or unverified?
This labeling is intentional to prevent roadmap assumptions from being interpreted as implemented behavior.
