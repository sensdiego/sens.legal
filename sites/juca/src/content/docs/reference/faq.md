---
title: FAQ
description: Frequently asked questions about Juca, its architecture, and development.
lang: en
sidebar:
  order: 2
---

# Frequently Asked Questions

> Common questions about Juca, its architecture, development workflow, and the sens.legal ecosystem.

## General

### What is Juca?

Juca is a **frontend hub** for the sens.legal legal AI ecosystem. It provides a conversational interface (Fintool/Perplexity-style) that orchestrates specialized backend agents to help legal professionals research jurisprudence, analyze cases, and produce structured legal documents. See [Introduction](/getting-started/introduction) for the full overview.

### How does Juca relate to Valter and Leci?

Juca is the **frontend hub** — it handles UI, session management, and orchestration. **Valter** is the backend agent for STJ jurisprudence (search, verification, knowledge graph, LLM analysis). **Leci** is a planned backend agent for federal legislation. Juca calls their APIs and renders results. See [Ecosystem](/architecture/ecosystem) for details.

### Is Juca open source?

Juca is currently a private project in active development. Licensing and open-source status have not been finalized.

## Architecture

### Why is Juca a "hub" instead of a full application?

Juca originally was a fullstack monolith with embedded search, LLM pipeline, and knowledge graph. This duplicated logic already in Valter. The hub pivot eliminates duplication — Juca focuses on what it does best (UI/UX, orchestration, progressive disclosure) while Valter handles backend intelligence. See [ADR-006](/architecture/decisions#adr-006-hub-pivot).

### Why not just use Valter directly?

Valter is a backend API service — it has no user interface. Juca adds:
- **Progressive disclosure** — the 4-phase Briefing Progressivo
- **Session management** — persistent sessions with block history
- **Multi-agent orchestration** — routes queries to the right backend agent
- **Rich UI** — interactive blocks, visualizations, PDF export
- **Authentication** — user accounts, access control

### What happens to the local backend code?

The local backend (`src/lib/backend/`) is being deprecated in v0.3-v0.4. Search, LLM pipeline, and KG queries will move to Valter API calls. The ~55 internal API routes will be gradually removed as each capability migrates. See [Roadmap](/roadmap/milestones#v04--briefing-progressivo).

### Why SQLite instead of PostgreSQL?

SQLite was chosen for simplicity during single-developer development. It requires no external database server, works well for the current user scale, and uses WAL mode for concurrent reads. Migration to PostgreSQL is planned for v0.6+ (Issue #231) to align with the ecosystem (Valter and Leci both use Postgres). See [ADR-002](/architecture/decisions#adr-002-sqlite-for-sessions).

## Development

### Why can't I run `next build` locally?

Project rules (from `CLAUDE.md`) prohibit running builds, bundlers, or any process consuming >50% CPU locally. This saves development machine resources and delegates build validation to CI (GitHub Actions) and deployment (Railway). Push your branch and let CI verify the build.

### How do I add a new block type?

See the step-by-step guide in [Block System — Adding a New Block Type](/features/block-system#adding-a-new-block-type). In summary: define the type in `BlockType`, create a factory function, build a renderer component, and register it in `BlockRenderer`.

### How do I run tests?

```bash
npm test              # Unit tests (single run)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # E2E tests (Playwright)
```

See [Testing Guide](/development/testing) for full details.

### What's the branch naming convention?

`feature/[issue]-[description]-claude` for Claude Code branches, `feature/[issue]-[description]-codex` for Codex branches. Always include the GitHub issue number. See [Contributing Guide](/development/contributing).

## Troubleshooting

### Tests are failing — what do I do?

72 test files are currently known to fail (Issue #270). Many test backend code that is being migrated to Valter. Check [Troubleshooting](/reference/troubleshooting) for specific solutions, and note that re-evaluation of which tests are still relevant is planned for v0.3.

### I'm getting auth errors in development

Set `ENABLE_DEV_AUTH=true` in your `.env.local` file to bypass authentication with a dev user. See [Environment Variables](/configuration/environment) for all auth-related variables.

### The app is slow or timing out

Common causes:
1. **Valter API unreachable** — check `curl -H "X-API-Key: $VALTER_API_KEY" $VALTER_API_URL/health`
2. **Missing LLM API keys** — at minimum, configure `ANTHROPIC_API_KEY` and `GROQ_API_KEY`
3. **SQLite lock** — ensure only one dev server is running; check for orphan Node processes

See [Troubleshooting](/reference/troubleshooting) for detailed solutions.
