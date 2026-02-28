---
title: "Guia de Contribuição"
description: "Processo e expectativas para contribuir com código, schema e documentação no Leci."
lang: pt-BR
sidebar:
  order: 4
---


# Guia de Contribuição

## Contributions must preserve legal data trust and traceability
Every contribution should improve the project without weakening schema integrity, auditability, or documentation consistency.

## Before starting work
- confirm scope is aligned with current roadmap priorities;
- ensure local setup is working;
- identify affected docs pages before coding.

## Standard contribution workflow
1. create branch (`feat/SEN-XXX-description`)
2. implement code/docs changes
3. run validation commands (`lint`, `test`, optionally `build`)
4. open PR to `main`
5. include context and impact summary in PR description

## Schema and legal-text safety checklist
- avoid direct legal-text edits outside revision function;
- keep migration artifacts explicit and reviewable;
- ensure changes to schema behavior are documented.

## Documentation expectations
Contributors must update docs when changing:
- setup commands
- configuration
- feature status
- architecture assumptions

## Review checklist
A high-quality PR should answer:
- What changed?
- Why was it necessary?
- What validation was run?
- What docs were updated?
