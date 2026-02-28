---
title: "Variáveis de Ambiente"
description: "Referência completa de todas as 30+ variáveis de ambiente organizadas por categoria, com descrições e valores padrão."
lang: pt-BR
sidebar:
  order: 1
---

# Variáveis de Ambiente

O Juca usa 30+ variáveis de ambiente configuradas via `.env.local`. Copie o `.env.example` como ponto de partida:

```bash
cp .env.example .env.local
```

## Início Rápido (Mínimo Necessário)

```bash
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
ENABLE_DEV_AUTH=true
```

## Chaves de API de LLM

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `ANTHROPIC_API_KEY` | Chave de API da Anthropic para Claude (Sonnet 4, Opus 4, Haiku 3.5) | **Sim** |
| `GROQ_API_KEY` | Chave de API da Groq para inferência rápida de críticos (Qwen 3 32B, Llama 3.3 70B) | **Sim** |
| `OPENAI_API_KEY` | Chave de API da OpenAI (GPT-5.x, o3, o1, GPT-4.1) | Não |
| `DEEPSEEK_API_KEY` | Chave de API da DeepSeek (R1, Chat) | Não |
| `GEMINI_API_KEY` | Chave de API do Google Gemini (2.5 Flash/Pro) | Não |
| `OLLAMA_BASE_URL` | URL base do Ollama para modelos locais (apenas comparador) | Não |

:::note
Os SDKs de provedores de LLM são **transitórios** — o processamento de LLM está migrando para a API Valter. Essas chaves só são necessárias se você estiver rodando o pipeline de backend local.
:::

## Integração Valter

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VALTER_API_URL` | URL base da API REST do Valter | **Sim** (modo hub) |
| `VALTER_API_KEY` | Chave de API do Valter (header `X-API-Key`) | **Sim** (modo hub) |

## Caminhos de Banco de Dados

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATA_PATH` | Diretório raiz de dados | `./data` |
| `INTEGRAS_PATH` | Diretório com textos completos das decisões | `./data/integras` |
| `SESSIONS_PATH` | Diretório de persistência de sessões | `./data/sessions` |
| `FEEDBACK_PATH` | Caminho de armazenamento de feedback dos usuários | — |
| `SQLITE_PATH` | Arquivo principal do banco SQLite | `./data/juca.db` |
| `SEARCH_DB_PATH` | Arquivo do banco de índice de busca | — |
| `SQLITE_VEC_PATH` | Caminho da extensão sqlite-vec | — |

## Grafo de Conhecimento

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `KG_PROVIDER` | Backend do GC: `json` (arquivos locais) ou `neo4j` (Neo4j Aura) | `json` |
| `NEO4J_URI` | URI de conexão com o Neo4j (`neo4j+s://...`) | — |
| `NEO4J_USERNAME` | Nome de usuário do Neo4j | — |
| `NEO4J_PASSWORD` | Senha do Neo4j | — |

:::note
As variáveis de GC são **transitórias** — as consultas ao grafo de conhecimento estão migrando para a API Valter (`/v1/graph/*`).
:::

## Autenticação

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `ENABLE_DEV_AUTH` | Defina como `true` para ignorar a autenticação em desenvolvimento local | Não |
| `ENABLE_TEST_AUTH` | Auth mockada para testes automatizados | Não |
| `GOOGLE_CLIENT_ID` | ID de cliente Google OAuth 2.0 | Somente produção |
| `GOOGLE_CLIENT_SECRET` | Segredo de cliente Google OAuth 2.0 | Somente produção |
| `AUTH_SECRET` | Segredo JWT do NextAuth (gere com `openssl rand -base64 32`) | Somente produção |
| `RESEND_API_KEY` | Chave de API do Resend para e-mails magic link | Somente produção |
| `AUTH_EMAIL_FROM` | E-mail remetente para magic links | Somente produção |
| `ADMIN_EMAILS` | Lista de e-mails admin separados por vírgula (sem distinção de maiúsculas) | Não |

## Serviço de Embedding

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `EMBEDDING_SERVICE_URL` | URL do serviço externo de embeddings | — |
| `EMBEDDING_MODEL` | Nome do modelo de embedding | `rufimelo/Legal-BERTimbau-sts-base` |

## Observabilidade

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint OTLP do OpenTelemetry | — (desabilitado) |
| `OTEL_EXPORTER_OTLP_HEADERS` | Headers de autenticação OTLP | — |
| `VITE_LOG_ENDPOINT` | Endpoint remoto de logging estruturado | — |

## Aplicação

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL base da API (client-side) | `''` (mesma origem) |
| `ANALYZE` | Habilita o analisador de bundle do Next.js | — (desabilitado) |
