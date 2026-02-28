---
title: "Quickstart"
description: "Rode o Valter localmente e faça sua primeira chamada de API em menos de 5 minutos."
lang: pt-BR
sidebar:
  order: 2
---

# Quickstart

Este guia coloca o Valter rodando na sua máquina com o setup mínimo viável. Você vai levantar a infraestrutura de bancos, rodar migrações e fazer sua primeira chamada de API. Para um setup completo com todas as features opcionais, veja o [Guia de Instalação](/pt-br/getting-started/installation/).

## Pré-requisitos

Você precisa de três coisas instaladas:

- **Python 3.12+** — Valter usa features modernas de tipagem (`X | None`, `type` statements)
- **Docker e Docker Compose** — para PostgreSQL, Qdrant e Redis
- **make** — todos os comandos passam pelo Makefile

## Passo 1: Clone e instale

```bash
git clone <repo-url> && cd Valter

# Crie e ative o ambiente virtual
python -m venv .venv
source .venv/bin/activate

# Instale com dependências de dev (prefira uv pela velocidade)
uv pip install -e ".[dev]"
# ou: pip install -e ".[dev]"
```

## Passo 2: Levante os bancos

```bash
make docker-up
```

Isso inicia três containers via Docker Compose:

| Serviço | Imagem | Porta | Dados |
|---------|--------|-------|-------|
| PostgreSQL 16 | `postgres:16-alpine` | 5432 | Documentos, features, metadados, jobs |
| Qdrant | `qdrant/qdrant:latest` | 6333 | Busca vetorial semântica |
| Redis 7 | `redis:7-alpine` | 6379 | Cache, rate limiting, fila de jobs |

:::note
Neo4j **não** está incluído no Docker Compose por design. Sem Neo4j, os endpoints de busca, verificação e enriquecimento funcionam normalmente — apenas os 12 endpoints `/v1/graph/*` retornam 503. Veja o [Guia de Instalação](/pt-br/getting-started/installation/) para configurar o Neo4j.
:::

## Passo 3: Configure o ambiente

```bash
cp .env.example .env
```

Os valores padrão funcionam sem alterações para desenvolvimento local. O `.env.example` já vem pré-configurado com strings de conexão locais:

```bash
# Esses são os defaults — nenhuma mudança necessária para dev local
VALTER_DATABASE_URL=postgresql+asyncpg://valter:valter_dev@localhost:5432/valter
VALTER_QDRANT_URL=http://localhost:6333
VALTER_REDIS_URL=redis://localhost:6379/0
```

## Passo 4: Rode as migrações

```bash
make migrate
```

Isso executa `alembic upgrade head`, aplicando todas as 8 migrações PostgreSQL que criam tabelas para documentos, features, metadados, jobs, workflows, API keys, audit logs e memória de sessão.

## Passo 5: Inicie o servidor

```bash
make dev
```

A API inicia em `http://localhost:8000` com hot reload habilitado. Você verá logs JSON estruturados via structlog:

```
{"event": "valter.startup", "version": "0.1.0", ...}
```

## Passo 6: Verifique se funciona

### Health check

```bash
curl -s http://localhost:8000/health | python -m json.tool
```

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "stores": [
    {"name": "qdrant", "status": "up", "latency_ms": 2.1},
    {"name": "neo4j", "status": "down", "latency_ms": null},
    {"name": "postgres", "status": "up", "latency_ms": 1.3},
    {"name": "redis", "status": "up", "latency_ms": 0.4},
    {"name": "artifact_storage", "status": "up", "latency_ms": 0.1},
    {"name": "worker_ingest", "status": "down", "latency_ms": null}
  ],
  "uptime_seconds": 3.42
}
```

Um status `"degraded"` é normal nesse ponto — Neo4j e o ingest worker ainda não estão rodando.

### Documentação interativa da API

Abra `http://localhost:8000/docs` no navegador. O FastAPI gera documentação Swagger interativa para todos os endpoints.

### Sua primeira busca

```bash
curl -s -X POST http://localhost:8000/v1/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "responsabilidade civil dano moral"}' \
  | python -m json.tool
```

:::tip
A primeira requisição de busca leva 30–60 segundos porque precisa baixar e carregar o modelo de embedding (~500MB). Requisições subsequentes são rápidas. Para evitar esse delay, pré-baixe o modelo com `make download-model`.
:::

### Verifique uma referência jurídica

```bash
curl -s -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"text": "Conforme Súmula 297 do STJ"}' \
  | python -m json.tool
```

## Passo 7: Conecte via MCP (opcional)

Para usar o Valter como ferramenta no Claude Desktop, adicione isto ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "cwd": "/caminho/absoluto/para/Valter",
      "env": {
        "VALTER_DATABASE_URL": "postgresql+asyncpg://valter:valter_dev@localhost:5432/valter",
        "VALTER_QDRANT_URL": "http://localhost:6333",
        "VALTER_REDIS_URL": "redis://localhost:6379/0"
      }
    }
  }
}
```

Reinicie o Claude Desktop. Você deve ver 28 tools disponíveis em "valter" no painel de tools MCP.

:::caution
O servidor MCP stdio roda como um processo separado da API REST. Ele precisa de suas próprias variáveis de ambiente porque não lê do mesmo arquivo `.env` — passe-as explicitamente no bloco `env`.
:::

## O que está rodando

Após completar este quickstart, você tem:

```
┌─────────────────────────────────────────┐
│  Sua máquina                            │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Valter API  │  │ Claude Desktop  │   │
│  │ :8000       │  │ (MCP stdio)     │   │
│  └──────┬──────┘  └────────┬────────┘   │
│         │                  │            │
│  ┌──────┴──────────────────┴──────────┐ │
│  │        Data Stores Compartilhados  │ │
│  │  PostgreSQL :5432                  │ │
│  │  Qdrant     :6333                  │ │
│  │  Redis      :6379                  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## O que não está rodando (ainda)

| Componente | O que adiciona | Como habilitar |
|------------|---------------|----------------|
| Neo4j | 12 endpoints de analytics de grafo (divergências, argumento ótimo, evolução temporal) | [Guia de Instalação](/pt-br/getting-started/installation/#neo4j-grafo-de-conhecimento) |
| ARQ Worker | Ingestão de PDFs em background e análise de casos | `make worker-ingest` |
| MCP Remote | Servidor HTTP/SSE para integração com ChatGPT | `make mcp-remote` |
| Groq LLM | Extração factual, expansão de queries, classificação de documentos | Defina `VALTER_GROQ_API_KEY` e `VALTER_GROQ_ENABLED=true` |

## Próximos passos

- **[Instalação](/pt-br/getting-started/installation/)** — Setup completo com Neo4j, Groq, R2 e configuração de produção
- **[Referência da API](/api/)** — Todos os endpoints com schemas de request/response
- **[Tools MCP](/api/mcp-tools/)** — Referência completa das 28 tools MCP
- **[Arquitetura](/architecture/overview/)** — Como as camadas e data stores se conectam
