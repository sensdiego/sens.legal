---
title: "Documentation Directory Guide"
description: "Guide to the docs folder structure and where architecture, planning, and reference artifacts live."
lang: en
sidebar:
  order: 99
---

# Documentation Directory Guide

## Purpose of this page
This page explains how the `docs/` directory is organized and where each category of documentation should be updated. It is intended for maintainers and contributors who need to quickly locate the correct source file.

## Architecture documents
Architecture-focused content is stored under `docs/architecture/`.

Key files:
- `overview.md`
- `stack.md`
- `decisions.md`
- `diagrams.md`
- `PROJECT_MAP.md` (diagnostic input artifact)

## Planning documents
Planning and strategy artifacts are stored under `docs/planning/`.

Key files:
- `ROADMAP.md`
- `PREMORTEM.md`
- `INNOVATION_LAYER.md`
- `REORG_PLAN.md`

## ADR documents
Architecture Decision Records live under `docs/adr/`.

Current status:
- `docs/adr/README.md` defines ADR structure and naming conventions.
- Individual ADR entries should be added as numbered files.

## Localization structure
Portuguese localized pages live under `docs/pt-br/` and should mirror English slugs and section structure. Every new en-US page should receive a pt-BR counterpart in the same documentation update cycle.
