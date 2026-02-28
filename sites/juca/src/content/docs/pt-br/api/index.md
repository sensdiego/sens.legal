---
title: Referência da API
description: Visão geral da superfície de API do Juca — rotas internas, adapter Valter e server actions.
lang: pt-BR
sidebar:
  order: 1
---

# Referência da API

> Visão geral da superfície de API do Juca — rotas internas, camada de adapter Valter e server actions.

## Arquitetura da API

A superfície de API do Juca tem três camadas:

1. **Rotas de API Internas** — ~55 endpoints em `src/app/api/` servindo o frontend. Muitos são transitórios e serão substituídos por chamadas diretas à API Valter.
2. **Adapter Valter** (planejado para v0.3) — camada de abstração para chamar o Valter e futuros agentes de backend via uma interface unificada.
3. **Server Actions** — `src/actions/` para mutações de cliente para servidor (transições de fase do briefing, gerenciamento de sessão).

:::caution
As rotas de API internas em `/api/chat/*`, `/api/analyzer/*`, `/api/kg/*`, `/api/reasoning/*` e `/api/search/*` são **transitórias**. Sua lógica de backend está sendo migrada para o Valter. Não construa novas funcionalidades sobre esses endpoints — use o adapter Valter em vez disso (disponível no v0.3).
:::

## Grupos de Rotas

| Grupo | Caminho | Endpoints | Status | Finalidade |
|-------|--------|-----------|--------|-----------|
| **Unified** | `/api/unified/*` | 4 | Ativo | Gerenciamento de sessão e análise no hub |
| **Export** | `/api/export/*` | 1 | Ativo | Exportação de PDF |
| **Auth** | `/api/auth/*` | 1 | Ativo | Handler do NextAuth |
| **Health** | `/api/health` | 1 | Ativo | Verificação de saúde do sistema |
| **Metrics** | `/api/metrics` | 1 | Ativo | Métricas da aplicação |
| **Feedback** | `/api/feedback/*` | 2 | Ativo | Feedback dos usuários |
| **Chat** | `/api/chat/*` | 6 | Transitório | Pipeline de chat (SSE) |
| **Analyzer** | `/api/analyzer/*` | 8 | Transitório | Pipeline de análise de casos |
| **Search** | `/api/search/*` | 2 | Transitório | Busca híbrida de jurisprudência |
| **KG** | `/api/kg/*` | 14 | Transitório | Consultas ao grafo de conhecimento |
| **Reasoning** | `/api/reasoning/*` | 4 | Transitório | Extração IRAC |
| **Comparator** | `/api/comparator/*` | 2 | Transitório | Comparação multi-modelo |
| **Reference** | `/api/reference/*` | 2 | Transitório | Dados de referência |
| **Citations** | `/api/citations/*` | 1 | Transitório | Estatísticas de citações |

## Autenticação

Todas as rotas de API (exceto `/api/health`) exigem autenticação:

**Produção:** Sessão JWT do NextAuth via `auth()` de `@/lib/auth`.

**Desenvolvimento:** Defina `ENABLE_DEV_AUTH=true` em `.env.local` para ignorar a autenticação com um usuário de dev.

```typescript
// Padrão em toda rota de API
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });
  // ...
}
```

:::tip
Server Actions usam um padrão de autenticação diferente — `requireActionAuth()` de `@/actions/utils`. Veja [Convenções de Código](/development/conventions) para mais detalhes.
:::

## Envelope de Resposta

Todas as respostas JSON da API seguem um padrão de envelope padrão definido em `src/types/api.ts`:

**Sucesso:**

```json
{
  "success": true,
  "data": { },
  "metadata": { "timestamp": "2026-02-28T...", "duration_ms": 123 }
}
```

**Erro:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "O parâmetro X é obrigatório",
    "details": { }
  }
}
```

**Códigos de erro padrão:** `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `RATE_LIMITED`, `TIMEOUT`.

**Rotas com streaming SSE** usam uma convenção diferente:
- `event: stage` — payload de progresso livre (não usa o envelope)
- `event: result` — usa o envelope `ApiSuccess`
- `event: error` — usa o envelope `ApiError`

O cliente de API em `src/lib/api/client.ts` desempacota o envelope automaticamente: em caso de sucesso retorna `data`; em caso de falha lança `ApiClientError` com `code` e `details`.

## Referências Detalhadas

- [Adapter Valter](/api/valter-adapter) — Como o Juca se comunica com o Valter
- [Endpoints Unified](/api/unified) — Operações principais do hub (sessões, análise)
- [Endpoints Briefing](/api/briefing) — Server actions e rotas específicas do briefing
- [Endpoints de Exportação](/api/export) — Exportação de PDF e documentos
