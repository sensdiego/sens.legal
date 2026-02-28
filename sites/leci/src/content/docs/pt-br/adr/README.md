---
title: "Guia de ADR"
description: "Como escrever e manter Architecture Decision Records no Leci."
lang: pt-BR
sidebar:
  order: 1
---


# Guia de ADR

## Why ADRs are required in this project
Architecture Decision Records capture irreversible or high-impact technical decisions with explicit rationale. They reduce context loss when roadmap priorities, owners, or implementation details change.

## Naming convention
Create ADR files using incremental numeric prefixes:
- `0001-short-title.md`
- `0002-short-title.md`

## Required ADR structure
Each ADR should contain:
1. Context
2. Decision
3. Alternatives considered
4. Consequences

## Status model
Recommended status values:
- Proposed
- Accepted
- Superseded
- Rejected

## Update policy
When a decision changes:
- do not rewrite history in-place;
- create a new ADR that supersedes the old one;
- cross-link both files.
