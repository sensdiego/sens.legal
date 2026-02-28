---
title: "Quickstart"
description: "Get Valter running locally and make your first API call in under 5 minutes."
lang: en
sidebar:
  order: 2
---

# Quickstart

This guide gets Valter running on your machine with the minimum viable setup. You'll start the database infrastructure, run migrations, and make your first API call. For a complete setup with all optional features, see the [Installation guide](/getting-started/installation/).

## Prerequisites

You need three things installed:

- **Python 3.12+** — Valter uses modern typing features (`X | None`, `type` statements)
- **Docker and Docker Compose** — for PostgreSQL, Qdrant, and Redis
- **make** — all commands go through the Makefile

## Step 1: Clone and install

```bash
git clone <repo-url> && cd Valter

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# Install with dev dependencies (prefer uv for speed)
uv pip install -e ".[dev]"
# or: pip install -e ".[dev]"
```

## Step 2: Start databases

```bash
make docker-up
```

This starts three containers via Docker Compose:

| Service | Image | Port | Data |
|---------|-------|------|------|
| PostgreSQL 16 | `postgres:16-alpine` | 5432 | Documents, features, metadata, jobs |
| Qdrant | `qdrant/qdrant:latest` | 6333 | Semantic vector search |
| Redis 7 | `redis:7-alpine` | 6379 | Cache, rate limiting, job queue |

:::note
Neo4j is **not** included in Docker Compose by design. Without Neo4j, the search, verification, and enrichment endpoints work fine — only the 12 `/v1/graph/*` endpoints return 503. See the [Installation guide](/getting-started/installation/) for Neo4j setup.
:::

## Step 3: Configure environment

```bash
cp .env.example .env
```

The defaults work out of the box for local development. The `.env.example` file is pre-configured with local connection strings:

```bash
# These are the defaults — no changes needed for local dev
VALTER_DATABASE_URL=postgresql+asyncpg://valter:valter_dev@localhost:5432/valter
VALTER_QDRANT_URL=http://localhost:6333
VALTER_REDIS_URL=redis://localhost:6379/0
```

## Step 4: Run migrations

```bash
make migrate
```

This runs `alembic upgrade head`, applying all 8 PostgreSQL migrations that create tables for documents, features, metadata, jobs, workflows, API keys, audit logs, and session memory.

## Step 5: Start the server

```bash
make dev
```

The API starts on `http://localhost:8000` with hot reload enabled. You'll see structured JSON logs from structlog:

```
{"event": "valter.startup", "version": "0.1.0", ...}
```

## Step 6: Verify it works

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

A `"degraded"` status is normal at this point — Neo4j and the ingest worker aren't running yet.

### Interactive API docs

Open `http://localhost:8000/docs` in your browser. FastAPI generates interactive Swagger documentation for all endpoints.

### Your first search

```bash
curl -s -X POST http://localhost:8000/v1/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "responsabilidade civil dano moral"}' \
  | python -m json.tool
```

:::tip
The first search request takes 30–60 seconds because it downloads and loads the embedding model (~500MB). Subsequent requests are fast. To avoid this delay, pre-download the model with `make download-model`.
:::

### Verify a legal reference

```bash
curl -s -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"text": "Conforme Súmula 297 do STJ"}' \
  | python -m json.tool
```

## Step 7: Connect via MCP (optional)

To use Valter as a tool in Claude Desktop, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "cwd": "/absolute/path/to/Valter",
      "env": {
        "VALTER_DATABASE_URL": "postgresql+asyncpg://valter:valter_dev@localhost:5432/valter",
        "VALTER_QDRANT_URL": "http://localhost:6333",
        "VALTER_REDIS_URL": "redis://localhost:6379/0"
      }
    }
  }
}
```

Restart Claude Desktop. You should see 28 tools available under "valter" in the MCP tools panel.

:::caution
The MCP stdio server runs as a separate process from the REST API. It needs its own environment variables because it doesn't read from the same `.env` file — pass them explicitly in the `env` block.
:::

## What's running

After completing this quickstart, you have:

```
┌─────────────────────────────────────────┐
│  Your machine                           │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Valter API  │  │ Claude Desktop  │   │
│  │ :8000       │  │ (MCP stdio)     │   │
│  └──────┬──────┘  └────────┬────────┘   │
│         │                  │            │
│  ┌──────┴──────────────────┴──────────┐ │
│  │        Shared Data Stores          │ │
│  │  PostgreSQL :5432                  │ │
│  │  Qdrant     :6333                  │ │
│  │  Redis      :6379                  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## What's not running (yet)

| Component | What it adds | How to enable |
|-----------|-------------|---------------|
| Neo4j | 12 graph analytics endpoints (divergences, optimal argument, temporal evolution) | [Installation guide](/getting-started/installation/#neo4j-knowledge-graph) |
| ARQ Worker | Background PDF ingestion and case analysis | `make worker-ingest` |
| MCP Remote | HTTP/SSE server for ChatGPT integration | `make mcp-remote` |
| Groq LLM | Factual extraction, query expansion, document classification | Set `VALTER_GROQ_API_KEY` and `VALTER_GROQ_ENABLED=true` |

## Next steps

- **[Installation](/getting-started/installation/)** — Full setup with Neo4j, Groq, R2, and production configuration
- **[API Reference](/api/)** — All endpoints with request/response schemas
- **[MCP Tools](/api/mcp-tools/)** — Complete reference for the 28 MCP tools
- **[Architecture](/architecture/overview/)** — How the layers and data stores fit together
