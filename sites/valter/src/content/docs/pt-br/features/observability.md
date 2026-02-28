---
title: Observabilidade
description: Logging estruturado, metricas Prometheus e tracing OpenTelemetry para monitoramento do Valter em producao.
sidebar:
  order: 8
lang: pt-BR
---

# Observabilidade

O Valter inclui logging JSON estruturado, 30+ metricas Prometheus e tracing OpenTelemetry. A instrumentacao e implementada em tres modulos em `src/valter/observability/`: `logging.py`, `metrics.py` e `tracing.py`.

:::caution
As metricas estao totalmente instrumentadas no codigo, mas a configuracao de producao (dashboards, despacho de alertas para Slack) e um item prioritario do v1.0. Atualmente, as metricas sao expostas via `/metrics` e os logs vao para stdout para o Railway capturar, mas nenhum sistema de alertas esta conectado.
:::

## Logging (structlog)

O Valter usa structlog para logging JSON estruturado. Cada entrada de log e parseavel por maquina e inclui campos contextuais para correlacao.

### Configuracao

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

Decisoes de design principais:

- **Formato JSON** para stdout/stderr -- o Railway captura logs automaticamente
- **Logs vao para stderr** para nao interferirem com o transporte MCP stdio (que usa stdout para JSON-RPC)
- **Variaveis de contexto** via `structlog.contextvars.merge_contextvars` injetam `trace_id` e outros dados de escopo de requisicao em toda entrada de log
- **Nivel de log** configuravel via `VALTER_LOG_LEVEL` (padrao: INFO)

### Correlacao por Trace ID

Toda requisicao recebida gera um `trace_id` que e injetado nas variaveis de contexto e propagado por todas as entradas de log daquela requisicao. Isso permite correlacionar logs ao longo de todo o ciclo de vida da requisicao -- do handler da API, passando por queries ao store, ate a serializacao da resposta.

## Metricas (Prometheus)

O Valter define 30+ metricas Prometheus usando a biblioteca `prometheus_client`. As metricas sao expostas via `GET /metrics`, com acesso restrito por `VALTER_METRICS_IP_ALLOWLIST`.

### Metricas de Requisicao

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_request_duration_seconds` | Histogram | endpoint, method, status | Duracao da requisicao com buckets de 10ms a 10s |
| `valter_requests_total` | Counter | endpoint, method, status | Contagem total de requisicoes |

### Metricas MCP

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_mcp_rpc_requests_total` | Counter | rpc_method, tool, status_class | Total de requisicoes JSON-RPC MCP |
| `valter_mcp_rpc_duration_seconds` | Histogram | rpc_method, tool, status_class | Duracao de requisicoes MCP (buckets ate 60s) |
| `valter_mcp_tool_calls_total` | Counter | tool, outcome | Contagem de chamadas de tool por resultado |
| `valter_mcp_tool_call_duration_seconds` | Histogram | tool, outcome | Duracao de chamadas de tool |
| `valter_mcp_auth_failures_total` | Counter | reason | Falhas de autenticacao |
| `valter_mcp_rate_limit_blocks_total` | Counter | -- | Requisicoes MCP bloqueadas por rate limit |

### Metricas de Rate Limiting

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_api_rate_limit_blocks_total` | Counter | reason | Requisicoes de API bloqueadas por rate limit |
| `valter_api_rate_limit_failsafe_blocks_total` | Counter | -- | Requisicoes de API bloqueadas quando o backend de rate limit esta indisponivel |
| `valter_mcp_rate_limit_failsafe_blocks_total` | Counter | -- | Requisicoes MCP bloqueadas quando o backend de rate limit esta indisponivel |
| `valter_rate_limit_redis_errors_total` | Counter | surface | Erros do Redis no middleware de rate limiting |

### Metricas de Cache

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_cache_hits_total` | Counter | store | Contagem de cache hits |
| `valter_cache_misses_total` | Counter | store | Contagem de cache misses |

### Saude dos Stores

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_store_health` | Gauge | store | Saude por store (1=up, 0=down) |
| `valter_queue_depth` | Gauge | queue | Jobs pendentes na fila ARQ |

### Metricas de Ingestao

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_ingest_stage_duration_seconds` | Histogram | stage, status | Duracao por estagio de ingestao |
| `valter_artifact_put_latency_ms` | Histogram | backend | Latencia de escrita de artefato |
| `valter_artifact_get_latency_ms` | Histogram | backend | Latencia de leitura de artefato |
| `valter_artifact_put_fail_total` | Counter | backend, content_type | Escritas de artefato com falha |
| `valter_presign_issued_total` | Counter | backend | Contagem de geracao de URLs assinadas |

### Metricas do Knowledge Graph

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_kg_boost_errors_total` | Counter | source | Erros de KG boost |
| `valter_kg_enrichment_total` | Counter | outcome | Tentativas de enriquecimento via KG |
| `valter_kg_boost_candidates_total` | Counter | strategy | Resultados de busca elegiveis para KG boost |
| `valter_kg_boost_enriched_total` | Counter | strategy | Resultados de busca efetivamente enriquecidos pelo KG boost |
| `valter_kg_boost_score` | Histogram | -- | Distribuicao dos scores brutos de KG boost |

### Falhas Operacionais

| Metrica | Tipo | Labels | Descricao |
|---------|------|--------|-----------|
| `valter_operation_failures_total` | Counter | surface, stage, error_class | Falhas operacionais com taxonomia de baixa cardinalidade |

:::note
O label `error_class` usa uma taxonomia curada (nao nomes brutos de classes de excecao) para manter a cardinalidade do Prometheus limitada. O tipo de excecao bruto esta disponivel nos eventos de log estruturado.
:::

## Tracing (OpenTelemetry)

O tracing OpenTelemetry e configurado em `observability/tracing.py` com auto-instrumentacao do FastAPI.

### Setup Atual

```python
# From observability/tracing.py
def setup_tracing(service_name: str = "valter") -> None:
    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
    trace.set_tracer_provider(provider)
```

A configuracao atual exporta spans para o console via `ConsoleSpanExporter`. Isso e util para desenvolvimento, mas nao para monitoramento em producao.

### Instrumentacao FastAPI

```python
# From observability/tracing.py
def instrument_fastapi_app(app: FastAPI) -> None:
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    FastAPIInstrumentor.instrument_app(app)
```

Isso auto-instrumenta todos os endpoints FastAPI com propagacao de contexto de trace. A instrumentacao e idempotente -- chama-la varias vezes no mesmo app nao tem efeito.

:::tip
O plano de producao e substituir o `ConsoleSpanExporter` por um backend adequado (Jaeger, Grafana Tempo) e conectar os trace IDs as entradas de log estruturado para visibilidade completa do ciclo de vida da requisicao.
:::

## Health Check

**Endpoint**: `GET /v1/health`

O endpoint de health check verifica a conectividade com todos os stores de backend com timeout de 5 segundos por store:

| Store | O Que Verifica |
|-------|---------------|
| `qdrant` | Conectividade com o vector store |
| `neo4j` | Conectividade com o banco de dados de grafo |
| `postgres` | Conectividade com o document store |
| `redis` | Conectividade com o cache store |
| `artifact_storage` | Backend de artefatos (local ou R2) |

Cada store retorna `up` ou `down` com latencia medida em milissegundos. O status geral e `healthy` quando todos os stores estao ativos, ou `degraded` quando algum store esta indisponivel. A resposta tambem inclui o numero da versao do Valter e o uptime.

A saude dos stores e rastreada pelo gauge Prometheus `valter_store_health`, permitindo que sistemas de monitoramento detectem degradacao ao longo do tempo.

## Regras de Alerta

Seis regras de alerta estao definidas na documentacao do projeto, cobrindo:

- Latencia p95 excedendo o limite
- Taxa de erros excedendo o limite
- Degradacao da saude dos stores
- Queda na taxa de cache hit
- Aumento na profundidade da fila
- Picos de erros de KG boost

:::caution
As regras de alerta existem como definicoes, mas nenhum dispatcher de alertas esta conectado atualmente. O plano do v1.0 e conectar as metricas do Railway a um webhook do Slack para alertas criticos.
:::
