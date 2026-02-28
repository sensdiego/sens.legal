---
title: Ingestion Workflow
description: Full case analysis pipeline from PDF upload through PROJUDI extraction, phase analysis, jurisprudence matching, and human review.
sidebar:
  order: 5
lang: en
---

# Ingestion Workflow

Valter's ingestion workflow transforms a raw case PDF into a structured legal analysis with phase identification, jurisprudence matching, and human-reviewed suggestions. The workflow is exposed through 17 endpoints under `/v1/ingest/*` and is also accessible via 8 MCP tools.

## Overview

The workflow operates as an async pipeline backed by an ARQ worker (Redis job queue) with a state machine that enforces valid transitions and generates auditable events. Each stage produces intermediate artifacts stored locally or in Cloudflare R2.

The pipeline follows this high-level flow:

```
PDF Upload -> PROJUDI Extraction -> Phase Analysis -> Jurisprudence Matching
    -> Suggestions -> Human Review -> Artifacts
```

Human review is required at two checkpoints: after individual phase analysis and as a final approval of the complete analysis. Rejected phases can trigger immutable reprocessing -- new versions are created while prior executions are preserved.

## Pipeline Stages

### 1. PDF Upload & Extraction

The workflow starts with a PDF upload via `POST /v1/ingest/workflow`. The PROJUDI pipeline (`core/projudi_pipeline.py`) handles first-instance process extraction:

- **Text extraction** using pdfplumber/pypdf, with optional OCR fallback via pytesseract
- **Movement detection** via regex patterns that identify dated process movements (e.g., `Ref. mov. 1.2`, `Data: 15/02/2024 | Movimentacao: Petição Inicial`)
- **Section segmentation** into labeled sections: fatos, fundamentos_processuais, merito, pedidos, decisao, anexo

Each extracted document is represented as a `ProcessDocument` with:

```python
# From core/projudi_pipeline.py
@dataclass(slots=True)
class ProcessDocument:
    document_id: str
    tipo_documento: str
    tipo_subdocumento: str | None
    movement_number: str | None
    movement_datetime: str | None
    page_start: int
    page_end: int
    text_excerpt: str
    key_sections: list[KeySection]
    confidence: float
    confidence_signals: dict[str, float]
    confidence_explanation: str
    needs_review: bool | None
```

Maximum upload size is controlled by `VALTER_MAX_UPLOAD_MB` (default: 100).

### 2. Classification & Confidence Scoring

After extraction, each document segment is automatically classified:

- **Document type** identification (peticao inicial, contestacao, decisao, sentenca, etc.)
- **Confidence scoring** per extracted field, with individual signal breakdowns
- **Sibling inheritance** shares metadata across related documents in the same case
- **Type rules** evaluated by `ProjudiTypeRuleEvaluator` for deterministic classification

Documents with confidence below the threshold are flagged with `needs_review: true`.

### 3. Phase Analysis

The `DeterministicPhaseInterpreter` (`core/phase_interpreter.py`) maps extracted documents to procedural phases using a rules-based state machine. Seven phases are tracked in order:

| Phase | Label |
|-------|-------|
| 1 | Postulacao Inicial (initial pleading) |
| 2 | Resposta do Reu (defendant's response) |
| 3 | Saneamento e Organizacao (procedural cleanup) |
| 4 | Instrucao Probatoria (evidence gathering) |
| 5 | Sentenca de Primeiro Grau (first-instance judgment) |
| 6 | Cumprimento/Execucao (enforcement) |
| 7 | Transicao Recursal (appeal transition) |

Five core modules handle phase analysis:

| Module | Purpose |
|--------|---------|
| `phase_interpreter.py` | Deterministic state machine for phase identification |
| `phase_matcher.py` | Matches documents to phases based on content signals |
| `phase_rules.py` | Rule definitions and evaluator (`PhaseRuleEvaluator`) |
| `phase_recommender.py` | Generates recommendations per phase |
| `phase_jurisprudence.py` | Finds relevant precedents per phase |

The rules version is configurable via `VALTER_PHASE_RULES_VERSION`.

### 4. Jurisprudence Matching

For each identified phase, the system finds relevant STJ precedents using the same hybrid search pipeline as `POST /v1/retrieve`. Matching is filtered by phase-relevant criteria.

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `VALTER_PHASE_MIN_PRECEDENT_SCORE` | 55.0 | Minimum score threshold for a precedent match |
| `VALTER_PHASE_MAX_MATCHES_PER_PHASE` | 5 | Maximum precedents returned per phase |

### 5. Human Review

The workflow pauses at two review checkpoints:

**Phase review** (`POST /v1/ingest/workflow/{id}/review`): The operator approves or rejects the analysis for each individual phase. Each review records:

- `approved` (boolean)
- `reviewer` identity for audit trail
- `notes` for context

**Final review**: After all phases are reviewed, the operator approves or rejects the complete analysis.

Rejections do not delete prior work. If reprocessing is needed, `reprocess_case_analysis` creates a new immutable execution while preserving all prior versions and their review history.

### 6. Artifact Generation

Completed workflows produce versioned artifacts:

- **JSONL manifest** of analysis results with all phases, precedents, and review decisions
- **PDF reports** (when configured)
- **Logs** from each processing stage

Artifacts are stored using a dual-backend strategy:

| Backend | Status | Purpose |
|---------|--------|---------|
| Local filesystem | Active | Default storage |
| Cloudflare R2 | Ready, canary at 0% | Cloud storage with deterministic canary rollout |

Signed download URLs are generated via `POST /v1/ingest/workflow/{id}/artifacts/{aid}/signed-url`.

## State Machine

The `WorkflowStateMachine` (`core/workflow_state_machine.py`) enforces valid transitions through the workflow. Invalid transitions raise `InvalidWorkflowTransitionError`.

### States

| State | Description |
|-------|-------------|
| `queued_extraction` | Initial state, waiting for extraction job |
| `processing_extraction` | PDF extraction in progress |
| `queued_phase_analysis` | Extraction complete, waiting for phase analysis |
| `processing_phase_analysis` | Phase analysis in progress |
| `awaiting_phase_reviews` | Waiting for human review of individual phases |
| `awaiting_final_review` | Phase reviews complete, waiting for final approval |
| `needs_user_action` | Terminal state: requires operator intervention |
| `completed` | Terminal state: workflow finished successfully |
| `failed` | Terminal state: workflow encountered an unrecoverable error |

### Transitions

```
queued_extraction --[enqueue_extraction_job]--> processing_extraction
processing_extraction --[extraction_completed]--> queued_phase_analysis
queued_phase_analysis --[enqueue_phase_analysis_job]--> processing_phase_analysis
processing_phase_analysis --[phase_analysis_completed]--> awaiting_phase_reviews
                                                      --> awaiting_final_review
                                                      --> completed
```

:::note
Terminal failure states (`failed`, `needs_user_action`) are not reachable through the state machine's `next_state()` method. They are applied exclusively via `FullCaseWorkflowOrchestrator.mark_failed()`, which handles persistence and event emission for error scenarios. This is an intentional architectural separation: the machine covers the happy path, while `mark_failed()` covers all error/termination paths.
:::

Each transition generates an audit event persisted in JSONL format.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `VALTER_INGEST_JOB_TIMEOUT_SECONDS` | 1800 | Timeout for individual ingest jobs |
| `VALTER_INGEST_WORKER_CONCURRENCY` | 2 | ARQ worker concurrency |
| `VALTER_WORKFLOW_TIMEOUT_SECONDS` | 2400 | Overall workflow timeout |
| `VALTER_WORKFLOW_MAX_RETRIES` | 3 | Maximum retry attempts |
| `VALTER_WORKFLOW_STRICT_INFRA_REQUIRED` | true | Fail when required infra dependencies are unavailable |
| `VALTER_PHASE_RULES_VERSION` | `phase-rules-v1` | Active ruleset version |
| `VALTER_MAX_UPLOAD_MB` | 100 | Maximum PDF upload size |
