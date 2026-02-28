---
title: Endpoints Admin & Utilidades
description: Referencia da API para health checks, metricas, memoria de sessao e gerenciamento de datasets.
lang: pt-BR
sidebar:
  order: 6

---

# Endpoints Admin & Utilidades

Health do sistema, metricas Prometheus, memoria de sessao e endpoints de gerenciamento de datasets.

## GET /v1/health

Health check abrangente de todos os servicos backend. Nao requer autenticacao.

Verifica conectividade e latencia de cada servico com timeout de 5 segundos por verificacao:

| Servico | Descricao |
|---|---|
| `qdrant` | Motor de busca vetorial |
| `neo4j` | Banco de dados de knowledge graph |
| `postgres` | Banco de dados relacional principal |
| `redis` | Cache e rate limiting |
| `artifact_storage` | Armazenamento de arquivos (R2 ou local) |
| `worker_ingest` | Heartbeat do worker ARQ em background (armazenado no Redis) |

### Status geral

O campo `status` agrega a saude individual dos servicos:

| Status | Significado |
|---|---|
| `healthy` | Todos os servicos operacionais |
| `degraded` | Um ou mais servicos fora, mas sistema parcialmente funcional |
| `unhealthy` | Todos os servicos fora |

### Exemplo de request

```bash
curl http://localhost:8000/v1/health
```

### Exemplo de resposta

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
O endpoint de health tambem exporta o status de cada servico para o Prometheus via gauge `store_health`, possibilitando alertas sobre servicos degradados.
:::

## GET /metrics

Endpoint de metricas em formato Prometheus. O acesso e restrito por allowlist de IPs.

### Controle de acesso

O endpoint e protegido pelo `MetricsIPAllowlistMiddleware`:

- IPs permitidos sao configurados via `VALTER_METRICS_IP_ALLOWLIST` (notacao CIDR suportada, ex.: `10.0.0.0/8`).
- A resolucao de IP respeita `cf-connecting-ip` (Cloudflare) e `x-forwarded-for` (proxies genericos).
- Se a allowlist estiver vazia, o endpoint retorna `403 Forbidden`.
- Requests de IPs nao permitidos retornam `403 Forbidden`.

### Metricas exportadas

O endpoint Prometheus exporta contadores, histogramas e gauges incluindo:

- `valter_request_count` -- Contagem total de requests HTTP por metodo, caminho, status
- `valter_request_duration_seconds` -- Histograma de latencia de requests
- `valter_store_health` -- Gauge de saude por servico (1 = up, 0 = down)
- `valter_rate_limit_blocks_total` -- Eventos de bloqueio por rate limit
- `valter_rate_limit_redis_errors_total` -- Erros do Redis durante rate limiting

```bash
curl http://localhost:8000/metrics
```

## Memoria de Sessao

Armazenamento chave-valor com escopo de sessao, suportado por PostgreSQL com TTL configuravel. Usado pelas MCP tools para manter contexto de conversacao entre chamadas de tools.

### POST /v1/memories

Armazena um par chave-valor com TTL opcional para contexto de sessao.

| Parametro | Tipo | Padrao | Descricao |
|---|---|---|---|
| `session_id` | `string` | **obrigatorio** | Identificador de sessao para escopo das entradas de memoria |
| `key` | `string` | **obrigatorio** | Chave da memoria (semantica de upsert por session_id + key) |
| `value` | `string` | **obrigatorio** | Payload do valor da memoria |
| `ttl_seconds` | `integer` | `86400` | Time-to-live em segundos (60 a 2.592.000 = 30 dias) |

### Exemplo de request

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

### Exemplo de resposta

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

Lista todas as memorias de uma sessao.

| Parametro | Tipo | Descricao |
|---|---|---|
| `session_id` | `string` (query) | Identificador de sessao (**obrigatorio**) |

### Exemplo de request

```bash
curl "http://localhost:8000/v1/memories?session_id=session-abc123" \
  -H "Authorization: Bearer $API_KEY"
```

### Exemplo de resposta

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
As memorias usam semantica de upsert: armazenar um valor com um par `session_id` + `key` existente substitui o valor anterior. Memorias expiradas sao automaticamente excluidas dos resultados de listagem.
:::

## Gerenciamento de Datasets

### GET /v1/datasets/uploads/{dataset_item_id}

Recupera metadados de um item de dataset previamente carregado. Retorna detalhes de armazenamento, metadados do arquivo e informacoes de proveniencia.

| Parametro | Tipo | Descricao |
|---|---|---|
| `dataset_item_id` | `string` (path) | Identificador do item de dataset |

### Exemplo de request

```bash
curl http://localhost:8000/v1/datasets/uploads/ds-item-789 \
  -H "Authorization: Bearer $API_KEY"
```

### Exemplo de resposta

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
