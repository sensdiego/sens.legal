---
title: Observability
description: Structured logging, Prometheus metrics, and OpenTelemetry tracing for monitoring Valter in production.
sidebar:
  order: 8
lang: en
---

# Observability

Valter ships with structured JSON logging, 30+ Prometheus metrics, and OpenTelemetry tracing. The instrumentation is implemented across three modules in `src/valter/observability/`: `logging.py`, `metrics.py`, and `tracing.py`.

:::caution
The metrics are fully instrumented in code, but production wiring (dashboards, alert dispatch to Slack) is a v1.0 priority item. Currently, metrics are exposed via `/metrics` and logs go to stdout for Railway to capture, but no alerting system is connected.
:::

## Logging (structlog)

Valter uses structlog for structured JSON logging. Every log entry is machine-parseable and includes contextual fields for correlation.

### Configuration

```python
# From observability/logging.py
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.PrintLoggerFactory(file=sys.stderr),
)
```

Key design decisions:

- **JSON format** to stdout/stderr -- Railway captures logs automatically
- **Logs go to stderr** so they do not interfere with MCP stdio transport (which uses stdout for JSON-RPC)
- **Context variables** via `structlog.contextvars.merge_contextvars` inject `trace_id` and other request-scoped data into every log entry
- **Log level** is configurable via `VALTER_LOG_LEVEL` (default: INFO)

### Trace ID Correlation

Every incoming request generates a `trace_id` that is injected into context variables and propagated through all log entries for that request. This allows correlating logs across the full request lifecycle -- from API handler through store queries to response serialization.

## Metrics (Prometheus)

Valter defines 30+ Prometheus metrics using the `prometheus_client` library. Metrics are exposed via `GET /metrics`, with access restricted by `VALTER_METRICS_IP_ALLOWLIST`.

### Request Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_request_duration_seconds` | Histogram | endpoint, method, status | Request duration with buckets from 10ms to 10s |
| `valter_requests_total` | Counter | endpoint, method, status | Total request count |

### MCP Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_mcp_rpc_requests_total` | Counter | rpc_method, tool, status_class | Total MCP JSON-RPC requests |
| `valter_mcp_rpc_duration_seconds` | Histogram | rpc_method, tool, status_class | MCP request duration (buckets to 60s) |
| `valter_mcp_tool_calls_total` | Counter | tool, outcome | Tool call count by outcome |
| `valter_mcp_tool_call_duration_seconds` | Histogram | tool, outcome | Tool call duration |
| `valter_mcp_auth_failures_total` | Counter | reason | Authentication failures |
| `valter_mcp_rate_limit_blocks_total` | Counter | -- | Rate-limited MCP requests |

### Rate Limiting Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_api_rate_limit_blocks_total` | Counter | reason | API requests blocked by rate limit |
| `valter_api_rate_limit_failsafe_blocks_total` | Counter | -- | API requests blocked when rate limit backend is unavailable |
| `valter_mcp_rate_limit_failsafe_blocks_total` | Counter | -- | MCP requests blocked when rate limit backend is unavailable |
| `valter_rate_limit_redis_errors_total` | Counter | surface | Redis errors in rate limiting middleware |

### Cache Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_cache_hits_total` | Counter | store | Cache hit count |
| `valter_cache_misses_total` | Counter | store | Cache miss count |

### Store Health

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_store_health` | Gauge | store | Per-store health (1=up, 0=down) |
| `valter_queue_depth` | Gauge | queue | Pending jobs in the ARQ queue |

### Ingestion Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_ingest_stage_duration_seconds` | Histogram | stage, status | Duration per ingestion stage |
| `valter_artifact_put_latency_ms` | Histogram | backend | Artifact write latency |
| `valter_artifact_get_latency_ms` | Histogram | backend | Artifact read latency |
| `valter_artifact_put_fail_total` | Counter | backend, content_type | Failed artifact writes |
| `valter_presign_issued_total` | Counter | backend | Signed URL generation count |

### Knowledge Graph Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_kg_boost_errors_total` | Counter | source | KG boost errors |
| `valter_kg_enrichment_total` | Counter | outcome | KG enrichment attempts |
| `valter_kg_boost_candidates_total` | Counter | strategy | Search results eligible for KG boost |
| `valter_kg_boost_enriched_total` | Counter | strategy | Search results actually enriched by KG boost |
| `valter_kg_boost_score` | Histogram | -- | Distribution of raw KG boost scores |

### Operational Failures

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `valter_operation_failures_total` | Counter | surface, stage, error_class | Operational failures with low-cardinality taxonomy |

:::note
The `error_class` label uses a curated taxonomy (not raw exception class names) to keep Prometheus cardinality bounded. The raw exception type is available in structured log events.
:::

## Tracing (OpenTelemetry)

OpenTelemetry tracing is configured in `observability/tracing.py` with FastAPI auto-instrumentation.

### Current Setup

```python
# From observability/tracing.py
def setup_tracing(service_name: str = "valter") -> None:
    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
    trace.set_tracer_provider(provider)
```

The current configuration exports spans to the console via `ConsoleSpanExporter`. This is useful for development but not for production monitoring.

### FastAPI Instrumentation

```python
# From observability/tracing.py
def instrument_fastapi_app(app: FastAPI) -> None:
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    FastAPIInstrumentor.instrument_app(app)
```

This auto-instruments all FastAPI endpoints with trace context propagation. The instrumentation is idempotent -- calling it multiple times on the same app has no effect.

:::tip
The production plan is to replace `ConsoleSpanExporter` with a proper backend (Jaeger, Grafana Tempo) and connect trace IDs to the structured log entries for full request lifecycle visibility.
:::

## Health Check

**Endpoint**: `GET /v1/health`

The health endpoint checks connectivity to all backend stores with a 5-second timeout per store:

| Store | What It Checks |
|-------|---------------|
| `qdrant` | Vector store connectivity |
| `neo4j` | Graph database connectivity |
| `postgres` | Document store connectivity |
| `redis` | Cache store connectivity |
| `artifact_storage` | Artifact backend (local or R2) |

Each store returns `up` or `down` with measured latency in milliseconds. The overall status is `healthy` when all stores are up, or `degraded` when any store is down. The response also includes the Valter version number and uptime.

Store health is tracked by the `valter_store_health` Prometheus gauge, enabling monitoring systems to detect degradation over time.

## Alert Rules

Six alert rules are defined in the project documentation, targeting:

- Latency p95 exceeding threshold
- Error rate exceeding threshold
- Store health degradation
- Cache hit rate drops
- Queue depth increases
- KG boost error spikes

:::caution
The alert rules exist as definitions, but no alert dispatcher is currently connected. The v1.0 plan is to wire Railway metrics to a Slack webhook for critical alerts.
:::
