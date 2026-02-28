---
title: Ingest Endpoints
description: API reference for ingestion workflow endpoints — PDF analysis, phase processing, artifact management, and human review.
lang: en
sidebar:
  order: 5

---

# Ingest Endpoints

Endpoints under `/v1/ingest/` for the full case analysis workflow: from PDF upload through automated phase analysis to human-reviewed legal analysis. Many endpoints have dual paths (`/workflow/...` and `/processo/full-analysis/...`) for backward compatibility.

## Workflow Lifecycle

### POST /v1/ingest/workflow

Start a full case analysis workflow. Upload a PDF file for asynchronous processing. This is the primary entry point for new case analysis.

Alias: `POST /v1/ingest/processo/full-analysis` (legacy, same handler).

**Content-Type:** `multipart/form-data`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `file` | `UploadFile` | **required** | PDF file of the legal case |
| `source_system` | `string` | `"projudi"` | Upstream source system label |
| `rules_version` | `string` | `null` | Ruleset version override |
| `min_precedent_score` | `number` | `null` | Minimum precedent score threshold (0-100) |
| `max_matches_per_phase` | `integer` | `null` | Cap on precedent matches per phase (1-10) |
| `reason` | `string` | `null` | Operator note for audit traceability |
| `strict_infra_required` | `boolean` | `true` | Fail if required infra dependencies are unavailable |

**Returns:** `202 Accepted` with `workflow_id` and initial status.

```bash
curl -X POST http://localhost:8000/v1/ingest/workflow \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@caso-12345.pdf" \
  -F "source_system=projudi"
```

:::note
Maximum upload size is controlled by `VALTER_MAX_UPLOAD_MB` (default: 100 MB).
:::

### GET /v1/ingest/workflow/{workflow_id}

Check current state and progress of a workflow.

Alias: `GET /v1/ingest/processo/full-analysis/{workflow_id}`

| Parameter | Type | Description |
|---|---|---|
| `workflow_id` | `string` (path) | Workflow ID returned by the creation endpoint |

Returns the current state, progress details, phases, and any errors.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123 \
  -H "Authorization: Bearer $API_KEY"
```

### GET /v1/ingest/workflow/{workflow_id}/result

Retrieve the consolidated result of a completed workflow.

Alias: `GET /v1/ingest/processo/full-analysis/{workflow_id}/result`

Returns the full analysis result when the workflow is complete, or a not-ready/error payload while still running.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/result \
  -H "Authorization: Bearer $API_KEY"
```

## Legacy Process Extraction

### POST /v1/ingest/processo

Start a process extraction workflow (legacy pipeline, predates the full-analysis workflow).

**Returns:** `202 Accepted` with `extraction_id`.

### GET /v1/ingest/processo/{extraction_id}

Check status and result of a legacy process extraction.

### POST /v1/ingest/processo/{extraction_id}/validate

Validate (approve/reject) a legacy extraction with an optional reason.

## PDF Conversion

### POST /v1/ingest/pdf-to-markdown

Convert a full legal process PDF to relevant Markdown. Standalone utility that does not create a workflow.

| Parameter | Type | Description |
|---|---|---|
| `file` | `UploadFile` | PDF file to convert |

Returns converted Markdown with highlighted relevant sections.

## Phase Analysis

### POST /v1/ingest/processo/{extraction_id}/phase-analysis

Run phase analysis on an extraction. Identifies procedural phases in the legal case and matches each to relevant jurisprudence.

**Returns:** `202 Accepted` with `analysis_id`.

### GET /v1/ingest/processo/{extraction_id}/phase-analysis/{analysis_id}

Check status and results of a phase analysis.

### POST /v1/ingest/processo/{extraction_id}/phase-analysis/reprocess

Reprocess phase analysis for an extraction. Creates a new immutable analysis run without modifying the previous one.

**Returns:** `202 Accepted` with new `analysis_id`.

## Human Review

### POST /v1/ingest/processo/{extraction_id}/phase-analysis/{analysis_id}/review

Submit human review for phases in a legacy phase analysis. Approve or reject individual phases with reviewer notes.

| Parameter | Type | Description |
|---|---|---|
| `phase_label` | `string` | Phase identifier to review |
| `approved` | `boolean` | Approval decision |
| `reviewer` | `string` | Reviewer identity for audit trail |
| `notes` | `string` | Review notes |

### POST /v1/ingest/workflow/{workflow_id}/review

Submit human review for a full-analysis workflow. Supports per-phase and final review.

Alias: `POST /v1/ingest/processo/full-analysis/{workflow_id}/review`

| Parameter | Type | Description |
|---|---|---|
| `phase_label` | `string` | Phase to review (omit for final review) |
| `approved` | `boolean` | Review decision |
| `reviewer` | `string` | Reviewer identity |
| `notes` | `string` | Review notes |

## Reprocessing

### POST /v1/ingest/workflow/{workflow_id}/reprocess

Start a new immutable execution for an existing workflow. Does not mutate prior executions.

Alias: `POST /v1/ingest/processo/full-analysis/{workflow_id}/reprocess`

**Returns:** `202 Accepted` with new workflow run information.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `rules_version` | `string` | `null` | Ruleset version override for the new run |
| `min_precedent_score` | `number` | `null` | Minimum precedent score threshold |
| `max_matches_per_phase` | `integer` | `null` | Cap on precedent matches per phase |
| `reason` | `string` | `null` | Operator reason for audit trail |
| `strict_infra_required` | `boolean` | `null` | Override strict infrastructure requirement |

## Audit & Events

### GET /v1/ingest/workflow/{workflow_id}/events

List auditable events for a workflow. Returns timestamped events for all state transitions, phase completions, errors, and review actions.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/events \
  -H "Authorization: Bearer $API_KEY"
```

### GET /v1/ingest/workflow/{workflow_id}/interactions

List the domain interaction trail for a workflow. Includes human reviews, system decisions, and operator notes.

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/interactions \
  -H "Authorization: Bearer $API_KEY"
```

## Artifacts

### GET /v1/ingest/workflow/{workflow_id}/artifacts

List all versioned artifacts generated by a workflow (PDFs, JSONs, Markdown reports, logs).

```bash
curl http://localhost:8000/v1/ingest/workflow/wf-abc123/artifacts \
  -H "Authorization: Bearer $API_KEY"
```

### POST /v1/ingest/workflow/{workflow_id}/artifacts/{artifact_id}/signed-url

Generate a time-limited signed URL for downloading a specific workflow artifact.

| Parameter | Type | Description |
|---|---|---|
| `workflow_id` | `string` (path) | Workflow ID |
| `artifact_id` | `string` (path) | Artifact identifier from the artifacts list |

Returns a signed URL with a TTL controlled by `VALTER_R2_PRESIGN_TTL_SECONDS` (default: 600 seconds / 10 minutes).

```bash
curl -X POST http://localhost:8000/v1/ingest/workflow/wf-abc123/artifacts/art-456/signed-url \
  -H "Authorization: Bearer $API_KEY"
```

```json
{
  "data": {
    "signed_url": "https://storage.example.com/artifacts/art-456?X-Amz-Signature=...",
    "expires_in_seconds": 600
  },
  "meta": {
    "trace_id": "a1b2c3d4-...",
    "latency_ms": 45.2
  }
}
```

## Endpoint Summary

| Method | Path | Description | Status |
|---|---|---|---|
| `POST` | `/v1/ingest/workflow` | Start full analysis workflow | 202 |
| `GET` | `/v1/ingest/workflow/{id}` | Get workflow status | 200 |
| `GET` | `/v1/ingest/workflow/{id}/result` | Get workflow result | 200 |
| `POST` | `/v1/ingest/workflow/{id}/review` | Submit human review | 200 |
| `POST` | `/v1/ingest/workflow/{id}/reprocess` | Reprocess workflow | 202 |
| `GET` | `/v1/ingest/workflow/{id}/events` | List audit events | 200 |
| `GET` | `/v1/ingest/workflow/{id}/artifacts` | List artifacts | 200 |
| `GET` | `/v1/ingest/workflow/{id}/interactions` | List interactions | 200 |
| `POST` | `/v1/ingest/workflow/{id}/artifacts/{aid}/signed-url` | Get signed download URL | 200 |
| `POST` | `/v1/ingest/pdf-to-markdown` | Convert PDF to Markdown | 200 |
| `POST` | `/v1/ingest/processo` | Start legacy extraction | 202 |
| `GET` | `/v1/ingest/processo/{id}` | Get extraction status | 200 |
| `POST` | `/v1/ingest/processo/{id}/validate` | Validate extraction | 200 |
| `POST` | `/v1/ingest/processo/{id}/phase-analysis` | Start phase analysis | 202 |
| `GET` | `/v1/ingest/processo/{id}/phase-analysis/{aid}` | Get phase analysis status | 200 |
| `POST` | `/v1/ingest/processo/{id}/phase-analysis/{aid}/review` | Review phase analysis | 200 |
| `POST` | `/v1/ingest/processo/{id}/phase-analysis/reprocess` | Reprocess phase analysis | 202 |

:::tip
The `/v1/ingest/processo/full-analysis/*` paths are aliases for `/v1/ingest/workflow/*` and share the same handlers. New integrations should use the `/v1/ingest/workflow/*` paths.
:::
