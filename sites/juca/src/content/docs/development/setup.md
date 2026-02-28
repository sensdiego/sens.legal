---
title: "Development Setup"
description: "How to set up a local development environment and the daily workflow for contributing to Juca."
lang: en
sidebar:
  order: 1
---

# Development Setup

This page covers the daily development workflow after initial installation. For first-time setup, see [Installation](/getting-started/installation).

## Development Workflow

The standard development cycle:

1. **Pull latest** from `main`
2. **Create feature branch:** `git checkout -b feature/[issue]-description-claude`
3. **Start dev server:** `npm run dev` (Turbopack)
4. **Make changes** following [coding conventions](/development/conventions)
5. **Run tests locally:** `npm test` (or let pre-push hook handle it)
6. **Push** — pre-push hook runs tests, CI runs lint + build + tests
7. **Create PR** targeting `main`

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev` | Start Turbopack dev server at localhost:3000 |
| `npm test` | `vitest run` | Run all Vitest unit tests |
| `npm run test:watch` | `vitest` | Watch mode — re-runs on file changes |
| `npm run test:coverage` | `vitest run --coverage` | Generate V8 coverage report |
| `npm run test:e2e` | `playwright test` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | `playwright test --ui` | Playwright UI mode (visual debugging) |
| `npm run test:e2e:headed` | `playwright test --headed` | E2E with visible browser |
| `npm run lint` | `eslint` | ESLint check |
| `npm run analyze` | `ANALYZE=true next build` | Bundle size analysis |
| `npm run prepare` | `git config core.hooksPath .githooks` | Configure git hooks |

## Multi-Agent Development

This project uses two AI code agents working in parallel:

| Agent | Environment | Branch Suffix |
|-------|------------|--------------|
| **Claude Code** | Local execution | `-claude` |
| **Codex** (OpenAI) | Cloud execution | `-codex` |

:::danger
**Never work on a Codex branch.** Before starting work, always check:
```bash
git branch -a | grep codex
```
If a `-codex` branch exists for your feature, do not touch the same files.
:::

## Important Rules

These rules come from `CLAUDE.md` and apply to all contributors (human and AI):

1. **Never run `next build`, `webpack`, `docker build`, or any build that consumes >50% CPU locally.** Push to your branch and let CI handle it.
2. **Prefer editing existing code** over creating new abstractions.
3. **When unsure:** ask, propose minimal approach, default to simplest reversible solution.
4. **Priority order:** Correctness > Simplicity > Maintainability > Reversibility > Performance.
5. **Never skip git hooks** (`--no-verify`) unless explicitly instructed.
