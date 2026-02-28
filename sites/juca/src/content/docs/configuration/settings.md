---
title: "Configuration Files"
description: "Reference for all configuration files in the project root and their key settings."
lang: en
sidebar:
  order: 2
---

# Configuration Files

Juca has 11 configuration files at the project root. This page documents each one's purpose and key settings.

## File Inventory

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js framework configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Tailwind CSS v4 (minimal — tokens in CSS) |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |
| `eslint.config.mjs` | ESLint flat config with Next.js rules |
| `.env.example` | Environment variables template |
| `.env.local` | Local environment (gitignored) |
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Local Neo4j dev service |

## Next.js Configuration

Key settings in `next.config.ts`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `output` | `'standalone'` | Optimized Docker builds |
| `serverExternalPackages` | `['better-sqlite3']` | Native module support |
| Console removal | Production only (keeps warn/error/info) | Cleaner production logs |
| Security headers | X-Frame-Options, X-Content-Type-Options, etc. | OWASP best practices |
| API cache | `no-store, max-age=0` | Prevent stale API responses |

## Tailwind v4 (CSS-First)

Tailwind v4 uses a CSS-first configuration approach. Design tokens are defined in `src/app/globals.css` as CSS custom properties, not in `tailwind.config.ts`:

```css
/* src/app/globals.css — design tokens */
:root {
  --color-primary: #000000;
  --color-accent: #fff06d;
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #000000;
  --color-text-secondary: #666a6f;
  --radius-sm: 4px;
  --radius-full: 9999px;
  /* ... 50+ tokens for IRAC colors, confidence levels, KG themes, shadows */
}
```

The `tailwind.config.ts` file is minimal — it exists primarily for plugin registration.

## TypeScript Path Aliases

The `tsconfig.json` configures a single path alias:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

All imports throughout the codebase use `@/` instead of relative paths:

```typescript
import { auth } from '@/lib/auth';
import { getBlocksDB } from '@/lib/db/sessions';
```

## Git Hooks

Custom hooks in `.githooks/`:

| Hook | Action |
|------|--------|
| `pre-commit` | Runs ESLint on staged files |
| `pre-push` | Runs the full Vitest test suite |
| `post-checkout` | Cleanup tasks |
| `post-commit` | Cleanup tasks |
| `post-merge` | Cleanup tasks |

Configured via `package.json`:

```json
{ "scripts": { "prepare": "git config core.hooksPath .githooks" } }
```

## Docker

The `Dockerfile` uses a 3-stage build:

1. **deps** — `npm ci` with production dependencies
2. **build** — `next build` with standalone output
3. **runtime** — Minimal Node.js image with only production artifacts

The `docker-compose.yml` provides a local Neo4j Community 5 instance for development. This will be deprecated after the Valter migration is complete.
