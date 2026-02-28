---
title: "Technology Stack"
description: "Complete technology stack with versions, justifications, and transition status for each dependency."
lang: en
sidebar:
  order: 2
---

# Technology Stack

Every dependency in Juca is here for a reason. This page lists the complete stack with versions, purposes, and current status — including which packages are transitional (will be removed when the Valter migration completes).

## Core Framework

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | ^16.1.6 | App Router, Server Components, Server Actions | **Active** |
| React | 19.2.3 | UI framework (concurrent features, use() hook) | **Active** |
| React DOM | 19.2.3 | React renderer | **Active** |
| TypeScript | ^5 | Type safety across the full stack | **Active** |
| Tailwind CSS | ^4.1.18 | CSS-first utility framework (v4) | **Active** |
| @tailwindcss/postcss | ^4.1.18 | PostCSS integration for Tailwind | **Active** |

:::note
Tailwind v4 uses a **CSS-first** approach. Design tokens are defined in `src/app/globals.css` as CSS custom properties, not in `tailwind.config.ts`. See [Conventions](/development/conventions) for details.
:::

## LLM Providers

These SDKs power the local multi-LLM pipeline. They are **transitional** — LLM processing is moving to the Valter API.

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @anthropic-ai/sdk | ^0.71.2 | Claude (Sonnet 4, Opus 4, Haiku 3.5) — generator and revisor | **Transitional** |
| openai | ^6.16.0 | OpenAI (GPT-5.x, o3) + DeepSeek (shared SDK) | **Transitional** |
| @google/generative-ai | ^0.24.1 | Gemini (2.5 Flash/Pro) | **Transitional** |
| groq-sdk | ^0.37.0 | Groq (Qwen 3 32B, Llama 3.3 70B) — critics for fast inference | **Transitional** |

## Database

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| better-sqlite3 | ^12.6.2 | Session and block persistence (WAL mode, foreign keys) | **Active** — will migrate to Postgres at v0.6+ |
| sqlite-vec | ^0.1.7-alpha.2 | Vector search extension for SQLite | **Transitional** |
| neo4j-driver | ^6.0.1 | Knowledge Graph via adapter pattern (JSON or Neo4j) | **Transitional** — KG moving to Valter |

## Authentication

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| next-auth | ^5.0.0-beta.30 | NextAuth v5 — Google OAuth + Resend magic links, JWT sessions | **Active** |

## UI Libraries

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| lucide-react | ^0.563.0 | Icon library | **Active** |
| swr | ^2.3.8 | Data fetching (minimal usage — only `useHealthCheck`) | **Under review** |

## Utilities

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| jspdf | ^4.2.0 | PDF generation from briefing sessions | **Active** |
| pdf-parse | ^2.4.5 | Parse uploaded PDF files for analysis | **Transitional** |
| uuid | ^13.0.0 | ID generation (minimal usage — only health checks) | **Under review** |
| yauzl | ^3.2.0 | ZIP extraction (ingest scripts only) | **Transitional** |

## Observability

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @opentelemetry/api | ^1.9.0 | Distributed tracing API | **Active** (opt-in) |
| @opentelemetry/sdk-node | ^0.211.0 | Node.js OTel SDK | **Active** (opt-in) |
| @opentelemetry/exporter-trace-otlp-http | ^0.211.0 | OTLP HTTP exporter | **Active** (opt-in) |

## Development Tools

| Library | Version | Purpose |
|---------|---------|---------|
| vitest | ^4.0.18 | Unit and integration testing |
| @vitest/coverage-v8 | ^4.0.18 | V8 coverage reports |
| @playwright/test | ^1.58.0 | E2E testing (Chromium only) |
| @testing-library/react | ^16.3.2 | Component testing utilities |
| @testing-library/jest-dom | ^6.9.1 | DOM assertion matchers |
| @testing-library/user-event | ^14.6.1 | User interaction simulation |
| jsdom | ^28.0.0 | Browser environment for Vitest |
| eslint | ^9 | Linting with Next.js rules |
| @next/bundle-analyzer | ^16.1.4 | Bundle size analysis |
| dotenv | ^17.2.3 | Environment variable loading |

## Build and Deploy

| Tool | Purpose |
|------|---------|
| Turbopack | Dev server (via Next.js 16) |
| Docker (multi-stage) | Production builds with standalone output |
| GitHub Actions | CI pipeline (lint + build + unit tests) |
| Railway | Production hosting (auto-deploy from `main`) |
| Git LFS | Large file storage for data files |
| Custom git hooks (`.githooks/`) | Pre-commit lint, pre-push tests |

## Dependency Health

After the structural cleanup (2026-02-28), the dependency tree is clean:

- **4 phantom dependencies removed:** zustand, @tanstack/react-virtual, next-pwa, resend
- **2 dependencies under review:** uuid and swr (minimal usage, candidates for removal)
- **All remaining dependencies** are actively imported and used in production code
- **Zero hardcoded secrets** — all API keys and URLs via environment variables
