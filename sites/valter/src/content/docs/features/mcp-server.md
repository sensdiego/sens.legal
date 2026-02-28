---
title: MCP Server
description: 28 Model Context Protocol tools enabling Claude and ChatGPT to query legal knowledge, analyze cases, and compose arguments.
sidebar:
  order: 4
lang: en
---

# MCP Server

Valter exposes 28 MCP tools via two transport modes -- stdio for Claude Desktop/Code and HTTP/SSE for ChatGPT -- enabling any MCP-compatible LLM to act as a legal research assistant backed by real jurisprudence data.

## What is MCP?

Model Context Protocol (MCP) is an open standard for structured communication between LLMs and external tools. Instead of building custom API integrations for each LLM provider, MCP provides a single interface that any compatible client can consume.

For Valter, this means that Claude Desktop, Claude Code, ChatGPT, and any future MCP client can all use the same 28 tools without separate integration work.

## Transport Modes

### stdio (Claude Desktop / Claude Code)

The stdio transport runs as a subprocess that communicates via JSON-RPC over standard input/output. No network configuration is needed.

```bash
# Start the MCP server in stdio mode
python -m valter.mcp
```

Logs are directed to stderr so they do not interfere with the JSON-RPC protocol on stdout.

### HTTP/SSE (ChatGPT and Remote Clients)

The remote transport runs a Starlette ASGI application that accepts Streamable HTTP requests with HMAC authentication, deployed alongside the REST API on Railway.

```bash
# Start the remote MCP server on port 8001
make mcp-remote
```

Architecture: MCP remote server (port 8001) bridges to the REST API (port 8000) via httpx. The remote server handles authentication, rate limiting, and MCP protocol framing, while the API handles actual data operations.

The runtime configuration is defined in `MCPRemoteRuntimeConfig`:

```python
# From mcp/remote_server.py
@dataclass(frozen=True)
class MCPRemoteRuntimeConfig:
    transport: str          # "stdio" or "streamable-http"
    host: str
    port: int
    path: str
    auth_mode: str          # "none" or "api_key"
    api_keys: tuple[str, ...]
    rate_limit_per_minute: int  # default 60
    # ...
```

## Tool Categories

### Knowledge Tools (7 tools)

These tools cover search, verification, enrichment, and document retrieval.

| Tool | Description |
|------|-------------|
| `search_jurisprudence` | Hybrid BM25 + semantic search with optional KG boost, reranking, query expansion, and cursor pagination. Start here when looking for candidate cases. |
| `verify_legal_claims` | Validates sumulas, minister names, process numbers, and legislation references against reference data. Returns hallucination risk metrics. |
| `get_irac_analysis` | Heuristic IRAC analysis (regex-based) and knowledge graph context for one document. Requires a known document_id. |
| `find_similar_cases` | Finds similar cases using 70% semantic + 30% structural KG overlap. Falls back to semantic-only on timeout. |
| `get_document_integra` | Retrieves the full text (inteiro teor) of a specific STJ decision. Check `has_integra` in search results before calling. |
| `remember` | Stores a session-scoped key-value memory in PostgreSQL with configurable TTL (60s to 30 days). |
| `recall` | Retrieves a previously stored session memory by key. Returns `found=false` when missing or expired. |

### Graph Tools (10 tools)

These tools query the Neo4j knowledge graph for analytical insights.

| Tool | Description |
|------|-------------|
| `get_divergencias` | Finds criteria with split outcomes (provido vs improvido), ranked by divergence score. |
| `get_turma_divergences` | Analyzes split outcomes by minister for a topic substring. |
| `get_optimal_argument` | Computes argument success rates (criteria, statutes, precedents) for a category and desired outcome. |
| `get_optimal_argument_by_ministro` | Compares minister-specific success rates vs category averages, with delta and recommendations. |
| `get_ministro_profile` | Comprehensive minister profile: decisions, criteria, outcome distribution, peer divergences. |
| `get_temporal_evolution` | Aggregates jurisprudence counts over time with provido/improvido split and trend label. |
| `search_features` | Structured search over 21 AI-extracted document features with 9 combinable filters. |
| `get_citation_chain` | Traces outbound citations from a root decision up to 5 hops. |
| `get_pagerank` | Ranks the most influential decisions by citation-based scoring. |
| `get_communities` | Returns high-overlap decision pairs based on shared legal criteria. |

### Structural Analysis Tools (3 tools)

| Tool | Description |
|------|-------------|
| `get_structural_similarity` | Compares two decisions across 5 graph dimensions (criteria, facts, evidence, statutes, precedents) with weighted Jaccard scoring. |
| `get_shortest_path` | Finds bidirectional shortest path between two decisions using all relationship types. |
| `get_graph_embeddings` | Computes 7D structural vectors per decision (criteria/facts/evidence/statutes counts, citations, encoded outcome). |

### Workflow Tools (8 tools)

These tools manage the full case analysis workflow from PDF submission through human review.

| Tool | Description |
|------|-------------|
| `submit_case_pdf_analysis` | Starts an async PDF analysis workflow. Accepts local_path (multipart) or pdf_base64 (JSON). |
| `get_case_pdf_analysis_status` | Polls workflow status for a previously submitted analysis. |
| `get_case_pdf_analysis_result` | Fetches the consolidated result of a completed workflow. |
| `review_case_phase` | Submits human approval/rejection for a specific workflow phase. |
| `review_case_final` | Submits final human approval/rejection for the workflow outcome. |
| `reprocess_case_analysis` | Creates a new immutable execution for an existing workflow. Prior executions are preserved. |
| `get_case_workflow_artifacts` | Lists versioned workflow artifacts (PDF, JSON, markdown, logs). |
| `get_case_artifact_signed_url` | Generates a temporary signed download URL for one artifact. |

## Authentication

### stdio Mode

No authentication is required for the stdio transport. The server runs as a local subprocess with the same permissions as the calling process.

### Remote Mode (HTTP/SSE)

The remote server supports API key authentication. Keys are configured via `VALTER_MCP_SERVER_API_KEYS` (comma-separated list). Authentication failures are tracked by the `valter_mcp_auth_failures_total` Prometheus counter.

The runtime config also supports a maximum auth failure rate (`auth_max_failures_per_minute`, default 10) to defend against brute-force attempts.

## Rate Limiting

MCP requests are rate-limited independently from the REST API. The limit is configurable via `VALTER_MCP_RATE_LIMIT_PER_MINUTE` (default: 60 requests per minute per API key).

Rate limit state is stored in Redis using a sliding window. Blocked requests are counted by the `valter_mcp_rate_limit_blocks_total` Prometheus counter. The `/metrics` endpoint for the MCP remote server is IP-restricted via `VALTER_METRICS_IP_ALLOWLIST`.

## Setup Guide

### Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "env": {
        "VALTER_DATABASE_URL": "postgresql://...",
        "VALTER_QDRANT_URL": "http://localhost:6333",
        "VALTER_NEO4J_URI": "bolt://localhost:7687"
      }
    }
  }
}
```

### Claude Code

Add the following to your `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"]
    }
  }
}
```

### ChatGPT (Remote)

Configure the remote server URL in the ChatGPT custom GPT settings, pointing to the deployed MCP remote endpoint (e.g., `https://valter.legal:8001/mcp`). The HMAC authentication key must match the configured `VALTER_MCP_SERVER_API_KEYS`.
