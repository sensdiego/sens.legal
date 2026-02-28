---
title: Admin & Utility Endpoints
description: API reference for health checks, metrics, session memory, and dataset management.
lang: en
sidebar:
  order: 6

---

# Admin & Utility Endpoints

System health, Prometheus metrics, session memory, and dataset management endpoints.

## GET /v1/health

Comprehensive health check of all backend services. No authentication required.

Checks connectivity and latency for each service with a 5-second timeout per check:

| Service | Description |
|---|---|
| `qdrant` | Vector search engine |
| `neo4j` | Knowledge graph database |
| `postgres` | Primary relational database |
| `redis` | Cache and rate limiting |
| `artifact_storage` | File storage (R2 or local) |
| `worker_ingest` | ARQ background worker heartbeat (stored in Redis) |

### Overall status

The `status` field aggregates individual service health:

| Status | Meaning |
|---|---|
| `healthy` | All services operational |
| `degraded` | One or more services down, but system partially functional |
| `unhealthy` | All services down |

### Example request

```bash
curl http://localhost:8000/v1/health
```

### Example response

```json
{
  "status": "healthy",
  "version": "0.12.0",
  "stores": [
    { "name": "qdrant", "status": "up", "latency_ms": 3.2 },
    { "name": "neo4j", "status": "up", "latency_ms": 15.8 },
    { "name": "postgres", "status": "up", "latency_ms": 2.1 },
    { "name": "redis", "status": "up", "latency_ms": 0.8 },
    { "name": "artifact_storage", "status": "up", "latency_ms": 45.3 },
    { "name": "worker_ingest", "status": "up", "latency_ms": 1.2 }
  ],
  "uptime_seconds": 86423.15
}
```

:::note
The health endpoint also exports each service status to Prometheus via the `store_health` gauge, enabling alerting on degraded services.
:::

## GET /metrics

Prometheus-format metrics endpoint. Access is restricted by IP allowlist.

### Access control

The endpoint is protected by the `MetricsIPAllowlistMiddleware`:

- Allowed IPs are configured via `VALTER_METRICS_IP_ALLOWLIST` (CIDR notation supported, e.g., `10.0.0.0/8`).
- IP resolution respects `cf-connecting-ip` (Cloudflare) and `x-forwarded-for` (generic proxies).
- If the allowlist is empty, the endpoint returns `403 Forbidden`.
- Requests from non-allowed IPs return `403 Forbidden`.

### Exported metrics

The Prometheus endpoint exports counters, histograms, and gauges including:

- `valter_request_count` -- Total HTTP request count by method, path, status
- `valter_request_duration_seconds` -- Request latency histogram
- `valter_store_health` -- Per-service health gauge (1 = up, 0 = down)
- `valter_rate_limit_blocks_total` -- Rate limit block events
- `valter_rate_limit_redis_errors_total` -- Redis errors during rate limiting

```bash
curl http://localhost:8000/metrics
```

## Session Memory

Session-scoped key-value storage backed by PostgreSQL with configurable TTL. Used by MCP tools to maintain conversation context across tool calls.

### POST /v1/memories

Store a key-value pair with optional TTL for session context.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `session_id` | `string` | **required** | Session identifier to scope memory entries |
| `key` | `string` | **required** | Memory key (upsert semantics by session_id + key) |
| `value` | `string` | **required** | Memory value payload |
| `ttl_seconds` | `integer` | `86400` | Time-to-live in seconds (60 to 2,592,000 = 30 days) |

### Example request

```bash
curl -X POST http://localhost:8000/v1/memories \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-abc123",
    "key": "caso_atual",
    "value": "REsp 1.234.567/SP - dano moral por atraso de voo",
    "ttl_seconds": 3600
  }'
```

### Example response

```json
{
  "data": {
    "id": "mem-d4e5f6a7-b8c9-0123-def0-123456789abc",
    "session_id": "session-abc123",
    "key": "caso_atual",
    "value": "REsp 1.234.567/SP - dano moral por atraso de voo"
  },
  "meta": {
    "trace_id": "a1b2c3d4-...",
    "latency_ms": 5.3
  }
}
```

### GET /v1/memories

List all memories for a session.

| Parameter | Type | Description |
|---|---|---|
| `session_id` | `string` (query) | Session identifier (**required**) |

### Example request

```bash
curl "http://localhost:8000/v1/memories?session_id=session-abc123" \
  -H "Authorization: Bearer $API_KEY"
```

### Example response

```json
{
  "data": [
    {
      "id": "mem-d4e5f6a7-...",
      "session_id": "session-abc123",
      "key": "caso_atual",
      "value": "REsp 1.234.567/SP - dano moral por atraso de voo",
      "created_at": "2026-02-28T14:30:00+00:00",
      "expires_at": "2026-02-28T15:30:00+00:00"
    }
  ],
  "meta": {
    "trace_id": "b2c3d4e5-...",
    "latency_ms": 3.1
  }
}
```

:::tip
Memories use upsert semantics: storing a value with an existing `session_id` + `key` pair replaces the previous value. Expired memories are automatically excluded from list results.
:::

## Dataset Management

### GET /v1/datasets/uploads/{dataset_item_id}

Retrieve metadata for a previously uploaded dataset item. Returns storage details, file metadata, and provenance information.

| Parameter | Type | Description |
|---|---|---|
| `dataset_item_id` | `string` (path) | Dataset item identifier |

### Example request

```bash
curl http://localhost:8000/v1/datasets/uploads/ds-item-789 \
  -H "Authorization: Bearer $API_KEY"
```

### Example response

```json
{
  "data": {
    "id": "ds-item-789",
    "sha256": "a1b2c3d4e5f6...",
    "original_filename": "processo-12345.pdf",
    "size_bytes": 2048576,
    "storage_path": "/data/uploads/processo-12345.pdf",
    "storage_backend": "r2",
    "bucket": "valter-artifacts",
    "object_key": "uploads/ds-item-789/processo-12345.pdf",
    "storage_uri": "r2://valter-artifacts/uploads/ds-item-789/processo-12345.pdf",
    "source_system": "projudi",
    "extraction_id": "ext-abc123",
    "included_policy": "full",
    "created_at": "2026-02-28T10:00:00+00:00"
  },
  "meta": {
    "trace_id": "c3d4e5f6-...",
    "latency_ms": 8.4
  }
}
```
