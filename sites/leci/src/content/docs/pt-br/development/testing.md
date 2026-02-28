---
title: "Estratégia de Testes"
description: "Baseline atual de testes e roadmap para estabelecer gates robustos de qualidade nas camadas do Leci."
lang: pt-BR
sidebar:
  order: 3
---


# Estratégia de Testes

## Testing is currently a baseline command with roadmap expansion
The repository currently exposes `npm test` via Node's built-in test runner, but test suites are not yet implemented. This is a known maturity gap tracked in planning.

## Current state
- command exists: `npm test`
- suites implemented: none yet
- lint gate available: `npm run lint`

## Planned quality evolution
> 🚧 **Planned Feature** — Full test coverage across schema, API, and UI is roadmap-defined and not yet implemented.

Planned priorities:
1. migration and schema integrity tests;
2. core flow integration tests;
3. API contract tests (once API exists);
4. UI behavior tests for product flows.

## Minimum quality gates for contributors
Even before full suites are available, every contribution should run:

```bash
npm run lint
npm test
npm run build
```

## Risk perspective
Lack of tests is not only a technical debt item; it is a product risk in legal systems where correctness has trust impact.
