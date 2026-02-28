---
title: "Installation"
description: "Complete setup guide for all Valter components: databases, embedding models, Neo4j, Groq, MCP servers, and production configuration."
lang: en
sidebar:
  order: 3
---

# Installation

This guide covers the complete setup of every Valter component. If you just want to get running quickly, start with the [Quickstart](/getting-started/quickstart/) and come back here when you need Neo4j, Groq, or production configuration.

## System requirements

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| Python | 3.12+ | Uses `X \| None` syntax, `type` statements |
| Docker | 20.10+ | For PostgreSQL, Qdrant, Redis containers |
| Docker Compose | v2+ | `docker compose` (not `docker-compose`) |
| make | any | Canonical command interface |
| RAM | ~4 GB | Embedding model (~1.5 GB) + databases (~2 GB) |
| Disk | ~3 GB | Model cache + container volumes |

## Python environment

Valter uses [uv](https://github.com/astral-sh/uv) as its preferred package manager, with pip as a fallback:

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# Install with dev dependencies
uv pip install -e ".[dev]"

# Or with pip:
pip install -e ".[dev]"
```

### Optional extras

```bash
# OCR support (pytesseract + pdf2image)
uv pip install -e ".[dev,ocr]"
```

:::caution
OCR requires the system package `tesseract-ocr` to be installed separately. On macOS: `brew install tesseract`. On Ubuntu: `apt install tesseract-ocr`. Without the system package, the Python packages install but OCR calls fail with an error at runtime.
:::

## Database setup

### PostgreSQL (relational data)

PostgreSQL stores documents, AI-extracted features, STJ metadata, ingestion jobs, workflows, API keys, and audit logs.

**Via Docker Compose (recommended):**

```bash
make docker-up  # Starts PostgreSQL 16 Alpine on port 5432
```

Default connection parameters (pre-configured in `.env.example`):

```
Host:     localhost:5432
Database: valter
User:     valter
Password: valter_dev
```

**Via existing PostgreSQL:**

Set your connection string in `.env`:

```bash
VALTER_DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
```

**Run migrations** after PostgreSQL is available:

```bash
make migrate  # alembic upgrade head
```

This creates all required tables across 8 migration files. Each migration supports `downgrade()` for rollback.

### Qdrant (vector search)

Qdrant stores semantic embeddings for similarity search. Valter uses 768-dimensional vectors with cosine distance.

**Via Docker Compose:**

```bash
make docker-up  # Also starts Qdrant on port 6333
```

The collection is created automatically on first startup. The `init_stores` function in `api/deps.py` calls `ensure_collection()` and validates that the configured dimension matches the existing collection.

```bash
VALTER_QDRANT_URL=http://localhost:6333
VALTER_QDRANT_COLLECTION=legal_chunks_v1  # default
```

### Redis (cache, rate limiting, job queue)

Redis serves three purposes: response caching with 180-second TTL, sliding-window rate limiting per API key, and ARQ job queue for background processing.

**Via Docker Compose:**

```bash
make docker-up  # Also starts Redis 7 Alpine on port 6379
```

```bash
VALTER_REDIS_URL=redis://localhost:6379/0  # Cache + rate limiting
VALTER_ARQ_REDIS_DB=1                       # Separate DB for job queue
```

:::danger
Redis is currently a single point of failure for the rate limiter. If Redis goes down, **all API requests are blocked** — even with valid API keys. This fail-closed behavior is being changed to fail-open in milestone v1.0 (issue #150).
:::

### Neo4j (knowledge graph)

Neo4j stores the knowledge graph: ~28,500 nodes (decisions, criteria, dispositivos, precedents) connected by ~207,000 edges. It powers the 12 `/v1/graph/*` endpoints, the KG boost in hybrid search, and structural similarity.

**Without Neo4j**, Valter still works — search, verification, enrichment, and ingestion all function. Only graph-specific features return 503.

#### Option A: Local Neo4j

Install [Neo4j Community Edition](https://neo4j.com/download/) 5.x, then configure:

```bash
VALTER_NEO4J_URI=bolt://localhost:7687
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=your_password
```

Run the Cypher schema migrations manually:

```bash
# Apply migrations in neo4j_migrations/ directory
cypher-shell -u neo4j -p your_password < neo4j_migrations/001_initial_schema.cypher
cypher-shell -u neo4j -p your_password < neo4j_migrations/002_indexes.cypher
```

#### Option B: Neo4j Aura (managed)

[Neo4j Aura](https://neo4j.com/cloud/aura/) is required for staging and production environments.

```bash
VALTER_NEO4J_URI=neo4j+s://abc123.databases.neo4j.io
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=your_aura_password
```

Validate the connection:

```bash
make validate-aura  # Runs scripts/validate_aura.py --max-latency-ms 15000
```

:::caution
Any PR that modifies graph-related code must pass `make validate-aura` before merge. This is enforced by CI and documented in the project's governance rules.
:::

## Embedding model

Valter uses [Legal-BERTimbau-sts-base](https://huggingface.co/rufimelo/Legal-BERTimbau-sts-base) — a Portuguese legal domain model producing 768-dimensional embeddings.

### Pre-download (recommended)

```bash
make download-model
```

This downloads ~500 MB to `~/.cache/huggingface/`. The model name is resolved with three-level priority:

1. Shell environment variable `VALTER_EMBEDDING_MODEL`
2. Value in `.env` file
3. Hardcoded fallback: `rufimelo/Legal-BERTimbau-sts-base`

### Automatic download

If you skip `make download-model`, the model downloads automatically on the first search request. This adds 30–60 seconds to the first request.

### Remote encoding

For production or resource-constrained environments, Valter supports remote encoding via a dedicated GPU service:

```bash
VALTER_EMBEDDING_SERVICE_URL=https://your-encoder-service.railway.app
```

When set, Valter uses `RailwayEncoder` instead of loading the model locally. The remote service must return 768-dimensional vectors.

Similarly for reranking:

```bash
VALTER_RERANKER_SERVICE_URL=https://your-reranker-service.railway.app
```

## Runtime modes

Valter runs in four modes from the same codebase, selected by `VALTER_RUNTIME`:

### API server (default)

```bash
make dev  # Development with hot reload
# or in production:
VALTER_RUNTIME=api uvicorn valter.main:app --host 0.0.0.0 --port 8000
```

The API server starts the full FastAPI application with middleware stack, 11 routers, and Prometheus metrics.

### ARQ worker

```bash
make worker-ingest
```

The worker processes background jobs: PDF ingestion, PROJUDI extraction, phase analysis, and jurisprudence matching. It connects to Redis (DB 1) as its job queue.

Configuration:

```bash
VALTER_INGEST_JOB_TIMEOUT_SECONDS=1800    # 30 min max per job
VALTER_INGEST_WORKER_CONCURRENCY=2         # Parallel job slots
```

### MCP stdio server (Claude Desktop/Code)

```bash
python -m valter.mcp
```

This starts the MCP server in stdio mode for local LLM connections. Configure it in Claude Desktop's `claude_desktop_config.json`:

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
        "VALTER_REDIS_URL": "redis://localhost:6379/0",
        "VALTER_MCP_API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

:::tip
The MCP stdio server bridges to the REST API via httpx. Make sure `VALTER_MCP_API_BASE_URL` points to a running API server — the MCP tools call the REST endpoints internally.
:::

### MCP HTTP/SSE server (ChatGPT)

```bash
make mcp-remote  # Starts on port 8001
```

This starts a streamable-HTTP MCP server for remote consumers like ChatGPT. It requires authentication:

```bash
VALTER_MCP_SERVER_AUTH_MODE=api_key
VALTER_MCP_SERVER_API_KEYS=your_key_1,your_key_2  # comma-separated for rotation
VALTER_MCP_SERVER_PORT=8001
```

### Container runtime selection

In Docker/Railway, the `scripts/start-command.sh` script selects the runtime:

```bash
VALTER_RUNTIME=api           # → uvicorn valter.main:app
VALTER_RUNTIME=worker        # → python -m valter.workers
VALTER_RUNTIME=mcp-remote    # → python -m valter.mcp.remote_server
VALTER_RUNTIME=mcp-stdio     # → python -m valter.mcp.remote_server (stdio transport)
```

## Optional integrations

### Groq LLM

Groq powers three features: document classification (21 AI-extracted fields), factual extraction from decision text, and query expansion (up to 3 search variants).

```bash
VALTER_GROQ_API_KEY=gsk_your_key_here  # Get from https://console.groq.com/keys
VALTER_GROQ_ENABLED=true
VALTER_GROQ_MODEL=qwen/qwen3-32b       # default
```

Without Groq, all other features work normally — factual extraction endpoints return errors, and query expansion is silently skipped.

### Cloudflare R2

R2 provides S3-compatible object storage for workflow artifacts (PDFs, analysis JSONs). A deterministic canary rollout mechanism controls what percentage of artifacts go to R2 vs local storage.

```bash
VALTER_R2_ACCOUNT_ID=your_account_id
VALTER_R2_ACCESS_KEY_ID=your_access_key
VALTER_R2_SECRET_ACCESS_KEY=your_secret_key
VALTER_R2_BUCKET_NAME=valter-artifacts        # default
VALTER_R2_CANARY_PERCENT=0                     # 0 = all local, 100 = all R2
VALTER_R2_PRESIGN_TTL_SECONDS=600              # Signed URL validity
```

Without R2 credentials, artifacts are stored locally at `VALTER_UPLOAD_STORAGE_PATH` (default: `data/datasets/uploads/raw`).

## Production configuration

When `VALTER_ENV=production`, Valter enforces several safety checks at startup. The server **will not start** if any of these are violated:

| Requirement | Why |
|-------------|-----|
| `VALTER_AUTH_ENABLED=true` | API must require authentication |
| Explicit CORS origins (no `["*"]`) | Wildcard CORS is insecure |
| `VALTER_METRICS_IP_ALLOWLIST` set | `/metrics` must be IP-restricted |
| Remote Neo4j URI (`neo4j+s://`) | Local bolt connections are dev-only |
| Non-weak passwords | Rejects `neo4j_dev`, `password`, `changeme`, etc. |
| Non-default DB credentials | Rejects the default `valter:valter_dev` connection |
| Remote Redis | Rejects `localhost` Redis in production |

These checks are implemented in `config.py`'s production validator (lines 95–121).

## Verification

After setup, run the full verification suite:

```bash
# Run 660+ tests
make test

# Lint check (ruff + format verification)
make lint

# Full quality gate (lint + mypy + tests)
make quality

# Health check
curl -s http://localhost:8000/health | python -m json.tool
```

All stores should show `"status": "up"` except Neo4j (if not configured) and `worker_ingest` (if the worker isn't running).

## Complete make target reference

| Target | Command | Description |
|--------|---------|-------------|
| `make dev` | `uvicorn ... --reload` | Development server with hot reload (port 8000) |
| `make test` | `pytest tests/ -v` | Run all tests |
| `make test-cov` | `pytest ... --cov=valter` | Tests with coverage report |
| `make test-neo4j-live` | `pytest tests/integration/...` | Neo4j integration tests (requires Aura) |
| `make lint` | `ruff check + format --check` | Lint and format verification |
| `make fmt` | `ruff check --fix + format` | Auto-fix lint issues and format |
| `make quality` | `lint + mypy + test` | Full quality gate |
| `make migrate` | `alembic upgrade head` | Run database migrations |
| `make docker-up` | `docker compose up -d` | Start database containers |
| `make docker-down` | `docker compose down` | Stop database containers |
| `make download-model` | Python snippet | Download embedding model to cache |
| `make validate-aura` | `python scripts/validate_aura.py` | Validate Neo4j Aura connection |
| `make worker-ingest` | `python -m valter.workers` | Start background job worker |
| `make mcp-remote` | `python -m valter.mcp.remote_server` | Start MCP HTTP/SSE server (port 8001) |

## Next steps

- **[Architecture Overview](/architecture/overview/)** — How the layers and data stores fit together
- **[Environment Variables](/configuration/environment/)** — Complete reference for all 50+ env vars
- **[API Reference](/api/)** — All endpoints with schemas
- **[Coding Conventions](/development/conventions/)** — Standards enforced in the codebase
