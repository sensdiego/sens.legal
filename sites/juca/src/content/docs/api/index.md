---
title: API Reference
description: Overview of Juca's API surface — internal routes, Valter adapter, and server actions.
lang: en
sidebar:
  order: 1
---

# API Reference

> Overview of Juca's API surface — internal routes, Valter adapter layer, and server actions.

## API Architecture

Juca's API surface has three layers:

1. **Internal API Routes** — ~55 endpoints in `src/app/api/` serving the frontend. Many are transitional and will be replaced by direct Valter API calls.
2. **Valter Adapter** (planned for v0.3) — abstraction layer for calling Valter and future backend agents via a unified interface.
3. **Server Actions** — `src/actions/` for client-to-server mutations (briefing phase transitions, session management).

:::caution
The internal API routes under `/api/chat/*`, `/api/analyzer/*`, `/api/kg/*`, `/api/reasoning/*`, and `/api/search/*` are **transitional**. Their backend logic is being migrated to Valter. Do not build new features against these endpoints — use the Valter adapter instead (once available in v0.3).
:::

## Route Groups

| Group | Path | Endpoints | Status | Purpose |
|-------|------|-----------|--------|---------|
| **Unified** | `/api/unified/*` | 4 | Active | Hub session management and analysis |
| **Export** | `/api/export/*` | 1 | Active | PDF export |
| **Auth** | `/api/auth/*` | 1 | Active | NextAuth handler |
| **Health** | `/api/health` | 1 | Active | System health check |
| **Metrics** | `/api/metrics` | 1 | Active | Application metrics |
| **Feedback** | `/api/feedback/*` | 2 | Active | User feedback |
| **Chat** | `/api/chat/*` | 6 | Transitional | Chat pipeline (SSE) |
| **Analyzer** | `/api/analyzer/*` | 8 | Transitional | Case analysis pipeline |
| **Search** | `/api/search/*` | 2 | Transitional | Hybrid jurisprudence search |
| **KG** | `/api/kg/*` | 14 | Transitional | Knowledge graph queries |
| **Reasoning** | `/api/reasoning/*` | 4 | Transitional | IRAC extraction |
| **Comparator** | `/api/comparator/*` | 2 | Transitional | Multi-model comparison |
| **Reference** | `/api/reference/*` | 2 | Transitional | Reference data |
| **Citations** | `/api/citations/*` | 1 | Transitional | Citation statistics |

## Authentication

All API routes (except `/api/health`) require authentication:

**Production:** NextAuth JWT session via `auth()` from `@/lib/auth`.

**Development:** Set `ENABLE_DEV_AUTH=true` in `.env.local` to bypass authentication with a dev user.

```typescript
// Standard pattern in every API route
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  // ...
}
```

:::tip
Server Actions use a different auth pattern — `requireActionAuth()` from `@/actions/utils`. See [Coding Conventions](/development/conventions) for details.
:::

## Response Envelope

All JSON API responses follow a standard envelope pattern defined in `src/types/api.ts`:

**Success:**

```json
{
  "success": true,
  "data": { },
  "metadata": { "timestamp": "2026-02-28T...", "duration_ms": 123 }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parameter X is required",
    "details": { }
  }
}
```

**Standard error codes:** `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `RATE_LIMITED`, `TIMEOUT`.

**SSE streaming routes** use a different convention:
- `event: stage` — free-form progress payload (does not use the envelope)
- `event: result` — uses the `ApiSuccess` envelope
- `event: error` — uses the `ApiError` envelope

The API client at `src/lib/api/client.ts` automatically unwraps the envelope: success returns `data`, failure throws `ApiClientError` with `code` and `details`.

## Detailed References

- [Valter Adapter](/api/valter-adapter) — How Juca communicates with Valter
- [Unified Endpoints](/api/unified) — Core hub operations (sessions, analysis)
- [Briefing Endpoints](/api/briefing) — Briefing-specific server actions and routes
- [Export Endpoints](/api/export) — PDF and document export
