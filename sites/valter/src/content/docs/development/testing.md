---
title: Testing Guide
description: How to run and write tests in Valter — framework, coverage stats, mocking patterns, and test categories.
lang: en
sidebar:
  order: 3

---

# Testing Guide

Valter uses pytest with pytest-asyncio for async test support. The test suite spans 64 files with approximately 12,200 lines of test code, covering unit, integration, regression, and MCP tests.

## Running Tests

All test commands use Make targets:

```bash
make test             # Run the full test suite (660+ tests)
make test-cov         # Run with coverage report (term-missing format)
make test-neo4j-live  # Run Neo4j integration tests (requires Aura credentials)
make lint             # Check code style (ruff check + format verification)
make quality          # Run lint + mypy (scoped) + tests in sequence
```

To run a specific test file or test function:

```bash
pytest tests/unit/test_graph_routes.py -v
pytest tests/unit/test_features_search.py::test_empty_results -v
```

:::tip
Use `make quality` before pushing. It runs the same checks as CI: linting, type checking (on scoped files), and the full test suite.
:::

## Test Configuration

Test configuration lives in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

Key settings:

- **`testpaths`**: pytest only discovers tests under `tests/`
- **`asyncio_mode = "auto"`**: all `async def test_*` functions run as async tests automatically, without needing the `@pytest.mark.asyncio` decorator
- **Global fixtures**: defined in `tests/conftest.py`, including `settings` (test-safe `Settings` instance) and `live_graph_store` (Neo4j Aura connection, skipped if credentials are missing)

## Test Categories

### Unit Tests (57 files, ~10,000 lines)

Unit tests cover core logic, route handlers, stores (mocked), authentication, and models. They run without any external service dependencies.

Key test files:

| File | Tests | Coverage |
|---|---|---|
| `test_graph_routes.py` | ~162 | Graph API endpoints (divergences, optimal argument, etc.) |
| `test_features_search.py` | ~40 | Hybrid search, filtering, ranking |
| `test_retriever.py` | ~27 | Retriever logic, KG boost, query expansion |
| `test_mcp_tools.py` | ~28 | MCP tool registration and validation |

**Pattern:** all external dependencies (stores, Redis, Neo4j, Qdrant) are mocked using `unittest.mock.AsyncMock` or `MagicMock`. No live service connections in unit tests.

### Integration Tests (3 files, ~350 lines)

Integration tests run against a live Neo4j Aura instance and verify end-to-end graph query behavior.

| File | Purpose |
|---|---|
| `test_kg_live_graph.py` | Knowledge graph query correctness |
| `test_retriever_kg_live.py` | Retriever with real KG boost |
| `test_graph_store_live.py` | Graph store methods against real data |

These tests **skip automatically** if the Neo4j environment variables (`VALTER_NEO4J_URI`, `VALTER_NEO4J_USERNAME`, `VALTER_NEO4J_PASSWORD`) are not set. To run them:

```bash
export VALTER_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
export VALTER_NEO4J_USERNAME=neo4j
export VALTER_NEO4J_PASSWORD=your_password
make test-neo4j-live
```

### Regression Tests (3 files, ~130 lines)

Regression tests guard against quality regressions in search and graph results:

- **Golden questions**: known-good search queries with expected result characteristics
- **KG quality CI**: knowledge graph consistency checks (node/relationship counts, expected patterns)
- **Parity tests**: verify compatibility between Valter's API responses and the Juca frontend's expectations

### MCP Tests (1 file, ~1,700 lines)

MCP tests cover all 28 MCP tools, verifying:

- Tool registration and metadata
- Parameter validation (required fields, types, constraints)
- Response format compliance with the MCP protocol
- Error handling for invalid inputs

## Writing Tests

### Test structure

Follow the Arrange-Act-Assert pattern:

```python
async def test_divergences_returns_empty_for_unknown_ministro():
    # Arrange
    mock_store = AsyncMock()
    mock_store.find_divergences.return_value = []

    # Act
    result = await get_divergences(
        request=DivergenceRequest(ministro="Unknown", tema="civil"),
        graph_store=mock_store,
    )

    # Assert
    assert result == []
    mock_store.find_divergences.assert_called_once_with("Unknown", "civil")
```

### What to test

Tests must verify **behavior**, not just schema structure:

- Test the actual logic and post-processing, not only that the response has the correct fields
- Test edge cases: empty results, filters that exclude everything, boundary values
- Test error paths: what happens with invalid inputs, missing data, service failures
- Test inputs with accents, mixed case, and special characters (relevant for Brazilian legal data)

### Mocking patterns

**AsyncMock for async store methods:**

```python
from unittest.mock import AsyncMock, MagicMock

# Mock an entire store
mock_doc_store = AsyncMock()
mock_doc_store.get_by_id.return_value = sample_document

# Mock a specific method with side effects
mock_graph_store = AsyncMock()
mock_graph_store.find_divergences.side_effect = ConnectionError("Neo4j unavailable")
```

**Dependency injection override in route tests:**

```python
from fastapi.testclient import TestClient
from valter.api.deps import get_graph_store

app.dependency_overrides[get_graph_store] = lambda: mock_graph_store
client = TestClient(app)
response = client.post("/v1/graph/divergences", json={"ministro": "Test"})
```

**Settings fixture from conftest.py:**

```python
@pytest.fixture
def settings():
    return Settings(
        _env_file=None,
        ENV="test",
        DATABASE_URL="postgresql+asyncpg://test:test@localhost:5432/valter_test",
        NEO4J_URI="bolt://localhost:7687",
        NEO4J_USERNAME="neo4j",
        NEO4J_PASSWORD="test",
        REDIS_URL="redis://localhost:6379/1",
    )
```

The `_env_file=None` parameter prevents the test `Settings` from loading `.env` values, ensuring test isolation.

### File naming

- Test files: `test_<module_name>.py`
- Test functions: `test_<behavior_description>`
- Place unit tests in `tests/unit/`, integration tests in `tests/integration/`, regression tests in `tests/regression/`

## Coverage

Current test coverage by category:

| Category | Files | Lines | Scope |
|---|---|---|---|
| Unit | 57 | ~10,000 | Core logic, routes, stores (mocked), auth, models |
| Integration | 3 | ~350 | Neo4j Aura live queries |
| Regression | 3 | ~130 | Golden set, KG quality, Juca parity |
| MCP | 1 | ~1,700 | 28 tools + handlers + validation |
| Load | 0 | 0 | Placeholder (Locust available in dev deps) |
| **Total** | **64** | **~12,200** | |

Generate a coverage report:

```bash
make test-cov
```

This produces a terminal report with `--cov-report=term-missing`, showing which lines lack test coverage.

## Coverage Gaps

The following modules have limited or no direct test coverage:

| Module | Status | Notes |
|---|---|---|
| `stores/document.py` (PostgresDocStore) | No direct test | Tested indirectly via route tests |
| `stores/vector.py` (QdrantVectorStore) | No direct test | Tested indirectly via retriever tests |
| `stores/cache.py` (RedisCacheStore) | No direct test | Tested indirectly via route tests |
| `stores/artifact_storage.py` | No test | R2/local artifact storage |
| `api/middleware.py` | No direct test | Auth, rate limiting, CORS middleware |
| `tests/load/` | Empty | Placeholder for Locust load tests |

These gaps are known. Store modules are exercised indirectly through route and retriever tests that mock them, but dedicated unit tests for each store would improve confidence in edge case handling.
