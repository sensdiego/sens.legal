---
title: Contributing Guide
description: How to contribute to Valter — git workflow, PR process, CI/CD pipeline, and multi-agent coordination.
lang: en
sidebar:
  order: 4

---

# Contributing Guide

This guide covers the contribution workflow for Valter, including branch naming, commit conventions, the PR process, CI validation, and the multi-agent coordination model used in this project.

## Git Workflow

### Branch naming

All branches follow a consistent naming pattern:

```
<type>/[issue-id]-[description]
```

Supported types:

| Prefix | Use |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Maintenance tasks (dependency updates, cleanup) |
| `docs/` | Documentation changes |
| `refactor/` | Code restructuring without behavior change |
| `test/` | Test additions or modifications |
| `codex/` | Changes made by the Codex agent |

Examples:

```
feat/SEN-267-mcp-auth-claude
fix/SEN-301-empty-divergence-response
chore/update-neo4j-driver
docs/configuration-reference
```

### Commit messages

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. The format is:

```
<type>: <description>
```

Valid types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

Examples:

```
feat: add divergence detection endpoint
fix: handle empty result set in phase analysis
chore: update Neo4j driver to 5.28
docs: add MCP configuration guide
refactor: extract query builder from retriever
test: add edge case tests for graph routes
```

### Starting work on a new task

Before starting any work, check that no other agent is working on conflicting branches:

```bash
git branch -a
git branch -a | grep codex   # Check for active Codex branches
```

Create your branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/SEN-XXX-description-claude
```

## Pull Request Process

### 1. Implement and validate locally

Make your changes, then run the full validation suite:

```bash
make quality   # Runs lint + mypy (scoped) + tests
```

If your changes touch graph-related code:

```bash
make validate-aura   # Required for Neo4j/graph changes
```

### 2. Open a pull request

Push your branch and open a PR against `main`. The PR must use the template from `.github/pull_request_template.md`, which includes:

- **Summary**: description of the problem, change, and expected impact
- **Change type**: checkboxes for API/Core/Stores, Graph, Migrations, Scripts, Docs
- **Validation matrix**: applicable checks completed
- **Governance**: branch naming and commit convention compliance

### 3. Validation matrix

The PR template includes a validation matrix. Mark only the items applicable to your change:

| Change Type | Required Validation |
|---|---|
| API/Core/Stores | `make lint` + `make test` + relevant regression tests |
| Graph (Neo4j/Aura) | All above + `make validate-aura` + graph-specific unit tests |
| Migrations (Alembic) | `alembic upgrade head` in a safe environment. Test `downgrade()` if the migration is reversible. If irreversible, declare it in the PR and include a contingency plan. |
| Scripts (`scripts/`) | Local or staging execution allowed. Production execution requires explicit approval, a prior `--dry-run`, and a documented rollback plan. |

### 4. External consumer impact

If your change affects the API contract (request/response format, status codes, endpoint semantics):

- Evaluate impact on external consumers (Juca frontend, MCP clients)
- Avoid breaking changes in `/v1` endpoints, or provide a versioning/deprecation plan
- Update integration documentation when contracts change
- Add or update contract tests for critical endpoints

## CI/CD Pipeline

The CI pipeline runs on every pull request:

| Stage | What it checks |
|---|---|
| Lint | `ruff check` and `ruff format --check` on `src/` and `tests/` |
| Type check | `mypy` on scoped files (deps, ingest routes, MCP tools) |
| Test | `pytest` with verbose output and short tracebacks |
| Aura validation | For PRs touching graph code: `make validate-aura` with a 15-second latency threshold |

Deployment to Railway happens automatically when changes are merged to `main`. Each Railway service (API, Worker, MCP Remote) rebuilds from the same codebase, differentiated by the `VALTER_RUNTIME` environment variable.

## Multi-Agent Coordination

Valter is developed by two AI coding agents working in parallel:

| Agent | Environment | Branch convention |
|---|---|---|
| Claude Code | Local execution | Suffix: `-claude` (e.g., `feat/SEN-267-mcp-auth-claude`) |
| Codex (OpenAI) | Cloud execution | Prefix: `codex/` (e.g., `codex/sen-217-missing-integras`) |

### Fundamental rule

**Never work on the same branch as the other agent.** Before starting any task:

```bash
# Check for active Codex branches
git branch -a | grep codex

# If a codex/ branch exists touching the same files, coordinate before proceeding
```

### Avoiding conflicts

- Each agent works on separate issues and separate files when possible
- If both agents need to modify the same file, coordinate via separate PRs merged sequentially
- Always pull the latest `main` before creating a new branch

## Authorship

Valter is the exclusive property of Diego Sens (@sensdiego). All conception, architecture, product decisions, and intellectual property belong to the author.

When AI agents contribute to implementation, commits use this format:

```
Co-Authored-By (execucao): Claude Opus 4.6 <noreply@anthropic.com>
```

The term **(execucao)** indicates that the AI agent assists with code implementation. It does not imply authorship of the design or architecture.

## Priority Order

When making decisions about implementation, resolve conflicts in this order:

1. **Correctness** -- especially for legal data, billing, and data integrity
2. **Simplicity and clarity** -- code another agent or developer understands without additional context
3. **Maintainability** -- easy to modify without breaking unrelated features
4. **Reversibility** -- prefer decisions that can be undone
5. **Performance** -- optimize only with evidence of a problem
