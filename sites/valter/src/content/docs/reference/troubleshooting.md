---
title: Troubleshooting
description: Common issues and solutions when running Valter locally or in production.
lang: en
sidebar:
  order: 3

---

# Troubleshooting

Common issues encountered during development and production operation, with diagnosis steps and solutions.

## Database Connectivity

### Neo4j returns 503 on graph endpoints

**Symptom:** Graph analytics endpoints (`/v1/graph/*`) return `503 Service Unavailable`.

**Cause:** Neo4j is not included in `docker-compose.yml` by design. It must be configured separately.

**Solution:**

Option A — Local Neo4j:

```bash
# Install and start Neo4j locally
brew install neo4j  # macOS
neo4j start
```

Option B — Neo4j Aura (cloud):

```bash
# Set these in your .env file
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
```

:::note
Non-graph endpoints (search, verify, enrich) work without Neo4j. Graph features degrade gracefully — search results simply lack KG boost scores.
:::

### Redis connection refused

**Symptom:** `ConnectionRefusedError` on startup or `redis.exceptions.ConnectionError` during requests.

**Cause:** Redis container is not running.

**Solution:**

```bash
# Start infrastructure containers (PostgreSQL, Redis, Qdrant)
make docker-up

# Verify Redis is running
docker compose ps redis
```

**Impact if Redis is down:**
- Cache is disabled (requests hit the database directly)
- Rate limiting fails **closed** — all requests are blocked (v1.0 will fix this to fail-open)
- ARQ background workers cannot process jobs

### PostgreSQL migration failures

**Symptom:** `alembic upgrade head` fails with schema conflicts or connection errors.

**Cause:** Database not running, or migration history is out of sync.

**Solution:**

```bash
# Ensure PostgreSQL is running
make docker-up

# Run migrations
make migrate

# If there are conflicts, check the migration history
alembic -c migrations/alembic.ini history

# To see the current database revision
alembic -c migrations/alembic.ini current
```

If a migration fails mid-way:

1. Check which revision the database is at with `alembic current`
2. Review the failing migration in `migrations/versions/`
3. If the migration has a `downgrade()` function, you can rollback: `alembic -c migrations/alembic.ini downgrade -1`
4. If the migration is marked irreversible, consult the PR that introduced it for a contingency plan

:::danger
Never run `alembic downgrade` in production without an explicit rollback plan. Irreversible migrations (those without `downgrade()`) require manual database intervention.
:::

---

## Embedding Model

### Model download fails or is slow

**Symptom:** `make download-model` hangs, times out, or fails with a network error.

**Cause:** Hugging Face model downloads can be large (~500MB for Legal-BERTimbau) and are affected by network conditions.

**Solution:**

```bash
# Retry the download
make download-model

# If download keeps failing, check your network and HuggingFace status
curl -I https://huggingface.co

# Alternative: use a remote embedding service instead of local model
# Set in .env:
VALTER_EMBEDDING_SERVICE_URL=https://your-embedding-service/encode
```

The model is cached at `~/.cache/huggingface/` after the first successful download. Subsequent starts will use the cache.

:::tip
If you are behind a corporate proxy, set `HTTP_PROXY` and `HTTPS_PROXY` before running `make download-model`.
:::

### Qdrant dimension mismatch

**Symptom:** Search returns an error about vector dimensions not matching the collection configuration.

**Cause:** The Qdrant collection was created with a different embedding dimension than the current model produces. This happens when switching embedding models (e.g., from a 384d model to the 768d Legal-BERTimbau).

**Solution:**

1. Check the current model's dimension:

```bash
python -c "from sentence_transformers import SentenceTransformer; m = SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base'); print(m.get_sentence_embedding_dimension())"
# Expected output: 768
```

2. Verify the `VALTER_EMBEDDING_DIMENSION` environment variable matches:

```bash
# In .env
VALTER_EMBEDDING_DIMENSION=768
```

3. If the collection was created with the wrong dimension, it must be recreated:

```bash
# WARNING: This deletes all indexed vectors. You will need to re-index.
python -c "from qdrant_client import QdrantClient; c = QdrantClient('localhost', port=6333); c.delete_collection('valter_documents')"
```

After deleting the collection, restart the application — it will recreate the collection with the correct dimension on startup.

---

## OCR Issues

### OCR fails with ImportError

**Symptom:** `ImportError: No module named 'pytesseract'` or `FileNotFoundError: tesseract is not installed`.

**Cause:** OCR has two dependencies — the Python package and the system binary. Both must be installed.

**Solution:**

```bash
# Install the Python OCR extras
pip install -e ".[ocr]"

# Install the system Tesseract binary
# macOS:
brew install tesseract tesseract-lang

# Ubuntu/Debian:
sudo apt-get install tesseract-ocr tesseract-ocr-por

# Verify installation
tesseract --version
```

:::note
OCR is optional. If not installed, text extraction falls back to `pdfplumber`, which works well for digitally-generated PDFs but cannot extract text from scanned documents.
:::

---

## MCP Server

### MCP stdio not connecting to Claude Desktop

**Symptom:** Claude Desktop does not list Valter's tools, or shows a connection error.

**Cause:** Incorrect `claude_desktop_config.json` configuration.

**Solution:**

1. Verify your Claude Desktop configuration file (location depends on OS):

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp.stdio_server"],
      "env": {
        "PYTHONPATH": "/path/to/Valter/src"
      }
    }
  }
}
```

2. Common issues to check:
   - The `command` must point to the correct Python binary (use the full path if using a virtual environment: `/path/to/Valter/.venv/bin/python`)
   - `PYTHONPATH` must include the `src/` directory
   - Environment variables needed by Valter (database URLs, API keys) must be present in the `env` block or inherited from the shell

3. Restart Claude Desktop after changing the configuration.

### MCP remote returns 401 Unauthorized

**Symptom:** Remote MCP client receives `401 Unauthorized` when calling tools.

**Cause:** Invalid or missing API key in the request.

**Solution:**

1. Verify the API keys are configured on the server:

```bash
# In .env — comma-separated list of valid keys
VALTER_MCP_SERVER_API_KEYS=key1,key2
```

2. Verify the client is sending the key correctly (as a Bearer token or in the configured header).

3. Start the remote MCP server and check logs for auth errors:

```bash
make mcp-remote
# Watch for 401 entries in the structured log output
```

:::caution
API keys are validated via HMAC. Ensure there are no trailing whitespace characters in the key values in your `.env` file.
:::

---

## Development

### ruff not found

**Symptom:** `make lint` fails with `ruff: command not found`.

**Cause:** The virtual environment is not activated, or `ruff` is not installed.

**Solution:**

```bash
# Activate the virtual environment
source .venv/bin/activate

# If ruff is not installed
pip install ruff

# Then run lint
make lint
```

### Tests fail with async errors

**Symptom:** Tests fail with `RuntimeError: no current event loop` or `PytestUnraisableExceptionWarning` related to asyncio.

**Cause:** `pytest-asyncio` mode is not configured correctly.

**Solution:**

Verify that `pyproject.toml` has the correct asyncio mode:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

If the setting is correct but tests still fail, check that `pytest-asyncio` is installed:

```bash
pip install pytest-asyncio
```

### Type checking errors with mypy

**Symptom:** `make quality` fails at the mypy step with type errors.

**Cause:** Missing type stubs or strict typing violations.

**Solution:**

The `quality` target runs mypy only on a scoped subset of files (defined in `MYPY_QUALITY_SCOPE` in the Makefile). If you are adding new files to the scope, ensure they have complete type annotations on all public functions.

```bash
# Run mypy on just the scoped files
mypy --follow-imports=silent src/valter/api/deps.py src/valter/api/routes/ingest.py src/valter/mcp/tools.py
```

---

## Production

### Rate limiting blocks all requests

**Symptom:** All API requests return `429 Too Many Requests` or `503 Service Unavailable`, even at low traffic.

**Cause:** Redis is down and the rate limiter is configured to **fail-closed**. When Redis is unreachable, no rate limit checks can pass, so all requests are rejected.

**Solution (immediate):**

```bash
# Restart Redis
docker compose restart redis

# Verify Redis is responding
docker compose exec redis redis-cli ping
# Expected: PONG
```

**Solution (permanent):** This is tracked as the highest-priority fix for v1.0 — switching the rate limiter to fail-open for valid API keys when Redis is unavailable.

:::danger
Until v1.0 ships the fail-open fix, a Redis outage in production means **100% of traffic is blocked**. Ensure Redis health monitoring and restart automation are in place.
:::

### High latency on graph endpoints

**Symptom:** Graph analytics endpoints take > 10s to respond or time out.

**Cause:** Complex graph traversals on large subgraphs, or Neo4j is under memory pressure.

**Solution:**

1. Check Neo4j memory allocation — the default may be too low for the ~28,000 node / ~207,000 relationship graph
2. Verify that graph indexes exist for frequently-queried properties (decision number, minister name, legal provision)
3. For Neo4j Aura: check the instance tier and whether you are hitting query limits

> **Planned Feature** -- v1.1 will add a circuit breaker that opens after Neo4j hangs for > 5s, allowing requests to proceed without graph features rather than blocking indefinitely.
