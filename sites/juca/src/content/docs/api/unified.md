---
title: Unified Endpoints
description: Core hub API endpoints for session management, analysis, and orchestration.
lang: en
sidebar:
  order: 3
---

# Unified Endpoints

> Core hub API endpoints that handle session management, unified analysis, and orchestration.

## Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/unified/sessions` | List all sessions for current user |
| POST | `/api/unified/sessions` | Migrate sessions from localStorage |
| POST | `/api/unified/session` | Create a new session |
| GET | `/api/unified/session/[sessionId]` | Load a specific session |
| PUT | `/api/unified/session/[sessionId]` | Update/upsert a session (full snapshot) |
| DELETE | `/api/unified/session/[sessionId]` | Delete a session |
| POST | `/api/unified/analyze` | Submit query for analysis (SSE stream) |

All endpoints require authentication via `auth()` from `@/lib/auth`.

---

## GET /api/unified/sessions

List all sessions for the authenticated user.

**Source:** `src/app/api/unified/sessions/route.ts`

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Maximum sessions to return |

**Response `200`:**

```json
{
  "sessions": [
    { "id": "abc-123", "title": "...", "createdAt": "..." }
  ],
  "stats": {}
}
```

**Error responses:** `401`, `500`

---

## POST /api/unified/sessions

Migrate sessions from client-side localStorage to the server database.

**Source:** `src/app/api/unified/sessions/route.ts`

**Request body:**

```json
{
  "sessions": [ { /* UnifiedSessionContext objects */ } ]
}
```

**Response `200`:**

```json
{ "migrated": 3, "total": 3 }
```

**Error responses:** `400`, `401`, `500`

---

## POST /api/unified/session

Create a new unified session.

**Source:** `src/app/api/unified/session/route.ts`

**Request body:**

```json
{ "title": "Optional session title" }
```

**Response `200`:** Returns the created `UnifiedSessionContext` object.

**Error responses:** `400`, `401`, `500`

---

## GET /api/unified/session/[sessionId]

Load a specific session with all context and analyzer state.

**Source:** `src/app/api/unified/session/[sessionId]/route.ts`

**Path parameters:** `sessionId: string`

**Auth:** Requires authentication + ownership check. Returns `403` if the session belongs to another user.

**Response `200`:** Returns `UnifiedSessionContextWithAnalyzer`.

**Error responses:** `400`, `401`, `403`, `404`, `500`

---

## PUT /api/unified/session/[sessionId]

Full snapshot replace or upsert of a session.

**Source:** `src/app/api/unified/session/[sessionId]/route.ts`

**Path parameters:** `sessionId: string`

**Request body:** `UnifiedSessionContextWithAnalyzer` — the `session.id` field must match the `sessionId` path parameter.

**Behavior:**
- If session exists and belongs to user: updates it → `{ updated: true, sessionId }`
- If session does not exist: creates via migration → `{ created: true, sessionId }`

**Error responses:** `400` (id mismatch or validation), `401`, `403`, `500`

---

## DELETE /api/unified/session/[sessionId]

Delete a session and its associated data.

**Source:** `src/app/api/unified/session/[sessionId]/route.ts`

**Path parameters:** `sessionId: string`

**Response `200`:**

```json
{ "deleted": true, "sessionId": "abc-123" }
```

**Error responses:** `400`, `401`, `403`, `404`, `500`

---

## POST /api/unified/analyze

Submit a query for unified analysis. Returns results via Server-Sent Events (SSE).

**Source:** `src/app/api/unified/analyze/route.ts`

**Configuration:**
- `maxDuration`: 300 seconds (5 minutes)
- Rate limit: 5 requests/minute (`rateLimitPresets.analyze`)

**Request body:**

```json
{
  "query": "responsabilidade civil por dano moral",
  "search_results": [ { "ementa": "...", "processo": "..." } ],
  "total_in_database": 1556,
  "pipeline_mode": "standard"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Non-empty search query |
| `search_results` | SearchResult[] | Yes | 1-10 items (standard/light) or 1-30 (deep) |
| `total_in_database` | number | Yes | Total matching results in corpus |
| `pipeline_mode` | `'standard'` \| `'light'` \| `'deep'` | No | Default: `standard` |

**Validation rules:**
- Each `SearchResult.ementa` must be at least 100 characters (shorter items are filtered out)
- Pipeline mode determines max results: `standard`/`light` = 10, `deep` = 30

**SSE events:**

```text
event: stage
data: { "stage": "searching", ... }

event: result
data: {
  "success": true,
  "data": {
    "response": "Analysis text...",
    "claims": [],
    "unknowns": [],
    "confidence": 0.85,
    "sources": [],
    "audit_trail": {
      "query": "...",
      "julgados_ids": [],
      "pipeline_mode": "standard",
      "models_used": {
        "generator": "claude-sonnet-4-20250514",
        "critics": ["qwen/qwen3-32b"],
        "revisor": "claude-sonnet-4-20250514"
      },
      "timestamp": "2026-02-28T...",
      "duration_ms": 12345
    },
    "follow_up_questions": [],
    "suggested_paths": [{ "label": "...", "query": "..." }]
  }
}

event: error
data: { "success": false, "error": { "code": "...", "message": "..." } }
```

**Non-SSE error responses:** `400`, `401`, `422` (no usable content), `503` (service unavailable)

---

## Orchestrator

The `/api/unified/analyze` endpoint delegates to the `UnifiedOrchestratorService` (`src/lib/unified/orchestrator.ts`), which:

1. **Detects intent** from the user query
2. **Checks for clarification needs** (slot-filling policy)
3. **Resolves artifact references** in the query text
4. **Routes to the appropriate tool** via the Tool Registry
5. **Streams progress** back to the client via SSE

The orchestrator output includes a `transparency` field exposing the detected intent, resolved references, and routing decision — useful for debugging and auditing.
