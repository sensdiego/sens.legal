---
title: Development Setup
description: Complete guide to setting up a local development environment for Valter.
lang: en
sidebar:
  order: 1

---

# Development Setup

This guide walks through setting up a complete local development environment for Valter, from installing prerequisites to verifying that all services are running.

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Purpose |
|---|---|---|
| Python | >= 3.12 | Runtime language |
| Docker + Docker Compose | Recent stable | Database services (PostgreSQL, Qdrant, Redis) |
| make | Any | Canonical command interface |
| Git | Any | Version control |
| uv (recommended) | Recent | Fast Python package manager. Falls back to `pip` if unavailable. |

**Resource requirements:** approximately 4 GB RAM and 3 GB disk space (including the embedding model).

## Step 1: Clone and Install Dependencies

Clone the repository and create a Python virtual environment:

```bash
git clone <repo-url>
cd Valter
python -m venv .venv
source .venv/bin/activate
```

Install all dependencies including dev tools:

```bash
# Preferred: using uv (faster)
uv pip install -e ".[dev]"

# Alternative: using pip
pip install -e ".[dev]"
```

This installs FastAPI, SQLAlchemy, Qdrant client, Neo4j driver, sentence-transformers, and all development tools (pytest, ruff, mypy).

## Step 2: Start Database Services

The `docker-compose.yml` file defines three database services for local development:

```bash
make docker-up
```

This starts the following containers:

| Service | Image | Port | Purpose |
|---|---|---|---|
| PostgreSQL | `postgres:16-alpine` | 5432 | Document metadata, migrations |
| Qdrant | `qdrant/qdrant:latest` | 6333 | Vector similarity search |
| Redis | `redis:7-alpine` | 6379 | Caching, rate limiting, ARQ job queue |

Verify the services are running:

```bash
docker compose ps
```

All three containers should show `running` status.

:::note
Neo4j is not included in `docker-compose.yml`. For graph features, either run Neo4j locally via Docker (see [Neo4j setup](../configuration/integrations.md#local-development-community-edition)) or connect to a Neo4j Aura instance. Graph features are optional for basic development.
:::

## Step 3: Configure Environment

Most environment variables have defaults that work with the `docker-compose.yml` stack. For basic development, no `.env` file is required.

To enable optional features, create a `.env` file at the project root:

```bash
# .env (optional — only for features you need)

# Groq LLM (enables factual extraction, query expansion)
# VALTER_GROQ_API_KEY=gsk_your_key_here
# VALTER_GROQ_ENABLED=true

# Neo4j (enables graph features)
# VALTER_NEO4J_URI=bolt://localhost:7687

# Remote embedding (skips local model download)
# VALTER_EMBEDDING_SERVICE_URL=https://your-service.up.railway.app
```

See the [Environment Variables](../configuration/environment.md) reference for all available options.

## Step 4: Run Database Migrations

Apply Alembic migrations to set up the PostgreSQL schema:

```bash
make migrate
```

This runs `alembic upgrade head` using the configuration in `migrations/alembic.ini`. The migration connects to the database defined by `VALTER_DATABASE_URL` (defaults to the local PostgreSQL from docker-compose).

:::caution
If migrations fail with a connection error, verify that the PostgreSQL container is running with `docker compose ps` and that port 5432 is accessible.
:::

## Step 5: Download the Embedding Model

The semantic search feature requires a pre-trained embedding model:

```bash
make download-model
```

This downloads `rufimelo/Legal-BERTimbau-sts-base` (~500 MB) from HuggingFace Hub and caches it at `~/.cache/huggingface/`. The download only needs to happen once.

To use a different model:

```bash
VALTER_EMBEDDING_MODEL=my-org/my-model make download-model
```

:::tip
If you set `VALTER_EMBEDDING_SERVICE_URL` in your `.env` to point to a remote encoding service, you can skip this step entirely. The remote service handles embedding generation.
:::

## Step 6: Verify the Setup

### Start the development server

```bash
make dev
```

The API starts at `http://localhost:8000`. Verify with:

```bash
curl http://localhost:8000/v1/health
```

A successful response confirms that the API is running and database connections are healthy.

### Run the test suite

```bash
make test
```

This runs 660+ tests across unit, regression, and MCP test suites. All tests should pass without external service dependencies (stores are mocked in unit tests).

### Run linting

```bash
make lint
```

This runs `ruff check` and `ruff format --check` across `src/` and `tests/`.

## Make Targets

The `Makefile` is the canonical command interface. Use `make <target>` for all routine operations.

| Target | Description |
|---|---|
| `make dev` | Start development server with hot reload (port 8000) |
| `make test` | Run the full pytest suite |
| `make test-cov` | Run tests with coverage report |
| `make test-neo4j-live` | Run Neo4j integration tests (requires Aura credentials) |
| `make lint` | Check code style with ruff (check + format verification) |
| `make fmt` | Auto-fix code style issues and format code |
| `make quality` | Run lint, mypy (scoped), and tests together |
| `make migrate` | Apply Alembic database migrations |
| `make worker-ingest` | Start the ARQ background worker for ingest jobs |
| `make mcp-remote` | Start the MCP HTTP server (port 8001) |
| `make docker-up` | Start database containers (PostgreSQL, Qdrant, Redis) |
| `make docker-down` | Stop and remove database containers |
| `make download-model` | Download the embedding model from HuggingFace |
| `make validate-aura` | Validate graph queries against a live Neo4j Aura instance |

:::tip
Use `make quality` before pushing code. It runs linting, type checking, and the full test suite in sequence, matching the CI validation pipeline.
:::

## Troubleshooting

### Database connection errors

If `make migrate` or `make dev` fails to connect to PostgreSQL:

```bash
# Check that containers are running
docker compose ps

# Check PostgreSQL logs
docker compose logs postgres

# Restart the stack
make docker-down && make docker-up
```

### Port conflicts

If port 5432, 6333, or 6379 is already in use, either stop the conflicting service or modify the port mappings in `docker-compose.yml`.

### Model download failures

If `make download-model` fails due to network issues, retry or set `VALTER_EMBEDDING_SERVICE_URL` to use a remote encoding service instead.
