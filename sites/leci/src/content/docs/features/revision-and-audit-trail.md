---
title: "Revision and Audit Trail"
description: "Controlled legal text correction workflow with immutable revision records and governance constraints."
lang: en
sidebar:
  order: 4
---

# Revision and Audit Trail

## This feature protects legal text integrity over time
Leci includes a dedicated revision path to ensure legal content changes are traceable and attributable. This avoids silent edits that would undermine trust in legal outputs.

## Current implemented mechanism
The SQL function `leci.apply_revision(...)` performs controlled updates and logs revision records. It restricts editable fields to legal text-sensitive columns and records old/new values, actor, reason, and optional suggestion linkage.

## Suggestion-to-revision lifecycle
The intended flow is:
1. suggestion submitted against a node;
2. revision applied via `apply_revision`;
3. revision persisted in `revisions`;
4. linked suggestion status updated to `applied`.

## Non-negotiable invariant
:::danger
Never update `document_nodes.content_text`, `heading`, or `number` directly in application or SQL scripts. Use `leci.apply_revision()`.
:::

## Governance status
> 🚧 **Planned Feature** — Reviewer roles, approval policy, and SLA-based governance workflow are roadmap-defined and not fully implemented yet.

## Audit quality checks
Recommended checks for operational maturity:
- every legal text update has a revision record;
- revision actor and reason are not null in governed flows;
- suggestion state transitions are consistent when linked.
