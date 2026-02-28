---
title: "Environment Variables"
description: "Complete reference of all 30+ environment variables organized by category with descriptions and defaults."
lang: en
sidebar:
  order: 1
---

# Environment Variables

Juca uses 30+ environment variables configured via `.env.local`. Copy `.env.example` as a starting point:

```bash
cp .env.example .env.local
```

## Quick Start (Minimum Required)

```bash
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
ENABLE_DEV_AUTH=true
```

## LLM API Keys

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude (Sonnet 4, Opus 4, Haiku 3.5) | **Yes** |
| `GROQ_API_KEY` | Groq API key for fast inference critics (Qwen 3 32B, Llama 3.3 70B) | **Yes** |
| `OPENAI_API_KEY` | OpenAI API key (GPT-5.x, o3, o1, GPT-4.1) | No |
| `DEEPSEEK_API_KEY` | DeepSeek API key (R1, Chat) | No |
| `GEMINI_API_KEY` | Google Gemini API key (2.5 Flash/Pro) | No |
| `OLLAMA_BASE_URL` | Ollama base URL for local models (comparator only) | No |

:::note
LLM provider SDKs are **transitional** — LLM processing is moving to the Valter API. These keys are only needed if running the local backend pipeline.
:::

## Valter Integration

| Variable | Description | Required |
|----------|-------------|----------|
| `VALTER_API_URL` | Valter REST API base URL | **Yes** (hub mode) |
| `VALTER_API_KEY` | Valter API key (`X-API-Key` header) | **Yes** (hub mode) |

## Database Paths

| Variable | Description | Default |
|----------|-------------|---------|
| `DATA_PATH` | Root data directory | `./data` |
| `INTEGRAS_PATH` | Full decision texts directory | `./data/integras` |
| `SESSIONS_PATH` | Session persistence directory | `./data/sessions` |
| `FEEDBACK_PATH` | User feedback storage path | — |
| `SQLITE_PATH` | Main SQLite database file | `./data/juca.db` |
| `SEARCH_DB_PATH` | Search index database file | — |
| `SQLITE_VEC_PATH` | sqlite-vec extension path | — |

## Knowledge Graph

| Variable | Description | Default |
|----------|-------------|---------|
| `KG_PROVIDER` | KG backend: `json` (local files) or `neo4j` (Neo4j Aura) | `json` |
| `NEO4J_URI` | Neo4j connection URI (`neo4j+s://...`) | — |
| `NEO4J_USERNAME` | Neo4j username | — |
| `NEO4J_PASSWORD` | Neo4j password | — |

:::note
KG variables are **transitional** — knowledge graph queries are moving to Valter API (`/v1/graph/*`).
:::

## Authentication

| Variable | Description | Required |
|----------|-------------|----------|
| `ENABLE_DEV_AUTH` | Set to `true` to bypass auth for local dev | No |
| `ENABLE_TEST_AUTH` | Mock auth for automated tests | No |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID | Production only |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | Production only |
| `AUTH_SECRET` | NextAuth JWT secret (generate with `openssl rand -base64 32`) | Production only |
| `RESEND_API_KEY` | Resend API key for magic link emails | Production only |
| `AUTH_EMAIL_FROM` | Sender email for magic links | Production only |
| `ADMIN_EMAILS` | Comma-separated admin email whitelist (case-insensitive) | No |

## Embedding Service

| Variable | Description | Default |
|----------|-------------|---------|
| `EMBEDDING_SERVICE_URL` | External embedding service URL | — |
| `EMBEDDING_MODEL` | Embedding model name | `rufimelo/Legal-BERTimbau-sts-base` |

## Observability

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry OTLP endpoint | — (disabled) |
| `OTEL_EXPORTER_OTLP_HEADERS` | OTLP authentication headers | — |
| `VITE_LOG_ENDPOINT` | Remote structured logging endpoint | — |

## Application

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API base URL (client-side) | `''` (same origin) |
| `ANALYZE` | Enable Next.js bundle analyzer | — (disabled) |
