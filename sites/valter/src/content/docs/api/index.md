---
title: API Reference
description: REST API overview — base URL, authentication, rate limiting, error handling, and pagination.
lang: en
sidebar:
  order: 1

---

# API Reference

Valter exposes a REST API on port 8000 with API key authentication, Redis-backed rate limiting, cursor-based pagination, and structured JSON error responses.

## Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:8000` |
| Production | Railway deployment URL |

All versioned endpoints use the `/v1/` prefix. Non-versioned endpoints (`/health`, `/metrics`) live at the root.

```bash
# Development
curl http://localhost:8000/v1/retrieve -X POST -H "Content-Type: application/json" ...

# Production
curl https://<railway-url>/v1/retrieve -X POST -H "Content-Type: application/json" ...
```

## Authentication

API key authentication is controlled by the `VALTER_AUTH_ENABLED` environment variable (required `true` in production).

Pass the key as a Bearer token:

```http
POST /v1/retrieve HTTP/1.1
Authorization: Bearer vlt_k1_abc123...
Content-Type: application/json
```

### Scopes

Each API key carries one or more scopes that restrict which endpoints it can access:

| Scope | Access |
|---|---|
| `read` | Search, graph queries, verify, enrich, health |
| `write` | Ingest workflows, memory creation |
| `admin` | Metrics, dataset management, all operations |

### Security

- Keys are hashed with **SHA-256** before storage (not bcrypt).
- All API key usage is logged to a persistent **audit log** with timestamp, endpoint, and key fingerprint.
- Invalid or missing keys return `401 UNAUTHORIZED`.
- Insufficient scope returns `403 FORBIDDEN`.

## Rate Limiting

Rate limiting uses a **Redis sliding window** with per-key counters (INCR).

| Operation type | Default limit | Env var |
|---|---|---|
| Read endpoints | 100 requests/min | `VALTER_RATE_LIMIT_READ` |
| Write endpoints | 10 requests/min | `VALTER_RATE_LIMIT_WRITE` |

### Response headers

Every response includes rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709136000
```

When the limit is exceeded, the API returns `429 RATE_LIMITED`.

:::caution
Rate limiting currently operates in **fail-closed** mode: if Redis is unreachable, all requests are blocked. Fail-open mode is planned for a future release.
:::

## Error Format

All errors return a consistent JSON envelope with an `error` object:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "trace_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "details": null
  }
}
```

### Error codes

| Code | HTTP Status | Description |
|---|---|---|
| `INVALID_REQUEST` | 400 | Malformed request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Valid key but insufficient scope |
| `NOT_FOUND` | 404 | Resource does not exist |
| `TIMEOUT` | 408 | Backend query exceeded time limit |
| `VALIDATION_ERROR` | 422 | Pydantic validation failure |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
| `SERVICE_UNAVAILABLE` | 503 | Backend service (Neo4j, Qdrant, etc.) unreachable |

The `trace_id` field correlates with structured logs (structlog JSON format) for debugging.

## Pagination

List endpoints support **cursor-based pagination** using opaque base64-encoded cursors.

### Request parameters

| Parameter | Type | Description |
|---|---|---|
| `cursor` | `string` | Opaque cursor from a previous response. Omit on the first request. |
| `page_size` | `integer` | Number of results per page (must be <= `top_k`). |

### Response fields

| Field | Type | Description |
|---|---|---|
| `pagination.cursor` | `string \| null` | Cursor for the next page, or `null` if no more results. |
| `pagination.has_more` | `boolean` | Whether additional pages exist. |
| `pagination.total_estimate` | `integer \| null` | Estimated total result count. |

Cursors encode the last score, last document ID, page number, and a query hash for validation. A cursor from one query cannot be reused with a different query.

```json
{
  "data": [...],
  "meta": { "trace_id": "...", "latency_ms": 42.5 },
  "pagination": {
    "cursor": "eyJsYXN0X3Njb3JlIjogMC44NSwgInBhZ2UiOiAxfQ==",
    "has_more": true,
    "total_estimate": 156
  }
}
```

## Middleware Stack

Requests pass through the middleware stack in this order:

| Order | Middleware | Purpose |
|---|---|---|
| 1 | **CORS** | Configurable allowed origins for cross-origin requests |
| 2 | **MetricsIPAllowlist** | Restricts `/metrics` access to IPs in `VALTER_METRICS_IP_ALLOWLIST` (CIDR supported). Reads `cf-connecting-ip` and `x-forwarded-for` for proxy-aware IP resolution. |
| 3 | **RequestTracking** | Assigns a `trace_id` (UUID) to each request, records Prometheus request count and duration histograms |
| 4 | **RateLimit** | Redis sliding window rate limiting per API key |
| 5 | **Authentication** | API key validation + scope checking. Skips auth for `/health`, `/metrics`, `/docs`, `/openapi.json`, `/redoc`. |

Audit logging runs within the authentication middleware for all endpoints except health, metrics, and documentation paths.

## Endpoint Groups

| Group | Key endpoints | Docs |
|---|---|---|
| Search | `POST /v1/retrieve`, `POST /v1/similar_cases`, `POST /v1/search/features`, `POST /v1/factual/dual-search` | [Search Endpoints](./search/) |
| Graph | `POST /v1/graph/*` (13 endpoints) | [Graph Endpoints](./graph/) |
| Verify & Enrich | `POST /v1/verify`, `POST /v1/context/enrich`, `POST /v1/factual/extract` | [Verify & Enrich](./verify-enrich/) |
| Ingest | `POST /v1/ingest/*` (20+ endpoints) | [Ingest Endpoints](./ingest/) |
| Admin | `GET /v1/health`, `GET /metrics`, `GET/POST /v1/memories`, `GET /v1/datasets/*` | [Admin & Utility](./admin/) |
| MCP Tools | 28 tools via stdio/HTTP | [MCP Tools Reference](./mcp-tools/) |
