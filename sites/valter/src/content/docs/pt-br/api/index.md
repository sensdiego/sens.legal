---
title: Referencia da API
description: Visao geral da API REST — URL base, autenticacao, rate limiting, tratamento de erros e paginacao.
lang: pt-BR
sidebar:
  order: 1

---

# Referencia da API

O Valter expoe uma API REST na porta 8000 com autenticacao por API key, rate limiting via Redis, paginacao baseada em cursor e respostas de erro em JSON estruturado.

## URL Base

| Ambiente | URL |
|---|---|
| Desenvolvimento | `http://localhost:8000` |
| Producao | URL do deploy na Railway |

Todos os endpoints versionados usam o prefixo `/v1/`. Endpoints sem versionamento (`/health`, `/metrics`) ficam na raiz.

```bash
# Development
curl http://localhost:8000/v1/retrieve -X POST -H "Content-Type: application/json" ...

# Production
curl https://<railway-url>/v1/retrieve -X POST -H "Content-Type: application/json" ...
```

## Autenticacao

A autenticacao por API key e controlada pela variavel de ambiente `VALTER_AUTH_ENABLED` (obrigatoriamente `true` em producao).

Passe a key como Bearer token:

```http
POST /v1/retrieve HTTP/1.1
Authorization: Bearer vlt_k1_abc123...
Content-Type: application/json
```

### Scopes

Cada API key carrega um ou mais scopes que restringem quais endpoints ela pode acessar:

| Scope | Acesso |
|---|---|
| `read` | Search, consultas de grafo, verify, enrich, health |
| `write` | Workflows de ingestao, criacao de memorias |
| `admin` | Metricas, gerenciamento de datasets, todas as operacoes |

### Seguranca

- As keys sao hasheadas com **SHA-256** antes do armazenamento (nao bcrypt).
- Todo uso de API key e registrado em um **audit log** persistente com timestamp, endpoint e fingerprint da key.
- Keys invalidas ou ausentes retornam `401 UNAUTHORIZED`.
- Scope insuficiente retorna `403 FORBIDDEN`.

## Rate Limiting

O rate limiting usa uma **sliding window no Redis** com contadores por key (INCR).

| Tipo de operacao | Limite padrao | Variavel de ambiente |
|---|---|---|
| Endpoints de leitura | 100 requests/min | `VALTER_RATE_LIMIT_READ` |
| Endpoints de escrita | 10 requests/min | `VALTER_RATE_LIMIT_WRITE` |

### Headers de resposta

Toda resposta inclui headers de rate limit:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709136000
```

Quando o limite e excedido, a API retorna `429 RATE_LIMITED`.

:::caution
O rate limiting opera atualmente em modo **fail-closed**: se o Redis estiver inacessivel, todas as requests sao bloqueadas. O modo fail-open esta planejado para uma versao futura.
:::

## Formato de Erros

Todos os erros retornam um envelope JSON consistente com um objeto `error`:

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

### Codigos de erro

| Codigo | HTTP Status | Descricao |
|---|---|---|
| `INVALID_REQUEST` | 400 | Request body ou parametros malformados |
| `UNAUTHORIZED` | 401 | API key ausente ou invalida |
| `FORBIDDEN` | 403 | Key valida mas scope insuficiente |
| `NOT_FOUND` | 404 | Recurso nao encontrado |
| `TIMEOUT` | 408 | Consulta ao backend excedeu o tempo limite |
| `VALIDATION_ERROR` | 422 | Falha na validacao do Pydantic |
| `RATE_LIMITED` | 429 | Rate limit excedido |
| `INTERNAL_ERROR` | 500 | Erro nao tratado no servidor |
| `SERVICE_UNAVAILABLE` | 503 | Servico backend (Neo4j, Qdrant, etc.) inacessivel |

O campo `trace_id` correlaciona com os logs estruturados (formato JSON via structlog) para depuracao.

## Paginacao

Endpoints de listagem suportam **paginacao baseada em cursor** usando cursors opacos codificados em base64.

### Parametros de request

| Parametro | Tipo | Descricao |
|---|---|---|
| `cursor` | `string` | Cursor opaco de uma resposta anterior. Omita na primeira request. |
| `page_size` | `integer` | Numero de resultados por pagina (deve ser <= `top_k`). |

### Campos da resposta

| Campo | Tipo | Descricao |
|---|---|---|
| `pagination.cursor` | `string \| null` | Cursor para a proxima pagina, ou `null` se nao houver mais resultados. |
| `pagination.has_more` | `boolean` | Se existem paginas adicionais. |
| `pagination.total_estimate` | `integer \| null` | Estimativa do total de resultados. |

Os cursors codificam o ultimo score, o ultimo document ID, o numero da pagina e um hash da query para validacao. Um cursor de uma query nao pode ser reutilizado em outra query diferente.

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

As requests passam pelo middleware stack nesta ordem:

| Ordem | Middleware | Finalidade |
|---|---|---|
| 1 | **CORS** | Origens permitidas configuraveis para requests cross-origin |
| 2 | **MetricsIPAllowlist** | Restringe o acesso a `/metrics` a IPs em `VALTER_METRICS_IP_ALLOWLIST` (CIDR suportado). Le `cf-connecting-ip` e `x-forwarded-for` para resolucao de IP com suporte a proxy. |
| 3 | **RequestTracking** | Atribui um `trace_id` (UUID) a cada request, registra contagem e histogramas de duracao no Prometheus |
| 4 | **RateLimit** | Rate limiting via sliding window no Redis por API key |
| 5 | **Authentication** | Validacao de API key + verificacao de scope. Pula autenticacao para `/health`, `/metrics`, `/docs`, `/openapi.json`, `/redoc`. |

O audit logging roda dentro do middleware de autenticacao para todos os endpoints, exceto health, metrics e paths de documentacao.

## Grupos de Endpoints

| Grupo | Endpoints principais | Documentacao |
|---|---|---|
| Search | `POST /v1/retrieve`, `POST /v1/similar_cases`, `POST /v1/search/features`, `POST /v1/factual/dual-search` | [Endpoints de Search](./search/) |
| Graph | `POST /v1/graph/*` (13 endpoints) | [Endpoints de Graph](./graph/) |
| Verify & Enrich | `POST /v1/verify`, `POST /v1/context/enrich`, `POST /v1/factual/extract` | [Verify & Enrich](./verify-enrich/) |
| Ingest | `POST /v1/ingest/*` (20+ endpoints) | [Endpoints de Ingest](./ingest/) |
| Admin | `GET /v1/health`, `GET /metrics`, `GET/POST /v1/memories`, `GET /v1/datasets/*` | [Admin & Utilidades](./admin/) |
| MCP Tools | 28 tools via stdio/HTTP | [Referencia de MCP Tools](./mcp-tools/) |
