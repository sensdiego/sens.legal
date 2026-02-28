---
title: Environment Variables
description: Complete reference of 50+ environment variables organized by category with defaults and requirements.
lang: en
sidebar:
  order: 1

---

# Environment Variables

All Valter configuration is driven by environment variables prefixed with `VALTER_`. Variables are loaded in this order of precedence: shell environment, `.env` file, built-in defaults. The `Settings` class in `src/valter/config.py` uses `pydantic-settings` with `env_prefix="VALTER_"`.

## Core

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_ENV` | Environment name. Set to `production` or `prod` to activate production guardrails. | `development` | No |
| `VALTER_RUNTIME` | Execution mode that determines which process starts. See [Runtime Modes](./settings.md#runtime-modes). | `api` | No |

:::caution
Setting `VALTER_ENV=production` activates strict validation: authentication must be enabled, CORS wildcard is blocked, Neo4j must be remote, and database credentials cannot be defaults. See [Production Guardrails](#production-guardrails) below.
:::

## Databases

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_DATABASE_URL` | PostgreSQL connection string using the `asyncpg` driver. | `postgresql+asyncpg://valter:valter_dev@localhost:5432/valter` | No |
| `VALTER_QDRANT_URL` | Qdrant vector database URL. | `http://localhost:6333` | No |
| `VALTER_QDRANT_COLLECTION` | Name of the Qdrant collection for legal document chunks. | `legal_chunks_v1` | No |
| `VALTER_NEO4J_URI` | Neo4j connection URI. Use `bolt://` for local, `neo4j+s://` for Aura. | `bolt://localhost:7687` | No |
| `VALTER_NEO4J_USERNAME` | Neo4j authentication username. | `neo4j` | No |
| `VALTER_NEO4J_PASSWORD` | Neo4j authentication password. | `neo4j_dev` | No |
| `VALTER_REDIS_URL` | Redis connection URL with database number. | `redis://localhost:6379/0` | No |
| `VALTER_ARQ_REDIS_DB` | Redis database number for the ARQ background worker. Kept separate from the main Redis DB to avoid key collisions. | `1` | No |

:::tip
In production, `VALTER_DATABASE_URL` must not contain `valter_dev`, `VALTER_NEO4J_URI` must point to a remote host (not localhost), and `VALTER_NEO4J_PASSWORD` must not be a weak default like `neo4j_dev` or `password`. The application will refuse to start otherwise.
:::

## Embeddings & LLM

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_EMBEDDING_MODEL` | HuggingFace model identifier for semantic embeddings. Downloaded via `make download-model`. | `rufimelo/Legal-BERTimbau-sts-base` | No |
| `VALTER_EMBEDDING_DIMENSION` | Vector dimension produced by the embedding model. Must match the model output. | `768` | No |
| `VALTER_EMBEDDING_SERVICE_URL` | URL of a remote embedding service (hosted on Railway). When set, the local model is bypassed. | None | No |
| `VALTER_RERANKER_SERVICE_URL` | URL of a remote reranking service (hosted on Railway). When set, the local cross-encoder is bypassed. | None | No |
| `VALTER_GROQ_API_KEY` | API key for Groq LLM. Enables factual extraction and query expansion features. | None | No |
| `VALTER_GROQ_MODEL` | Model identifier used with the Groq API. | `qwen/qwen3-32b` | No |
| `VALTER_GROQ_ENABLED` | Feature flag to enable Groq-powered features. Requires `VALTER_GROQ_API_KEY` to be set. | `false` | No |

:::note
Without `VALTER_GROQ_API_KEY` and `VALTER_GROQ_ENABLED=true`, the system works normally but factual extraction endpoints and query expansion in hybrid search are disabled. Setting `VALTER_EMBEDDING_SERVICE_URL` avoids the need to download the ~500 MB embedding model locally.
:::

## API Server

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_API_HOST` | Host address the API server binds to. | `0.0.0.0` | No |
| `VALTER_API_PORT` | Port the API server listens on. | `8000` | No |
| `VALTER_AUTH_ENABLED` | Enable API key authentication on REST endpoints. | `false` | **Yes (prod)** |
| `VALTER_RATE_LIMIT_READ` | Maximum read requests per API key per minute. | `100` | No |
| `VALTER_RATE_LIMIT_WRITE` | Maximum write requests per API key per minute. | `10` | No |
| `VALTER_CORS_ORIGINS` | JSON array of allowed CORS origins. | `["*"]` | No |
| `VALTER_LOG_LEVEL` | Application log level (`DEBUG`, `INFO`, `WARNING`, `ERROR`). | `INFO` | No |
| `VALTER_METRICS_IP_ALLOWLIST` | Comma-separated list of IP addresses allowed to access `/metrics`. | Empty | **Yes (prod)** |

:::danger
In production, `VALTER_AUTH_ENABLED` must be `true`, `VALTER_CORS_ORIGINS` must not contain `"*"`, and `VALTER_METRICS_IP_ALLOWLIST` must be set. The application raises a `ValueError` at startup if any of these constraints are violated.
:::

## Upload & Ingest

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_UPLOAD_STORAGE_PATH` | Local filesystem path where uploaded files are stored before processing. | `data/datasets/uploads/raw` | No |
| `VALTER_MAX_UPLOAD_MB` | Maximum upload file size in megabytes. Converted to bytes internally via the `max_upload_bytes` property. | `100` | No |
| `VALTER_INGEST_JOB_TIMEOUT_SECONDS` | Maximum duration (seconds) an ARQ ingest job can run before being killed. | `1800` | No |
| `VALTER_INGEST_WORKER_CONCURRENCY` | Number of concurrent jobs the ARQ worker processes. | `2` | No |

## Cloudflare R2

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_R2_ACCOUNT_ID` | Cloudflare account ID. Used to construct the endpoint URL if `VALTER_R2_ENDPOINT_URL` is not set. | None | No |
| `VALTER_R2_ACCESS_KEY_ID` | S3-compatible access key for R2. | None | No |
| `VALTER_R2_SECRET_ACCESS_KEY` | S3-compatible secret key for R2. | None | No |
| `VALTER_R2_BUCKET_NAME` | R2 bucket name for storing workflow artifacts. | `valter-artifacts` | No |
| `VALTER_R2_ENDPOINT_URL` | Override the auto-constructed R2 endpoint URL. | None | No |
| `VALTER_R2_PRESIGN_TTL_SECONDS` | Time-to-live (seconds) for pre-signed download URLs. | `600` | No |
| `VALTER_R2_CANARY_PERCENT` | Percentage (0-100) of artifact uploads routed to R2 instead of local storage. Use for gradual rollout. | `0` | No |

:::note
All three credentials (`VALTER_R2_ACCOUNT_ID`, `VALTER_R2_ACCESS_KEY_ID`, `VALTER_R2_SECRET_ACCESS_KEY`) must be set together for R2 to function. When `VALTER_R2_CANARY_PERCENT` is `0` (default), all artifacts are stored locally. Increase gradually during migration to R2.
:::

## Workflow Engine

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_WORKFLOW_TIMEOUT_SECONDS` | Global timeout for an entire workflow execution. | `2400` | No |
| `VALTER_WORKFLOW_MAX_RETRIES` | Maximum number of retry attempts per workflow step before marking it as failed. | `3` | No |
| `VALTER_WORKFLOW_POLL_RECOMMENDED_SECONDS` | Recommended interval (seconds) for clients polling workflow status. Returned in API responses. | `3` | No |
| `VALTER_WORKFLOW_STRICT_INFRA_REQUIRED` | When `true`, workflows fail immediately if required infrastructure (Qdrant, Redis) is unavailable. When `false`, they degrade gracefully. | `true` | No |

## MCP Server

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_MCP_SERVER_TRANSPORT` | Transport protocol for the MCP server (`streamable-http` or `stdio`). | Derived from `VALTER_RUNTIME` | No |
| `VALTER_MCP_SERVER_HOST` | Host address the MCP remote server binds to. | `0.0.0.0` | No |
| `VALTER_MCP_SERVER_PORT` | Port the MCP remote server listens on. Falls back to `$PORT` if set (for Railway compatibility). | `8001` | No |
| `VALTER_MCP_SERVER_PATH` | URL path for the MCP HTTP endpoint. | `/mcp` | No |
| `VALTER_MCP_SERVER_AUTH_MODE` | Authentication mode for incoming MCP requests. | `api_key` | No |
| `VALTER_MCP_SERVER_API_KEYS` | Comma-separated list of valid API keys for MCP authentication. | None | No |
| `VALTER_MCP_API_BASE_URL` | Base URL of the REST API that the MCP server delegates to internally. | `http://localhost:8000` | No |
| `VALTER_MCP_API_KEY` | API key the MCP server uses when calling the REST API. | None | No |
| `VALTER_MCP_RATE_LIMIT_PER_MINUTE` | Maximum MCP requests per minute per client. | `60` | No |

:::tip
The MCP server acts as a bridge: it receives tool calls from LLM clients (ChatGPT, Claude) and translates them into REST API calls against `VALTER_MCP_API_BASE_URL`. If the REST API has authentication enabled, set `VALTER_MCP_API_KEY` accordingly.
:::

## Phase Analysis

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_PHASE_RULES_VERSION` | Version of the phase classification rules used for procedural analysis. | `phase-rules-v1.1` | No |
| `VALTER_PHASE_MIN_PRECEDENT_SCORE` | Minimum similarity score (0-100) for a precedent to be considered relevant in phase matching. | `55.0` | No |
| `VALTER_PHASE_MAX_MATCHES_PER_PHASE` | Maximum number of precedent matches returned per procedural phase. | `5` | No |

## Knowledge Graph

| Variable | Purpose | Default | Required? |
|---|---|---|---|
| `VALTER_KG_BOOST_BATCH_ENABLED` | Enable batch knowledge graph boosting in the hybrid retriever. Enriches search results with graph context in parallel. | `true` | No |
| `VALTER_KG_BOOST_MAX_CONCURRENCY` | Maximum number of concurrent Neo4j queries during KG boost. Tune based on Neo4j capacity. | `12` | No |
| `VALTER_QUERY_EXPANSION_MAX_VARIANTS` | Maximum number of query variants generated during search expansion (requires Groq). | `3` | No |

## Production Guardrails

The `Settings` class enforces the following constraints when `VALTER_ENV` is set to `production` or `prod`. These validations run at application startup and cause an immediate failure with a descriptive `ValueError` if violated.

**API runtime guardrails** (skipped for MCP-only runtimes which have their own auth):

- `VALTER_AUTH_ENABLED` must be `true`
- `VALTER_CORS_ORIGINS` must not contain `"*"`
- `VALTER_METRICS_IP_ALLOWLIST` must be non-empty

**Infrastructure guardrails** (always enforced in production):

- `VALTER_NEO4J_URI` must point to a remote host (not `localhost` or `127.0.0.1`)
- `VALTER_NEO4J_PASSWORD` must not be a weak default (`neo4j_dev`, `password`, `changeme`, etc.)
- `VALTER_DATABASE_URL` must not contain `valter_dev`
- `VALTER_REDIS_URL` must not point to `localhost` or `127.0.0.1`
