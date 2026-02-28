---
title: "Quickstart"
description: "Get Juca running locally in under 5 minutes with minimal configuration."
lang: en
sidebar:
  order: 2
---

# Quickstart

This guide gets Juca running on your machine with the minimum viable configuration. For a complete setup including all optional services, see [Installation](/getting-started/installation).

## Prerequisites

- **Node.js 20+** — verify with `node -v`
- **npm** — ships with Node.js
- At least one LLM API key (Anthropic recommended)

## 1. Clone and Install

```bash
git clone https://github.com/sensdiego/juca.git
cd juca
npm install
```

:::caution
If you see errors about `better-sqlite3` during install, you may need C++ build tools. On macOS: `xcode-select --install`. On Linux: `apt-get install build-essential`.
:::

## 2. Configure Environment

Create a `.env.local` file with the minimum required variables:

```bash
# Required — at least one LLM provider
ANTHROPIC_API_KEY=sk-ant-your-key-here
GROQ_API_KEY=gsk_your-key-here

# Skip authentication for local development
ENABLE_DEV_AUTH=true
```

:::tip
For full functionality with Valter integration, also add:
```bash
VALTER_API_URL=https://valter-api-production.up.railway.app
VALTER_API_KEY=your-valter-api-key
```
:::

## 3. Start the Dev Server

```bash
npm run dev
```

The Turbopack dev server starts at [http://localhost:3000](http://localhost:3000).

:::danger
**Never run `next build` locally.** This is a project rule — builds consume excessive CPU. Push your code and let CI (GitHub Actions) or Railway handle builds. See [CLAUDE.md](/development/contributing) for details.
:::

## 4. First Interaction

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You'll see the WorkCanvas with the Composer input at the bottom
3. Type a legal query, e.g.: *"Qual a jurisprudência do STJ sobre responsabilidade civil por dano moral?"*
4. Watch as blocks appear in real-time via SSE streaming — the system detects your intent, routes to the appropriate tool, and renders structured results

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Start Turbopack dev server |
| Unit tests | `npm test` | Run Vitest unit tests |
| E2E tests | `npm run test:e2e` | Run Playwright E2E tests |
| Lint | `npm run lint` | ESLint check |
| Coverage | `npm run test:coverage` | Generate V8 coverage report |

## Next Steps

- **[Full Installation](/getting-started/installation)** — Set up all optional services (Neo4j, embedding service, auth providers)
- **[Environment Variables](/configuration/environment)** — Complete reference for all 30+ env vars
- **[Architecture Overview](/architecture/overview)** — Understand how Juca's hub model works
