---
title: MCP Tools Reference
description: Complete reference for all 28 MCP tools — parameters, return types, and usage examples for Claude and ChatGPT integration.
lang: en
sidebar:
  order: 7

---

# MCP Tools Reference

Complete reference for all 28 MCP tools exposed by Valter's Model Context Protocol server.

## Overview

Valter registers 28 tools in its MCP server, available via two transport modes:

| Transport | Client | Protocol |
|---|---|---|
| **stdio** | Claude Desktop, Claude Code | JSON-RPC over stdin/stdout |
| **HTTP/SSE** | ChatGPT (via MCP remote), custom clients | HTTP POST with Server-Sent Events |

Each tool has a name, description, JSON Schema input definition, and an async handler. Tools are rate-limited by `VALTER_MCP_RATE_LIMIT_PER_MINUTE` (default: 60).

Authentication depends on the transport: API key for stdio mode, HMAC for HTTP mode.

## Search Tools

### search_jurisprudence

Free-text jurisprudence retrieval over STJ decisions using hybrid BM25 + semantic search. Start from this tool when you need candidate cases before calling other tools.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | `string` | yes | -- | Natural-language legal query in Portuguese |
| `top_k` | `integer` | no | `10` | Number of results (1-100) |
| `strategy` | `string` | no | `"weighted"` | Scoring: `weighted`, `rrf`, `bm25`, `semantic` |
| `include_kg` | `boolean` | no | `false` | Apply knowledge graph relevance boost |
| `rerank` | `boolean` | no | `false` | Apply cross-encoder reranking |
| `expand_query` | `boolean` | no | `true` | Expand query with LLM-generated legal variants (+500-1500ms) |
| `ministro` | `string` | no | -- | Minister name filter (normalized to uppercase, post-retrieval) |
| `data_inicio` | `string` | no | -- | Start date filter (YYYYMMDD, post-retrieval) |
| `data_fim` | `string` | no | -- | End date filter (YYYYMMDD, post-retrieval) |
| `include_stj_metadata` | `boolean` | no | `false` | Include STJ metadata via extra PostgreSQL lookup |
| `page_size` | `integer` | no | -- | Page size for cursor pagination (1-50, <= top_k) |
| `cursor` | `string` | no | -- | Continuation cursor from previous page |

**Returns:** Ranked decisions with scores, total_found, latency, cache status.

**Maps to:** `POST /v1/retrieve`

### verify_legal_claims

Validate legal references in text against local reference data. Uses regex extraction plus in-memory reference indices.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | yes | -- | Text containing legal references to verify |
| `check_sumulas` | `boolean` | no | `true` | Validate sumulas against STJ/STF reference data |
| `check_ministros` | `boolean` | no | `true` | Validate minister names |
| `check_processos` | `boolean` | no | `true` | Validate CNJ process number format only |
| `check_legislacao` | `boolean` | no | `true` | Extract/classify legislation mentions |

**Returns:** Per-reference verification results and hallucination risk metrics.

**Maps to:** `POST /v1/verify`

### get_irac_analysis

Run heuristic IRAC analysis (regex-based) and load knowledge graph context for a legal document.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `document_id` | `string` | yes | Document ID (obtain via `search_jurisprudence` first) |

**Returns:** IRAC labels (Issue, Rule, Application, Conclusion) plus KG entity counts.

**Maps to:** `POST /v1/context/enrich`

### find_similar_cases

Find cases similar to a given decision using 70% semantic + 30% structural KG overlap.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `document_id` | `string` | yes | -- | Source document ID |
| `top_k` | `integer` | no | `10` | Number of similar cases (1-100) |
| `include_structural` | `boolean` | no | `true` | Include KG structural similarity |

**Returns:** Ranked similar cases with scores. On timeout with structural mode, retries semantic-only.

**Maps to:** `POST /v1/similar_cases`

### get_document_integra

Retrieve the full text (inteiro teor) of a specific STJ decision.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `document_id` | `string` | yes | Document ID (obtain via search first) |

**Returns:** ementa, tese, razoes_decidir, and texto_completo (when available). Check `has_integra` in search results before calling.

### search_features

Structured search over AI-extracted document features with AND-combined filters. `categorias` uses OR/ANY semantics; most scalar filters are exact case-sensitive; `argumento_vencedor`/`argumento_perdedor` use partial case-insensitive matching.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `categorias` | `string[]` | no | -- | Category filter (OR semantics) |
| `dispositivo_norma` | `string` | no | -- | Legal statute filter |
| `resultado` | `string` | no | -- | Outcome filter (exact) |
| `unanimidade` | `boolean` | no | -- | Unanimous decision filter |
| `tipo_decisao` | `string` | no | -- | Decision type (exact) |
| `tipo_recurso` | `string` | no | -- | Appeal type (exact) |
| `ministro_relator` | `string` | no | -- | Reporting minister (exact) |
| `argumento_vencedor` | `string` | no | -- | Winning argument text (ILIKE) |
| `argumento_perdedor` | `string` | no | -- | Losing argument text (ILIKE) |
| `limit` | `integer` | no | `20` | Max results (1-100) |
| `offset` | `integer` | no | `0` | Pagination offset |

**Returns:** Full features plus document summary fields.

**Maps to:** `POST /v1/search/features`

## Graph Tools

### get_divergencias

Find legal criteria with split outcomes, compute `divergence_score = minority / total`, and rank clusters.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `categoria_id` | `string` | no | -- | Exact category ID filter |
| `limit` | `integer` | no | `10` | Max clusters (1-50) |

**Returns:** Divergence clusters ranked by score (balanced splits score highest).

### get_turma_divergences

Analyze split outcomes for criteria matching a legal topic, aggregated by minister.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `tema` | `string` | yes | Topic substring match on criterion names (case-insensitive) |

**Returns:** Per-minister outcome counts for matching criteria.

### get_optimal_argument

Compute argument success rates (criteria, statutes, precedents) for a category and desired outcome.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `categoria_id` | `string` | yes | -- | Legal category ID |
| `resultado_desejado` | `string` | no | `"provido"` | Target outcome |
| `tipo_argumento` | `string` | no | `"all"` | Filter: `criterio`, `dispositivo`, `precedente`, `all` |
| `min_decisions` | `integer` | no | `2` | Minimum supporting decisions (floor: 2) |
| `top_k` | `integer` | no | `10` | Max arguments returned (1-50, effective max ~11) |

**Returns:** Argument chain with success rates per argument type.

### get_optimal_argument_by_ministro

Compare minister-specific success rates vs category averages.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `categoria_id` | `string` | yes | -- | Legal category ID |
| `ministro` | `string` | yes | -- | Minister name (auto-uppercase) |
| `resultado_desejado` | `string` | no | `"provido"` | Target outcome |
| `tipo_argumento` | `string` | no | `"all"` | Argument type filter |
| `min_decisions` | `integer` | no | `1` | Min minister-side decisions |
| `min_category_decisions` | `integer` | no | `2` | Min category support (floor: 2) |
| `top_k` | `integer` | no | `10` | Max arguments (1-50, effective max ~20) |

**Returns:** Delta per argument, recommended_arguments (delta > 0), avoid_arguments (delta < -0.1).

### get_ministro_profile

Load a minister's judicial behavior profile from the knowledge graph.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `ministro` | `string` | yes | -- | Minister name (auto-uppercase) |
| `include_divergencias` | `boolean` | no | `true` | Include peer divergences |
| `include_precedentes` | `boolean` | no | `true` | Include most-cited decisions |
| `limit_criterios` | `integer` | no | `10` | Criteria cap in response (store cap: 10) |

**Returns:** Total decisions, date range, top criteria, outcome distribution, peer divergences, most-cited decisions.

### get_temporal_evolution

Aggregate jurisprudence counts over time for a legal criterion.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `criterio` | `string` | yes | -- | Legal criterion to analyze |
| `granularity` | `string` | no | `"year"` | `year` or `month` |
| `periodo_inicio` | `string` | no | -- | Period start (`YYYY` or `YYYY-MM`) |
| `periodo_fim` | `string` | no | -- | Period end (`YYYY` or `YYYY-MM`) |

**Returns:** Per-period buckets with provido/improvido split and heuristic trend label.

### get_citation_chain

Trace outbound citation edges from a root decision through CITA_PRECEDENTE hops.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `decisao_id` | `string` | yes | -- | Root decision ID |
| `max_depth` | `integer` | no | `3` | Maximum citation hops (1-5) |

**Returns:** Citation nodes/edges and `max_depth_reached` flag. Does not include inbound citations.

### get_pagerank

Rank influential decisions using simplified PageRank: `in_citations * 10 + second_order * 3`.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `integer` | no | `20` | Top-N results (1-100) |
| `min_citations` | `integer` | no | `0` | Minimum direct citations filter (post-processing) |

**Returns:** Ranked decisions with influence score and citation counts.

### get_communities

Return high-overlap decision pairs based on shared legal criteria. Pairwise co-occurrence, not full community detection.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `min_shared` | `integer` | no | `3` | Minimum shared criteria per pair |
| `limit` | `integer` | no | `20` | Max communities (1-100) |

**Returns:** Decision pairs with shared criteria count and names.

### get_structural_similarity

Compare two decisions across five graph dimensions using weighted Jaccard scoring.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `source_id` | `string` | yes | First decision ID |
| `target_id` | `string` | yes | Second decision ID |

**Returns:** Per-dimension stats (criteria, facts, evidence, statutes, precedents) and `weighted_score` in [0, 1].

### get_shortest_path

Find a bidirectional shortest path between two decisions using all relationship types.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `source_id` | `string` | yes | -- | Source decision ID |
| `target_id` | `string` | yes | -- | Target decision ID |
| `max_depth` | `integer` | no | `10` | Max path depth (1-20) |

**Returns:** Path nodes and edges with real relationship types, or `found: false`.

### get_graph_embeddings

Compute 7D structural vectors per decision (criteria/facts/evidence/statutes counts, in/out citations, encoded outcome).

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `decisao_ids` | `string[]` | no | -- | Specific decision IDs (max 500) |
| `limit` | `integer` | no | `100` | Sample size when `decisao_ids` is omitted (1-500) |

**Returns:** Structural embedding vectors per decision. Cached for 1 hour.

## Workflow Tools

### submit_case_pdf_analysis

Start an asynchronous PDF analysis workflow via the Valter HTTP API bridge.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `filename` | `string` | no | `"processo.pdf"` | Filename override |
| `pdf_base64` | `string` | no | -- | PDF in base64 (JSON mode, small files) |
| `local_path` | `string` | no | -- | File path for multipart upload (recommended) |
| `source_system` | `string` | no | `"projudi"` | Source system label |
| `source_mode` | `string` | no | `"chat_attachment"` | Input provenance label |
| `rules_version` | `string` | no | -- | Ruleset version override |
| `min_precedent_score` | `number` | no | -- | Min precedent score (0-100) |
| `max_matches_per_phase` | `integer` | no | -- | Cap per phase (1-10) |
| `reason` | `string` | no | -- | Operator note for audit |
| `strict_infra_required` | `boolean` | no | `true` | Fail on missing infra |

**Returns:** `workflow_id` and initial status for polling.

:::note
Requires `MCP_API_BASE_URL` to be reachable. Provide either `local_path` (multipart, recommended) or `pdf_base64` (JSON mode, better for small payloads).
:::

### get_case_pdf_analysis_status

Poll workflow status for a previously submitted PDF analysis.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Workflow ID from `submit_case_pdf_analysis` |

**Returns:** Current state, progress, and any errors.

### get_case_pdf_analysis_result

Fetch the consolidated result of a completed PDF analysis workflow.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Workflow ID from `submit_case_pdf_analysis` |

**Returns:** Full analysis result, or not-ready/error payload while still running.

### review_case_phase

Submit human approval/rejection for a specific workflow phase.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Workflow ID |
| `phase_label` | `string` | yes | Phase identifier to review |
| `approved` | `boolean` | yes | Approval decision |
| `reviewer` | `string` | no | Reviewer identity for audit |
| `notes` | `string` | no | Review notes |

### review_case_final

Submit final human approval/rejection for the workflow outcome.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Workflow ID |
| `approved` | `boolean` | yes | Final approval decision |
| `reviewer` | `string` | no | Reviewer identity for audit |
| `notes` | `string` | no | Final review notes |

### reprocess_case_analysis

Start a new immutable execution for an existing workflow. Does not mutate prior runs.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Existing workflow ID |
| `rules_version` | `string` | no | Ruleset version override |
| `min_precedent_score` | `number` | no | Min precedent score (0-100) |
| `max_matches_per_phase` | `integer` | no | Cap per phase (1-10) |
| `reason` | `string` | no | Reason for audit trail |
| `strict_infra_required` | `boolean` | no | Override strict infra requirement |

### get_case_workflow_artifacts

List versioned workflow artifacts (PDF, JSON, Markdown, logs).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Workflow ID |

**Returns:** List of artifacts with IDs, types, and metadata.

### get_case_artifact_signed_url

Generate a temporary signed download URL for one workflow artifact.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `workflow_id` | `string` | yes | Workflow ID |
| `artifact_id` | `string` | yes | Artifact ID from `get_case_workflow_artifacts` |

**Returns:** Signed URL with time-limited access.

## Memory Tools

### remember

Store or update a session-scoped key-value memory in PostgreSQL with TTL.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `session_id` | `string` | yes | -- | Session identifier |
| `key` | `string` | yes | -- | Memory key (upsert by session_id + key) |
| `value` | `string` | yes | -- | Memory value payload |
| `ttl_seconds` | `integer` | no | `86400` | TTL in seconds (60 to 2,592,000) |

### recall

Retrieve a session-scoped memory by key.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `session_id` | `string` | yes | Session identifier |
| `key` | `string` | yes | Memory key to retrieve |

**Returns:** `found: true` with the stored value, or `found: false` with `value: null` when the key is missing or expired.

## Tool Invocation

### stdio mode (Claude Desktop / Claude Code)

1. Client sends a `tool_use` message with tool name and parameters.
2. Valter's MCP server processes the request via the registered handler.
3. Server returns a `tool_result` with the response payload.

### HTTP/SSE mode (ChatGPT / remote clients)

1. Client calls the MCP remote endpoint with tool name and parameters.
2. Valter bridges the request via httpx to the REST API.
3. REST API response is formatted and returned as MCP tool result.

### Error handling

All tools return structured error responses with `trace_id` for log correlation. Common error conditions:

| Error | Description |
|---|---|
| Backend timeout | Neo4j, Qdrant, or PostgreSQL query exceeds time limit |
| Service unavailable | Backend service unreachable |
| Validation error | Invalid or missing required parameters |
| Not found | Referenced document or workflow does not exist |

## Tool Summary

| Domain | Tool | Required params |
|---|---|---|
| Search | `search_jurisprudence` | `query` |
| Search | `verify_legal_claims` | `text` |
| Search | `get_irac_analysis` | `document_id` |
| Search | `find_similar_cases` | `document_id` |
| Search | `get_document_integra` | `document_id` |
| Search | `search_features` | (at least one filter) |
| Graph | `get_divergencias` | -- |
| Graph | `get_turma_divergences` | `tema` |
| Graph | `get_optimal_argument` | `categoria_id` |
| Graph | `get_optimal_argument_by_ministro` | `categoria_id`, `ministro` |
| Graph | `get_ministro_profile` | `ministro` |
| Graph | `get_temporal_evolution` | `criterio` |
| Graph | `get_citation_chain` | `decisao_id` |
| Graph | `get_pagerank` | -- |
| Graph | `get_communities` | -- |
| Graph | `get_structural_similarity` | `source_id`, `target_id` |
| Graph | `get_shortest_path` | `source_id`, `target_id` |
| Graph | `get_graph_embeddings` | -- |
| Workflow | `submit_case_pdf_analysis` | -- |
| Workflow | `get_case_pdf_analysis_status` | `workflow_id` |
| Workflow | `get_case_pdf_analysis_result` | `workflow_id` |
| Workflow | `review_case_phase` | `workflow_id`, `phase_label`, `approved` |
| Workflow | `review_case_final` | `workflow_id`, `approved` |
| Workflow | `reprocess_case_analysis` | `workflow_id` |
| Workflow | `get_case_workflow_artifacts` | `workflow_id` |
| Workflow | `get_case_artifact_signed_url` | `workflow_id`, `artifact_id` |
| Memory | `remember` | `session_id`, `key`, `value` |
| Memory | `recall` | `session_id`, `key` |
