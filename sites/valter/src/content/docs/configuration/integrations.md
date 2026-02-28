---
title: External Integrations
description: How to configure connections to Groq, Cloudflare R2, Railway, Neo4j Aura, and HuggingFace.
lang: en
sidebar:
  order: 3

---

# External Integrations

Valter integrates with several external services. Each integration is optional for local development but may be required in staging or production. This page provides step-by-step setup for each service.

## Groq API

Groq provides fast LLM inference used for document classification, factual extraction, and query expansion in hybrid search.

### What it enables

- `POST /v1/factual/extract` -- extracts structured factual data from legal documents
- Query expansion in hybrid search -- generates semantic variants of user queries for broader recall

### Setup

1. Create an account at [console.groq.com](https://console.groq.com) and generate an API key.

2. Set the following environment variables:

```bash
VALTER_GROQ_API_KEY=gsk_your_key_here
VALTER_GROQ_ENABLED=true
# Optional: override the default model
# VALTER_GROQ_MODEL=qwen/qwen3-32b
```

3. Verify by starting the API and checking that factual endpoints respond without errors.

### Without Groq

When Groq is not configured, the system operates normally with these differences:

- Factual extraction endpoints return an error indicating the feature is disabled
- Hybrid search works without query expansion (single query only)
- No LLM costs are incurred

## Cloudflare R2

Cloudflare R2 provides S3-compatible object storage for workflow artifacts (generated PDFs, JSON reports). It replaces local filesystem storage for production deployments.

### Setup

1. In the Cloudflare dashboard, create an R2 bucket and generate S3-compatible API credentials.

2. Set the following environment variables:

```bash
VALTER_R2_ACCOUNT_ID=your_cloudflare_account_id
VALTER_R2_ACCESS_KEY_ID=your_access_key
VALTER_R2_SECRET_ACCESS_KEY=your_secret_key
# Optional: override defaults
# VALTER_R2_BUCKET_NAME=valter-artifacts
# VALTER_R2_PRESIGN_TTL_SECONDS=600
```

3. The R2 endpoint URL is auto-constructed from the account ID (`https://{account_id}.r2.cloudflarestorage.com`). Override with `VALTER_R2_ENDPOINT_URL` if needed.

### Canary rollout

Use `VALTER_R2_CANARY_PERCENT` to gradually migrate artifact storage from local disk to R2:

```bash
# Start with 10% of uploads going to R2
VALTER_R2_CANARY_PERCENT=10

# After validation, increase to 50%
VALTER_R2_CANARY_PERCENT=50

# Full migration
VALTER_R2_CANARY_PERCENT=100
```

The value is clamped to the 0-100 range internally.

### Without R2

When R2 credentials are not set, all artifacts are stored locally at `VALTER_UPLOAD_STORAGE_PATH` (default: `data/datasets/uploads/raw`). This is the default behavior and is suitable for development.

## Neo4j Aura

Neo4j Aura is a managed graph database service. It is the required graph backend for staging and production environments. Local development can use either Neo4j Community Edition or Aura.

### Local development (Community Edition)

1. Run Neo4j locally via Docker (not included in `docker-compose.yml` by default):

```bash
docker run -d \
  --name neo4j-dev \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/neo4j_dev \
  neo4j:5-community
```

2. Use the default connection settings (no changes to `.env` needed):

```bash
VALTER_NEO4J_URI=bolt://localhost:7687
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=neo4j_dev
```

### Aura setup (staging/production)

1. Create an Aura instance at [console.neo4j.io](https://console.neo4j.io). Save the connection URI, username, and password from the instance creation screen.

2. Set the environment variables:

```bash
VALTER_NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=your_aura_password
```

3. Validate the connection:

```bash
make validate-aura
```

:::caution
Any PR that modifies graph-related code (files in `stores/graph.py`, Cypher queries, graph endpoints) must pass `make validate-aura` before merging. This runs `scripts/validate_aura.py` with a 15-second latency threshold to ensure compatibility with the managed service.
:::

### Production constraints

In production (`VALTER_ENV=production`), the application enforces:

- `VALTER_NEO4J_URI` must not point to `localhost` or `127.0.0.1`
- `VALTER_NEO4J_PASSWORD` must not be a weak default (`neo4j_dev`, `password`, `changeme`, etc.)

## Railway.app

Railway hosts Valter's production and staging environments. Each runtime mode runs as a separate Railway service sharing the same codebase.

### Service architecture

| Railway Service | `VALTER_RUNTIME` | Purpose |
|---|---|---|
| API | `api` | REST API server |
| Worker | `worker` | Background ingest job processor |
| MCP Remote | `mcp-remote` | MCP HTTP server for ChatGPT/Claude |

### Deployment configuration

The deployment is configured by two files:

- `railway.json` -- Railway-specific build and deploy settings
- `Dockerfile` -- Container image definition

The container entrypoint is `scripts/start-command.sh`, which reads `VALTER_RUNTIME` and starts the appropriate process. Railway's `$PORT` variable is respected automatically.

### Setting up a new Railway service

1. Connect the GitHub repository to Railway.
2. Create three services from the same repo, each with a different `VALTER_RUNTIME`.
3. Set all required `VALTER_*` environment variables in the Railway dashboard for each service. See [Environment Variables](./environment.md) for the full reference.
4. Ensure `VALTER_ENV=production` for production services.

:::note
The MCP remote service uses `$PORT` from Railway as a fallback for `VALTER_MCP_SERVER_PORT`. The start script handles this automatically.
:::

### Remote services

For production deployments, you can offload embedding and reranking to dedicated Railway services:

```bash
VALTER_EMBEDDING_SERVICE_URL=https://your-embedding-service.up.railway.app
VALTER_RERANKER_SERVICE_URL=https://your-reranker-service.up.railway.app
```

This avoids bundling the ~500 MB embedding model in the main container.

## HuggingFace

Valter uses a HuggingFace model for generating semantic embeddings of legal documents. The default model is `rufimelo/Legal-BERTimbau-sts-base`, a Portuguese legal domain model producing 768-dimensional vectors.

### Downloading the model

```bash
make download-model
```

This downloads the model from HuggingFace Hub and caches it at `~/.cache/huggingface/`. The download is approximately 500 MB and only needs to happen once.

### Overriding the model

To use a different embedding model, set the environment variable before downloading:

```bash
VALTER_EMBEDDING_MODEL=my-org/my-model make download-model
```

:::caution
Changing the embedding model changes the vector dimensions and invalidates all existing vectors in Qdrant. You must re-ingest all documents after switching models. Update `VALTER_EMBEDDING_DIMENSION` to match the new model's output dimension.
:::

### Remote encoding alternative

If you prefer not to run the model locally (e.g., in CI or lightweight containers), set `VALTER_EMBEDDING_SERVICE_URL` to point to a remote encoding service:

```bash
VALTER_EMBEDDING_SERVICE_URL=https://your-embedding-service.up.railway.app
```

When this variable is set, the local model is not loaded and `make download-model` is not required. The same applies to the reranker via `VALTER_RERANKER_SERVICE_URL`.
