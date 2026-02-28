---
title: Valter API Adapter
description: How Juca communicates with the Valter backend agent via the adapter layer.
lang: en
sidebar:
  order: 2
---

# Valter API Adapter

> The adapter layer that enables Juca to communicate with Valter's REST API for jurisprudence search, verification, and graph analysis.

## Overview

Valter is Juca's primary backend agent — a FastAPI service hosting 23,400+ STJ decisions with search, verification, knowledge graph, and LLM capabilities.

Currently, Juca communicates with Valter indirectly through its own internal API routes that replicate some of Valter's logic locally. The **adapter layer** (planned for v0.3) will provide a unified interface for calling any backend agent (Valter, Leci, future agents) directly from the orchestrator.

:::note
The adapter layer is planned for v0.3. This page documents the target Valter API surface that the adapter will consume. Until the adapter is implemented, Juca's internal routes handle the backend logic locally.
:::

## Valter API Endpoints

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/v1/retrieve` | POST | Jurisprudence search (BM25 + semantic + KG) | Briefing F1, F2; Search |
| `/v1/verify` | POST | Citation verification (sumulas, processos, ministros) | Validation pipeline |
| `/v1/graph/optimal-argument` | POST | Adversarial analysis (risks and opportunities) | Briefing F3 |
| `/v1/graph/divergencias` | GET/POST | Minister divergences on specific themes | Briefing F3; future comparison views |
| `/v1/graph/temporal-evolution` | GET | Temporal trends in jurisprudence | Future analytics |
| `/v1/similar_cases` | POST | Find cases similar to a given case | Briefing F2 |
| `/v1/factual/*` | Various | Factual analysis endpoints | Briefing F1 |
| `/health` | GET | Health check (should return 200) | Monitoring, `/api/health` |

## Authentication

Valter uses API key authentication via the `X-API-Key` header:

| Setting | Value |
|---------|-------|
| **Auth method** | `X-API-Key` header |
| **Env variable** | `VALTER_API_KEY` |
| **Base URL variable** | `VALTER_API_URL` |
| **Production URL** | `https://valter-api-production.up.railway.app` |

**Verify connectivity:**

```bash
curl -H "X-API-Key: $VALTER_API_KEY" \
  https://valter-api-production.up.railway.app/health
```

:::caution
**Pending decision #1:** The auth model for production is not finalized. Options: (A) single server-side key in Juca, (B) per-user key pass-through, (C) service-to-service token. Option A is the current approach and simplest.
:::

## Request/Response Mapping

When the adapter is implemented, Valter responses will map to Juca blocks:

| Valter Endpoint | Juca Block Type | Transformation |
|-----------------|----------------|----------------|
| `/v1/retrieve` → results | `precedent` | Each result becomes a precedent block with processo, ementa, ministro, turma |
| `/v1/retrieve` → summary | `summary` | Aggregated search summary |
| `/v1/verify` → verification | Block metadata | Verification status added to existing blocks |
| `/v1/graph/optimal-argument` → risks | `risk_balance` | Risk/opportunity pairs with weights |
| `/v1/similar_cases` → matches | `precedent_picker` | Selectable precedent cards |

## Error Handling

The adapter will implement a standard error handling strategy:

| Valter Error | Juca Behavior |
|-------------|---------------|
| 401 Unauthorized | Log error, show "Backend configuration error" to user |
| 404 Not Found | Return empty results with appropriate message |
| 429 Rate Limited | Retry with exponential backoff (Valter uses Redis-based rate limiting) |
| 500+ Server Error | Show fallback error block, log to OTel |
| Network timeout | Cancel via AbortController (#238), show timeout message |

## Planned Adapter API

The target adapter interface for v0.3:

```typescript
// Planned — src/lib/adapters/valter.ts
interface ValterAdapter {
  retrieve(params: RetrieveParams): Promise<RetrieveResponse>
  verify(params: VerifyParams): Promise<VerifyResponse>
  graphOptimalArgument(params: GraphParams): Promise<GraphResponse>
  graphDivergencias(params: DivergenciaParams): Promise<DivergenciaResponse>
  similarCases(params: SimilarParams): Promise<SimilarResponse>
  health(): Promise<HealthResponse>
}
```

The adapter will handle authentication, error mapping, response transformation, retry logic, and timeout management in a single place — keeping route handlers and server actions clean.
