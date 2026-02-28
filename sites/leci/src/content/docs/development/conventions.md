---
title: "Development Conventions"
description: "Coding and project conventions for naming, integrity, and contribution consistency in Leci."
lang: en
sidebar:
  order: 2
---

# Development Conventions

## Conventions reduce ambiguity in legal-domain software
Leci conventions are designed to keep legal data handling predictable while preserving contributor velocity.

## Language and typing conventions
- TypeScript strict mode is required.
- Prefer explicit types in domain-critical code paths.

## Naming conventions
- Use `kebab-case` for file names.
- Use `PascalCase` for React components.
- Keep database naming aligned with existing schema patterns.

## Data integrity conventions
The legal text mutation path is constrained by invariant:

:::danger
Do not update `document_nodes.content_text` directly. Always route edits through `leci.apply_revision()`.
:::

## Workflow conventions
- Branch naming: `feat/SEN-XXX-description`
- Commit messages should include `SEN-XXX`
- PR target branch: `main`

## Documentation conventions
- Clearly separate implemented behavior from planned behavior.
- Mark roadmap-only scope with planned-feature callouts.
- Keep en-US and pt-BR pages in structural parity.
