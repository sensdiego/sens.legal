---
title: "External Integrations"
description: "Configuration guide for all external services Juca connects to, including Valter, LLM providers, and auth."
lang: en
sidebar:
  order: 3
---

# External Integrations

Juca connects to several external services. This page documents how to configure each one.

## Valter API (Primary Backend)

Valter is Juca's primary backend agent, providing STJ jurisprudence search, citation verification, and knowledge graph analysis.

| Setting | Value |
|---------|-------|
| **Base URL** | `https://valter-api-production.up.railway.app` |
| **Auth** | `X-API-Key` header |
| **Env vars** | `VALTER_API_URL`, `VALTER_API_KEY` |

**Key endpoints consumed by Juca:**

| Endpoint | Method | Used For |
|----------|--------|----------|
| `/v1/retrieve` | POST | Jurisprudence search (Briefing F1, F2) |
| `/v1/verify` | POST | Citation verification |
| `/v1/graph/optimal-argument` | POST | Adversarial analysis (Briefing F3) |
| `/v1/graph/divergencias` | GET/POST | Minister divergences (Briefing F3) |
| `/v1/similar_cases` | POST | Similar case search (Briefing F2) |
| `/health` | GET | Health check (should return 200) |

**Verify connectivity:**

```bash
curl -H "X-API-Key: $VALTER_API_KEY" \
  https://valter-api-production.up.railway.app/health
```

## LLM Providers

Each provider requires its own API key. These are **transitional** — LLM processing is moving to Valter.

| Provider | Env Variable | Models | Sign Up |
|----------|-------------|--------|---------|
| **Anthropic** | `ANTHROPIC_API_KEY` | Claude Sonnet 4, Opus 4, Haiku 3.5 | console.anthropic.com |
| **OpenAI** | `OPENAI_API_KEY` | GPT-5.x, o3, o1, GPT-4.1 | platform.openai.com |
| **Google** | `GEMINI_API_KEY` | Gemini 2.5 Flash/Pro | aistudio.google.com |
| **Groq** | `GROQ_API_KEY` | Qwen 3 32B, Llama 3.3 70B | console.groq.com |
| **DeepSeek** | `DEEPSEEK_API_KEY` | DeepSeek R1, Chat | platform.deepseek.com |

:::tip
At minimum, configure **Anthropic** (primary generator) and **Groq** (fast critics). The other providers are optional and provide model diversity for the Generate → Criticize → Revise pipeline.
:::

## Authentication Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 client ID (Web application)
3. Add authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Resend (Magic Links)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain
4. Set `RESEND_API_KEY` and `AUTH_EMAIL_FROM`

## Neo4j Aura (Transitional)

For direct KG access (being replaced by Valter API):

| Environment | Setup |
|-------------|-------|
| **Local dev** | `docker compose up -d` (starts Neo4j Community 5) |
| **Production** | Neo4j Aura Free tier — set `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` |

Enable with `KG_PROVIDER=neo4j` (default is `json` for local JSON files).

## Observability (OpenTelemetry)

OTel tracing is opt-in. Configure via:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector.example.com
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer your-token
```

Tracing is initialized in `src/instrumentation.ts` on server startup.

## Railway (Hosting)

Juca is deployed on Railway with automatic deploys from the `main` branch:

- Docker-based deployment using the multi-stage `Dockerfile`
- Persistent volume for SQLite data (sessions, blocks)
- Environment variables configured in the Railway dashboard
- Health check endpoint: `/api/health`
