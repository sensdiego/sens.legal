---
title: Adapter da API Valter
description: Como o Juca se comunica com o agente de backend Valter via camada de adapter.
lang: pt-BR
sidebar:
  order: 2
---

# Adapter da API Valter

> A camada de adapter que permite ao Juca se comunicar com a API REST do Valter para busca de jurisprudência, verificação e análise de grafos.

## Visão Geral

O Valter é o agente de backend principal do Juca — um serviço FastAPI com 23.400+ decisões do STJ, com busca, verificação, grafo de conhecimento e capacidades de LLM.

Atualmente, o Juca se comunica com o Valter de forma indireta, por meio de suas próprias rotas de API internas que replicam localmente parte da lógica do Valter. A **camada de adapter** (planejada para v0.3) fornecerá uma interface unificada para chamar qualquer agente de backend (Valter, Leci, futuros agentes) diretamente do orquestrador.

:::note
A camada de adapter está planejada para o v0.3. Esta página documenta a superfície da API Valter que o adapter irá consumir. Até que o adapter seja implementado, as rotas internas do Juca tratam a lógica de backend localmente.
:::

## Endpoints da API Valter

| Endpoint | Método | Finalidade | Usado Por |
|----------|--------|-----------|---------|
| `/v1/retrieve` | POST | Busca de jurisprudência (BM25 + semântica + GC) | Briefing F1, F2; Busca |
| `/v1/verify` | POST | Verificação de citações (súmulas, processos, ministros) | Pipeline de validação |
| `/v1/graph/optimal-argument` | POST | Análise adversarial (riscos e oportunidades) | Briefing F3 |
| `/v1/graph/divergencias` | GET/POST | Divergências entre ministros em temas específicos | Briefing F3; futuras views de comparação |
| `/v1/graph/temporal-evolution` | GET | Tendências temporais na jurisprudência | Analytics futuras |
| `/v1/similar_cases` | POST | Busca casos similares a um caso dado | Briefing F2 |
| `/v1/factual/*` | Vários | Endpoints de análise factual | Briefing F1 |
| `/health` | GET | Verificação de saúde (deve retornar 200) | Monitoramento, `/api/health` |

## Autenticação

O Valter usa autenticação por chave de API via header `X-API-Key`:

| Configuração | Valor |
|-------------|-------|
| **Método de auth** | Header `X-API-Key` |
| **Variável de ambiente** | `VALTER_API_KEY` |
| **Variável de URL base** | `VALTER_API_URL` |
| **URL de produção** | `https://valter-api-production.up.railway.app` |

**Verificar conectividade:**

```bash
curl -H "X-API-Key: $VALTER_API_KEY" \
  https://valter-api-production.up.railway.app/health
```

:::caution
**Decisão pendente #1:** O modelo de autenticação para produção ainda não foi definido. Opções: (A) chave única no lado do servidor no Juca, (B) repasse de chave por usuário, (C) token serviço a serviço. A opção A é a abordagem atual e a mais simples.
:::

## Mapeamento de Requisição/Resposta

Quando o adapter for implementado, as respostas do Valter serão mapeadas para blocos do Juca:

| Endpoint Valter | Tipo de Bloco Juca | Transformação |
|-----------------|-------------------|---------------|
| `/v1/retrieve` → resultados | `precedent` | Cada resultado vira um bloco de precedente com processo, ementa, ministro, turma |
| `/v1/retrieve` → resumo | `summary` | Resumo agregado da busca |
| `/v1/verify` → verificação | Metadados do bloco | Status de verificação adicionado aos blocos existentes |
| `/v1/graph/optimal-argument` → riscos | `risk_balance` | Pares risco/oportunidade com pesos |
| `/v1/similar_cases` → correspondências | `precedent_picker` | Cards de precedente selecionáveis |

## Tratamento de Erros

O adapter implementará uma estratégia padrão de tratamento de erros:

| Erro do Valter | Comportamento do Juca |
|---------------|----------------------|
| 401 Unauthorized | Registra o erro, exibe "Erro de configuração do backend" para o usuário |
| 404 Not Found | Retorna resultados vazios com mensagem adequada |
| 429 Rate Limited | Tenta novamente com backoff exponencial (o Valter usa rate limiting baseado em Redis) |
| 500+ Server Error | Exibe bloco de erro de fallback, registra no OTel |
| Timeout de rede | Cancela via AbortController (#238), exibe mensagem de timeout |

## API do Adapter Planejada

A interface alvo do adapter para o v0.3:

```typescript
// Planejado — src/lib/adapters/valter.ts
interface ValterAdapter {
  retrieve(params: RetrieveParams): Promise<RetrieveResponse>
  verify(params: VerifyParams): Promise<VerifyResponse>
  graphOptimalArgument(params: GraphParams): Promise<GraphResponse>
  graphDivergencias(params: DivergenciaParams): Promise<DivergenciaResponse>
  similarCases(params: SimilarParams): Promise<SimilarResponse>
  health(): Promise<HealthResponse>
}
```

O adapter centralizará autenticação, mapeamento de erros, transformação de respostas, lógica de retry e gerenciamento de timeout em um único lugar — mantendo os handlers de rota e as server actions limpos.
