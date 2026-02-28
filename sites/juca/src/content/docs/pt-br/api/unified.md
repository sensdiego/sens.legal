---
title: Endpoints Unified
description: Endpoints de API principais do hub para gerenciamento de sessão, análise e orquestração.
lang: pt-BR
sidebar:
  order: 3
---

# Endpoints Unified

> Endpoints de API principais do hub que lidam com gerenciamento de sessão, análise unificada e orquestração.

## Resumo dos Endpoints

| Método | Caminho | Finalidade |
|--------|--------|-----------|
| GET | `/api/unified/sessions` | Lista todas as sessões do usuário atual |
| POST | `/api/unified/sessions` | Migra sessões do localStorage |
| POST | `/api/unified/session` | Cria uma nova sessão |
| GET | `/api/unified/session/[sessionId]` | Carrega uma sessão específica |
| PUT | `/api/unified/session/[sessionId]` | Atualiza/upsert uma sessão (snapshot completo) |
| DELETE | `/api/unified/session/[sessionId]` | Exclui uma sessão |
| POST | `/api/unified/analyze` | Envia query para análise (stream SSE) |

Todos os endpoints exigem autenticação via `auth()` de `@/lib/auth`.

---

## GET /api/unified/sessions

Lista todas as sessões do usuário autenticado.

**Fonte:** `src/app/api/unified/sessions/route.ts`

**Parâmetros de query:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `limit` | number | 50 | Número máximo de sessões a retornar |

**Resposta `200`:**

```json
{
  "sessions": [
    { "id": "abc-123", "title": "...", "createdAt": "..." }
  ],
  "stats": {}
}
```

**Respostas de erro:** `401`, `500`

---

## POST /api/unified/sessions

Migra sessões do localStorage do cliente para o banco de dados do servidor.

**Fonte:** `src/app/api/unified/sessions/route.ts`

**Corpo da requisição:**

```json
{
  "sessions": [ { /* objetos UnifiedSessionContext */ } ]
}
```

**Resposta `200`:**

```json
{ "migrated": 3, "total": 3 }
```

**Respostas de erro:** `400`, `401`, `500`

---

## POST /api/unified/session

Cria uma nova sessão unificada.

**Fonte:** `src/app/api/unified/session/route.ts`

**Corpo da requisição:**

```json
{ "title": "Título opcional da sessão" }
```

**Resposta `200`:** Retorna o objeto `UnifiedSessionContext` criado.

**Respostas de erro:** `400`, `401`, `500`

---

## GET /api/unified/session/[sessionId]

Carrega uma sessão específica com todo o contexto e estado do analisador.

**Fonte:** `src/app/api/unified/session/[sessionId]/route.ts`

**Parâmetros de path:** `sessionId: string`

**Auth:** Exige autenticação + verificação de propriedade. Retorna `403` se a sessão pertencer a outro usuário.

**Resposta `200`:** Retorna `UnifiedSessionContextWithAnalyzer`.

**Respostas de erro:** `400`, `401`, `403`, `404`, `500`

---

## PUT /api/unified/session/[sessionId]

Substituição completa de snapshot ou upsert de uma sessão.

**Fonte:** `src/app/api/unified/session/[sessionId]/route.ts`

**Parâmetros de path:** `sessionId: string`

**Corpo da requisição:** `UnifiedSessionContextWithAnalyzer` — o campo `session.id` deve corresponder ao parâmetro de path `sessionId`.

**Comportamento:**
- Se a sessão existe e pertence ao usuário: atualiza → `{ updated: true, sessionId }`
- Se a sessão não existe: cria via migração → `{ created: true, sessionId }`

**Respostas de erro:** `400` (incompatibilidade de id ou validação), `401`, `403`, `500`

---

## DELETE /api/unified/session/[sessionId]

Exclui uma sessão e seus dados associados.

**Fonte:** `src/app/api/unified/session/[sessionId]/route.ts`

**Parâmetros de path:** `sessionId: string`

**Resposta `200`:**

```json
{ "deleted": true, "sessionId": "abc-123" }
```

**Respostas de erro:** `400`, `401`, `403`, `404`, `500`

---

## POST /api/unified/analyze

Envia uma query para análise unificada. Retorna os resultados via Server-Sent Events (SSE).

**Fonte:** `src/app/api/unified/analyze/route.ts`

**Configuração:**
- `maxDuration`: 300 segundos (5 minutos)
- Rate limit: 5 requisições/minuto (`rateLimitPresets.analyze`)

**Corpo da requisição:**

```json
{
  "query": "responsabilidade civil por dano moral",
  "search_results": [ { "ementa": "...", "processo": "..." } ],
  "total_in_database": 1556,
  "pipeline_mode": "standard"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `query` | string | Sim | Query de busca não vazia |
| `search_results` | SearchResult[] | Sim | 1-10 itens (standard/light) ou 1-30 (deep) |
| `total_in_database` | number | Sim | Total de resultados correspondentes no corpus |
| `pipeline_mode` | `'standard'` \| `'light'` \| `'deep'` | Não | Padrão: `standard` |

**Regras de validação:**
- Cada `SearchResult.ementa` deve ter pelo menos 100 caracteres (itens menores são filtrados)
- O modo do pipeline determina o máximo de resultados: `standard`/`light` = 10, `deep` = 30

**Eventos SSE:**

```text
event: stage
data: { "stage": "searching", ... }

event: result
data: {
  "success": true,
  "data": {
    "response": "Texto da análise...",
    "claims": [],
    "unknowns": [],
    "confidence": 0.85,
    "sources": [],
    "audit_trail": {
      "query": "...",
      "julgados_ids": [],
      "pipeline_mode": "standard",
      "models_used": {
        "generator": "claude-sonnet-4-20250514",
        "critics": ["qwen/qwen3-32b"],
        "revisor": "claude-sonnet-4-20250514"
      },
      "timestamp": "2026-02-28T...",
      "duration_ms": 12345
    },
    "follow_up_questions": [],
    "suggested_paths": [{ "label": "...", "query": "..." }]
  }
}

event: error
data: { "success": false, "error": { "code": "...", "message": "..." } }
```

**Respostas de erro não-SSE:** `400`, `401`, `422` (sem conteúdo utilizável), `503` (serviço indisponível)

---

## Orquestrador

O endpoint `/api/unified/analyze` delega para o `UnifiedOrchestratorService` (`src/lib/unified/orchestrator.ts`), que:

1. **Detecta a intenção** da query do usuário
2. **Verifica necessidade de esclarecimento** (política de slot-filling)
3. **Resolve referências a artefatos** no texto da query
4. **Roteia para a ferramenta adequada** via o Registro de Ferramentas
5. **Transmite o progresso** de volta ao cliente via SSE

A saída do orquestrador inclui um campo `transparency` que expõe a intenção detectada, as referências resolvidas e a decisão de roteamento — útil para depuração e auditoria.
