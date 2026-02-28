---
title: Settings & Configuration Files
description: Configuration files, runtime modes, and feature flags in Valter.
lang: en
sidebar:
  order: 2

---

# Settings & Configuration Files

Valter centralizes all configuration in a single Pydantic Settings class that loads values from environment variables and `.env` files. This page explains the configuration architecture, runtime modes, feature flags, and the project's configuration files.

## Configuration System

The `Settings` class in `src/valter/config.py` extends `pydantic_settings.BaseSettings` and serves as the single source of truth for all application configuration. It uses the `VALTER_` prefix for environment variable resolution.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "development"
    DATABASE_URL: str = "postgresql+asyncpg://valter:valter_dev@localhost:5432/valter"
    # ... 50+ fields with sensible defaults

    model_config = {
        "env_prefix": "VALTER_",
        "env_file": ".env",
    }
```

### Loading Order

Values are resolved in this order (first match wins):

1. **Shell environment variables** -- highest priority, always override
2. **`.env` file** -- convenient for local development
3. **Field defaults** -- defined in the `Settings` class itself

A singleton instance is created at module level:

```python
settings = Settings()
```

This instance is imported wherever configuration is needed and injected via FastAPI's `Depends()` where appropriate.

### Production Validation

The `Settings` class includes a `@model_validator` that runs after all fields are loaded. When `VALTER_ENV` is `production` or `prod`, it validates security-critical constraints and raises a `ValueError` at startup if any are violated. See [Environment Variables > Production Guardrails](./environment.md#production-guardrails) for the full list.

### Computed Properties

Several configuration values are derived from raw settings via `@property` methods:

| Property | Computation |
|---|---|
| `max_upload_bytes` | `MAX_UPLOAD_MB * 1024 * 1024` |
| `is_production` | `ENV.strip().lower() in {"production", "prod"}` |
| `r2_endpoint_url` | Uses `R2_ENDPOINT_URL` if set, otherwise constructs from `R2_ACCOUNT_ID` |
| `r2_canary_percent` | Clamps `R2_CANARY_PERCENT` to 0-100 range |
| `arq_redis_url` | Replaces the DB number in `REDIS_URL` with `ARQ_REDIS_DB` |
| `metrics_ip_allowlist` | Parses comma-separated string into a `list[str]` |

## Runtime Modes

The `VALTER_RUNTIME` variable determines which process starts. The routing logic lives in `scripts/start-command.sh`, which is the container entrypoint.

| Mode | Value | Process | Port |
|---|---|---|---|
| REST API | `api` | `uvicorn valter.main:app` | 8000 |
| Background worker | `worker` | `python -m valter.workers` | N/A |
| MCP remote server | `mcp-remote` | `python -m valter.mcp.remote_server` | 8001 |
| MCP stdio server | `mcp-stdio` | `python -m valter.mcp.remote_server` (stdio transport) | N/A |

Each mode initializes different components. The API mode starts FastAPI with middleware, routes, and database connections. The worker mode starts the ARQ job processor for background ingest tasks. The MCP modes start a Model Context Protocol server that bridges LLM tool calls to the REST API.

:::note
The `mcp-remote` and `mcp-stdio` modes both use the same Python module (`valter.mcp.remote_server`), differing only in transport. The start script sets `VALTER_MCP_SERVER_TRANSPORT` accordingly.
:::

For local development, you typically start each mode separately:

```bash
make dev            # Starts API mode on port 8000
make worker-ingest  # Starts ARQ worker
make mcp-remote     # Starts MCP HTTP server on port 8001
```

In Railway deployments, each mode runs as a separate service with `VALTER_RUNTIME` set in the service environment.

## Feature Flags

Several boolean or numeric variables act as feature flags, enabling functionality that is off by default:

| Flag | Default | What it enables |
|---|---|---|
| `VALTER_GROQ_ENABLED` | `false` | Groq LLM features: factual extraction (`POST /v1/factual/extract`), query expansion in hybrid search. Requires `VALTER_GROQ_API_KEY`. |
| `VALTER_AUTH_ENABLED` | `false` | API key authentication on REST endpoints. Must be `true` in production. |
| `VALTER_KG_BOOST_BATCH_ENABLED` | `true` | Batch knowledge graph boosting in the hybrid retriever. Enriches vector search results with graph context from Neo4j. |
| `VALTER_R2_CANARY_PERCENT` | `0` | Percentage of artifact uploads routed to Cloudflare R2. At `0`, all artifacts are stored locally. Increase for gradual R2 migration. |
| `VALTER_WORKFLOW_STRICT_INFRA_REQUIRED` | `true` | When `true`, workflows fail immediately if required infrastructure is unavailable. When `false`, they degrade gracefully. |

## Configuration Files

Beyond environment variables, Valter uses several configuration files:

| File | Purpose |
|---|---|
| `pyproject.toml` | Project metadata, dependencies, and tool configuration (ruff, pytest, mypy, hatch) |
| `docker-compose.yml` | Local development database stack (PostgreSQL 16, Qdrant, Redis 7) |
| `Dockerfile` | Production container image |
| `railway.json` | Railway.app deployment configuration |
| `Makefile` | Canonical command interface for all development and operational tasks |
| `.env` | Local environment variable overrides (gitignored) |
| `migrations/alembic.ini` | Alembic database migration configuration |

## .env File

For local development, create a `.env` file at the project root. Most variables have sensible defaults that work with the `docker-compose.yml` stack, so only a minimal `.env` is needed:

```bash
# .env (local development)
# These defaults work with docker-compose.yml — only override what you need.

# Optional: enable Groq LLM features
# VALTER_GROQ_API_KEY=gsk_your_key_here
# VALTER_GROQ_ENABLED=true

# Optional: Neo4j Aura for graph features
# VALTER_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
# VALTER_NEO4J_USERNAME=neo4j
# VALTER_NEO4J_PASSWORD=your_aura_password

# Optional: remote embedding service (skips local model download)
# VALTER_EMBEDDING_SERVICE_URL=https://your-railway-service.up.railway.app
```

:::caution
Never commit the `.env` file to version control. It is listed in `.gitignore`. For the full list of available variables, see the [Environment Variables](./environment.md) reference.
:::
