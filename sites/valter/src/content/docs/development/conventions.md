---
title: Coding Conventions
description: Coding standards, naming patterns, architectural rules, and pre-commit review checklist enforced in Valter.
lang: en
sidebar:
  order: 2

---

# Coding Conventions

These conventions are enforced across the Valter codebase. They are derived from the project's governance rules and established through practice. All contributors -- human and AI agents -- must follow them.

## Language and Typing

Valter is a Python 3.12+ project. All code must include type hints on public functions and use modern Python features.

**Core rules:**

- **Type hints** are mandatory on all public function signatures (parameters and return types)
- **Pydantic v2** is the only model framework for domain objects. Do not use `dataclasses` or plain dicts for data that crosses API boundaries.
- **`async/await`** is required for all I/O operations (database queries, HTTP calls, file reads). No synchronous I/O in the hot path.

```python
# Correct: typed, async, Pydantic model
async def get_decisao(decisao_id: str) -> DecisaoDetail:
    ...

# Wrong: missing types, sync I/O
def get_decisao(id):
    result = db.query(...)  # blocking call
```

## Architecture Rules

The dependency rule is strictly enforced: `api/` depends on `core/`, which depends on `models/`. No reverse imports.

```
api/ ---> core/ ---> models/
            ^
            |
stores/ implements protocols from core/protocols.py
```

**Key constraints:**

- **`core/` never imports `stores/` directly.** Store implementations are injected via FastAPI's `Depends()` dependency injection. This keeps business logic decoupled from infrastructure.
- **`stores/` implements protocols** defined in `core/protocols.py`. Each store (PostgreSQL, Neo4j, Qdrant, Redis) conforms to an abstract interface.
- **Before creating an endpoint, read the entire store method** -- not just its signature. Identify hardcoded limits, case-sensitivity behavior, data formats, and possible errors. Document any limitations in the endpoint's OpenAPI schema.

```python
# In api/routes/graph.py -- store injected via Depends()
@router.post("/divergences")
async def get_divergences(
    request: DivergenceRequest,
    graph_store: Neo4jGraphStore = Depends(get_graph_store),
):
    return await graph_store.find_divergences(request.ministro, request.tema)
```

## Logging

Valter uses `structlog` for structured JSON logging. Every HTTP request receives a `trace_id` for correlation.

**Guidelines:**

- Use structured key-value fields, not string interpolation
- Log at the appropriate level: `debug` for development details, `info` for normal operations, `warning` for recoverable issues, `error` for failures
- The log level is configured via `VALTER_LOG_LEVEL` (default: `INFO`)

```python
import structlog

logger = structlog.get_logger()

# Correct: structured fields
logger.info("document_indexed", doc_id=doc.id, chunks=len(chunks))

# Wrong: string interpolation
logger.info(f"Indexed document {doc.id} with {len(chunks)} chunks")
```

## Error Handling

Error handling must be precise. The goal is to catch expected failures and let programming bugs surface as 500 errors so they are visible and fixable.

**Rules:**

- **No catch-all `except Exception`.** Catch only specific, expected errors (connection timeouts, network failures, known validation errors).
- **Programming bugs must surface as 500s.** `KeyError`, `TypeError`, `AttributeError`, and similar bugs should never be silently caught. They indicate a code defect that needs fixing.
- **Verify that catch blocks do not swallow internal errors.** A broad `except` on an external call can accidentally hide bugs in the code that prepares or processes the call.

```python
# Correct: catch only expected errors
try:
    result = await neo4j_driver.execute_query(cypher, params)
except neo4j.exceptions.ServiceUnavailable:
    logger.warning("neo4j_unavailable", uri=settings.NEO4J_URI)
    raise HTTPException(status_code=503, detail="Graph database unavailable")

# Wrong: catch-all hides bugs
try:
    result = await neo4j_driver.execute_query(cypher, params)
except Exception:
    return {"results": []}  # Silently returns empty on ANY error
```

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| REST endpoints | kebab-case | `/v1/graph/optimal-argument` |
| Python functions/variables | snake_case | `find_divergences` |
| Python classes | PascalCase | `Neo4jGraphStore` |
| Files | snake_case | `graph_store.py` |
| Environment variables | UPPER_SNAKE_CASE with `VALTER_` prefix | `VALTER_NEO4J_URI` |

:::note
The endpoint `/similar_cases` uses underscores instead of kebab-case. This is a legacy naming that would be a breaking change to rename. New endpoints must use kebab-case.
:::

## Git and PR Workflow

### Commit messages

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add divergence detection endpoint
fix: handle empty result set in phase analysis
chore: update Neo4j driver to 5.28
docs: add MCP configuration guide
refactor: extract query builder from retriever
test: add edge case tests for graph routes
```

### Branch naming

```
feat/[issue-id]-[description]
fix/[issue-id]-[description]
chore/[issue-id]-[description]
docs/[issue-id]-[description]
refactor/[issue-id]-[description]
test/[issue-id]-[description]
codex/[issue-id]-[description]
```

Example: `feat/SEN-267-mcp-auth-claude`

Claude Code branches use the `-claude` suffix. Codex branches use the `codex/` prefix. See the [Contributing Guide](./contributing.md#multi-agent-coordination) for multi-agent rules.

## Pre-Commit Review Checklist

Before committing, verify every change against these five checks. The goal is to commit code that **works**, not code that merely compiles.

### 1. Parameter honesty

Every parameter exposed in the API must do exactly what its `description` says. If there are internal hardcoded limits (`LIMIT` clauses, `WHERE >= N` filters), they must be documented in the OpenAPI schema. If a parameter cannot fulfill its promise, either fix the implementation or document the limitation.

### 2. Error handling precision

Verify that:
- No `except Exception` catch-all exists
- Only expected errors are caught (connection failures, timeouts)
- Programming bugs (`KeyError`, `TypeError`) are allowed to surface as 500s
- Catch blocks do not accidentally swallow internal system errors

### 3. Data edge cases

Test the behavior for:
- Input that does not exist in the backend (nonexistent ministro, invalid category)
- Empty result sets -- can the client distinguish "not found" from "does not exist"?
- Inputs with accents, mixed case, and special characters
- Incompatible filter combinations

### 4. Tests test behavior

Tests must verify actual behavior, not just schema structure:
- Test post-processing logic, not just that the response has the right fields
- Test edge cases: empty results, filters that exclude everything, boundary values
- Use mocked stores (do not depend on live services for unit tests)

### 5. Read the store first

Before writing an endpoint, read the entire store method it calls:
- Identify hardcoded limits and their effects on results
- Understand case-sensitivity behavior in queries
- Note data formats and any transformations applied
- Document any limitation the client needs to know about

## Priority Order

When conventions or principles conflict, resolve them in this order:

1. **Correctness** -- especially for legal data, billing, and data integrity
2. **Simplicity and clarity** -- code that another agent or developer can understand without additional context
3. **Maintainability** -- easy to modify without breaking unrelated features
4. **Reversibility** -- prefer decisions that can be undone
5. **Performance** -- optimize only when there is evidence of a problem

## Non-Goals

The following actions are prohibited without explicit authorization:

- Introducing abstractions without a clear, immediate need
- Adding dependencies for problems already solved in the codebase
- Refactoring working code without a specific issue driving the change
- Optimizing code without evidence of a performance problem
- Expanding scope beyond the issue being worked on
