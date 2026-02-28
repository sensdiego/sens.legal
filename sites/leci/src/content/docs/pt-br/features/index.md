---
title: "Índice de Funcionalidades"
description: "Catálogo de funcionalidades implementadas, em progresso e planejadas do Leci mapeadas por milestone."
lang: pt-BR
sidebar:
  order: 1
---


# Índice de Funcionalidades

## This index maps feature status to reality and planning
This page consolidates feature status across code and roadmap so readers can separate implemented capabilities from strategic intent.

## Status legend
- `Implemented`: available in current codebase.
- `In Progress`: partially implemented or scaffolded.
- `Planned`: approved roadmap scope, not yet in code.
- `Idea`: exploratory concept pending prioritization.

## Feature inventory
| Feature | Status | Milestone alignment |
|---|---|---|
| Core data model and migrations | Implemented | Foundation API (v0.1) baseline |
| Legal search foundation (FTS + vector schema) | In Progress | Foundation API / Intelligence |
| Revision and audit trail primitive | Implemented | Governance & Quality |
| Web interface (search/browse/read product UX) | In Progress | Product Beta |
| Data ingestion pipeline | Planned | Product Beta / Governance |
| Temporal trust layer | Idea / Proposed | Intelligence / Ecosystem |

## Cross-cutting capabilities
These capabilities affect every feature area:
- testing and quality gates;
- data integrity governance;
- documentation parity (en-US and pt-BR);
- LLM-oriented metadata assets (`llms.txt`, `llms-full.txt`).

## Scope discipline rule
A feature should be marked as implemented only when code paths are present and testable in this repository. Roadmap presence alone is not implementation evidence.
