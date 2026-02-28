---
title: "Mapa de Conteúdo da Documentação"
description: "Mapa de origem de cada página da documentação, com prioridade e evidências para produção de conteúdo."
lang: pt-BR
sidebar:
  order: 98
---


# Mapa de Conteúdo da Documentação

## What this file is for
This file defines the documentation production plan for Leci and makes content sourcing explicit. It exists to prevent undocumented assumptions and to keep docs tied to code, roadmap, and owner inputs.

## Priority model used in this map
- `P0` means mandatory content for shipping a usable docs site.
- `P1` means important content for maintainability and stakeholder confidence.
- `P2` means deferred content that can be published after core documentation stabilizes.

## Canonical documentation pages
| File | Planned content focus | Source of truth | Priority |
|---|---|---|---|
| `docs/index.md` | Audience-oriented entry point and navigation strategy. | `docs/architecture/PROJECT_MAP.md`, `docs/planning/ROADMAP.md`, owner input | P0 |
| `docs/getting-started/introduction.md` | Product purpose, scope boundaries, and positioning. | `PROJECT_MAP`, `ROADMAP`, owner input | P0 |
| `docs/getting-started/quickstart.md` | Minimum working setup path and baseline checks. | scripts, `.env.example`, `README.md` | P0 |
| `docs/getting-started/installation.md` | Full reproducible installation and validation workflows. | configs, `PROJECT_MAP`, owner input | P0 |
| `docs/architecture/overview.md` | Current and target architecture with boundaries and flow. | `PROJECT_MAP`, `ROADMAP`, `PREMORTEM` | P0 |
| `docs/architecture/stack.md` | Versions, responsibilities, and update policy for stack components. | `package.json`, lockfile, configs | P0 |
| `docs/architecture/decisions.md` | Active and pending architectural decisions and ADR workflow. | `ROADMAP`, `PREMORTEM`, owner input | P1 |
| `docs/architecture/diagrams.md` | Mermaid diagrams for system, data model, and workflows. | `PROJECT_MAP`, schema/migrations, roadmap | P1 |
| `docs/features/index.md` | Feature catalog with implementation status and milestone mapping. | `ROADMAP`, `PROJECT_MAP`, owner input | P0 |
| `docs/features/core-data-model-and-migrations.md` | Schema and migration behavior as a product capability. | `src/db/schema.ts`, `drizzle/0001_init.sql`, `scripts/migrate.ts` | P0 |
| `docs/features/legal-search-foundation.md` | FTS/vector foundations and planned API search behavior. | schema and roadmap | P0 |
| `docs/features/revision-and-audit-trail.md` | Edit governance and revision audit integrity. | SQL function, `AGENTS.md`, roadmap | P0 |
| `docs/features/web-interface.md` | Current UI state and planned user journeys. | `src/app/*`, roadmap | P1 |
| `docs/features/data-ingestion-pipeline.md` | Planned ingestion lifecycle and reliability model. | roadmap, premortem, owner input | P1 |
| `docs/features/temporal-trust-layer.md` | Innovation proposal for temporal legal trustability. | `INNOVATION_LAYER`, `PREMORTEM`, owner input | P2 |
| `docs/configuration/environment.md` | Environment variable reference and handling rules. | `.env.example`, scripts/workflows | P0 |
| `docs/configuration/settings.md` | Project config file reference and governance policy. | runtime/build configs | P1 |
| `docs/configuration/integrations.md` | External service setup and reliability constraints. | workflows, roadmap, owner input | P1 |
| `docs/development/setup.md` | Contributor setup and daily operation workflow. | commands, conventions, roadmap mitigations | P0 |
| `docs/development/conventions.md` | Naming, typing, and integrity conventions. | `AGENTS.md`, code patterns | P0 |
| `docs/development/testing.md` | Current test baseline and quality-gate evolution path. | scripts, roadmap, premortem | P0 |
| `docs/development/contributing.md` | End-to-end contribution process and review checklist. | repo workflow and conventions | P1 |
| `docs/roadmap/index.md` | Strategic roadmap context and governance model. | planning roadmap artifact | P1 |
| `docs/roadmap/milestones.md` | Milestone-level scopes, dependencies, and exit criteria. | planning roadmap artifact | P1 |
| `docs/roadmap/changelog.md` | Trace of roadmap changes and planning decisions. | planning governance process | P2 |
| `docs/reference/glossary.md` | Shared legal and technical vocabulary. | schema terminology, owner input | P1 |
| `docs/reference/faq.md` | Recurring setup/product/integration questions. | all docs and support patterns | P2 |
| `docs/reference/troubleshooting.md` | Operational troubleshooting for common failure modes. | scripts, setup docs, CI behavior | P1 |

## Supporting source artifacts kept in this repository
| File | Role in documentation pipeline |
|---|---|
| `docs/architecture/PROJECT_MAP.md` | Baseline technical diagnosis snapshot used for evidence-based writing. |
| `docs/planning/ROADMAP.md` | Master planning input for status labels and milestone pages. |
| `docs/planning/PREMORTEM.md` | Risk input source for mitigations and sequencing guidance. |
| `docs/planning/INNOVATION_LAYER.md` | Strategic innovation candidate input. |
| `docs/planning/REORG_PLAN.md` | Repository structure and documentation governance plan. |
| `docs/README.md` | Internal docs-folder orientation page. |
| `docs/adr/README.md` | ADR folder usage and format reference. |

## Authoring notes for subsequent documentation phases
- Fill P0 pages first when publishing to a new environment.
- Label planned behavior explicitly and avoid presenting roadmap items as implemented.
- Keep human readability and AI-agent parseability balanced in every section.
