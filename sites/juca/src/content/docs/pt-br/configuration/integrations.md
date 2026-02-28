---
title: "Integrações Externas"
description: "Guia de configuração de todos os serviços externos aos quais o Juca se conecta, incluindo Valter, provedores de LLM e autenticação."
lang: pt-BR
sidebar:
  order: 3
---

# Integrações Externas

O Juca se conecta a vários serviços externos. Esta página documenta como configurar cada um deles.

## API Valter (Backend Principal)

O Valter é o agente de backend principal do Juca, fornecendo busca de jurisprudência do STJ, verificação de citações e análise do grafo de conhecimento.

| Configuração | Valor |
|-------------|-------|
| **URL Base** | `https://valter-api-production.up.railway.app` |
| **Auth** | Header `X-API-Key` |
| **Variáveis de ambiente** | `VALTER_API_URL`, `VALTER_API_KEY` |

**Endpoints principais consumidos pelo Juca:**

| Endpoint | Método | Utilizado Para |
|----------|--------|---------------|
| `/v1/retrieve` | POST | Busca de jurisprudência (Briefing F1, F2) |
| `/v1/verify` | POST | Verificação de citações |
| `/v1/graph/optimal-argument` | POST | Análise adversarial (Briefing F3) |
| `/v1/graph/divergencias` | GET/POST | Divergências entre ministros (Briefing F3) |
| `/v1/similar_cases` | POST | Busca de casos similares (Briefing F2) |
| `/health` | GET | Verificação de saúde (deve retornar 200) |

**Verificar conectividade:**

```bash
curl -H "X-API-Key: $VALTER_API_KEY" \
  https://valter-api-production.up.railway.app/health
```

## Provedores de LLM

Cada provedor requer sua própria chave de API. São **transitórios** — o processamento de LLM está migrando para o Valter.

| Provedor | Variável de Ambiente | Modelos | Cadastro |
|----------|---------------------|---------|---------|
| **Anthropic** | `ANTHROPIC_API_KEY` | Claude Sonnet 4, Opus 4, Haiku 3.5 | console.anthropic.com |
| **OpenAI** | `OPENAI_API_KEY` | GPT-5.x, o3, o1, GPT-4.1 | platform.openai.com |
| **Google** | `GEMINI_API_KEY` | Gemini 2.5 Flash/Pro | aistudio.google.com |
| **Groq** | `GROQ_API_KEY` | Qwen 3 32B, Llama 3.3 70B | console.groq.com |
| **DeepSeek** | `DEEPSEEK_API_KEY` | DeepSeek R1, Chat | platform.deepseek.com |

:::tip
No mínimo, configure a **Anthropic** (gerador principal) e o **Groq** (críticos rápidos). Os demais provedores são opcionais e oferecem diversidade de modelos para o pipeline Gerar → Criticar → Revisar.
:::

## Provedores de Autenticação

### Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) → APIs e serviços → Credenciais
2. Crie um ID de cliente OAuth 2.0 (Aplicativo Web)
3. Adicione o URI de redirecionamento autorizado: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
4. Defina `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

### Resend (Magic Links)

1. Cadastre-se em [resend.com](https://resend.com)
2. Crie uma chave de API
3. Verifique seu domínio de envio
4. Defina `RESEND_API_KEY` e `AUTH_EMAIL_FROM`

## Neo4j Aura (Transitório)

Para acesso direto ao grafo de conhecimento (sendo substituído pela API Valter):

| Ambiente | Configuração |
|---------|-------------|
| **Dev local** | `docker compose up -d` (inicia o Neo4j Community 5) |
| **Produção** | Neo4j Aura plano gratuito — defina `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |

Habilite com `KG_PROVIDER=neo4j` (o padrão é `json` para arquivos JSON locais).

## Observabilidade (OpenTelemetry)

O rastreamento OTel é opcional. Configure via:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector.example.com
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer your-token
```

O rastreamento é inicializado em `src/instrumentation.ts` na inicialização do servidor.

## Railway (Hospedagem)

O Juca é implantado no Railway com deploys automáticos a partir da branch `main`:

- Implantação baseada em Docker usando o `Dockerfile` multi-estágio
- Volume persistente para dados SQLite (sessões, blocos)
- Variáveis de ambiente configuradas no dashboard do Railway
- Endpoint de health check: `/api/health`
