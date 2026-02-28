---
title: Legal Reasoning Chain
description: Planned v1.2 flagship feature -- server-side orchestrator composing verified legal arguments from the knowledge graph with provenance tracking.
sidebar:
  order: 7
lang: en
---

# Legal Reasoning Chain

:::caution
This is a planned feature for v1.2. The design is finalized and all prerequisite capabilities are implemented, but the orchestrator itself has not been built yet. Prerequisites: v1.1 (circuit breaker, connection pools) must be completed first, since the reasoning chain executes multiple concurrent graph queries.
:::

The Legal Reasoning Chain is the feature that transforms Valter from a search backend into a legal reasoning engine. Instead of returning a list of similar cases, it composes a verified legal argument with provenance -- every claim traceable to a specific node in the knowledge graph.

## Vision

No competitor in the Brazilian legal tech space does argument composition from a knowledge graph. Existing tools either return keyword-matched case lists or generate unverified text. The reasoning chain closes that gap by orchestrating 7 existing Valter capabilities into a single response that an attorney can cite with confidence.

The orchestrator will live at `core/reasoning_chain.py` and requires no new graph queries -- it chains existing endpoints that are already production-tested.

## Input / Output

### Input

```json
{
  "fatos": "Passageiro teve voo cancelado sem aviso previo, ficou 18h no aeroporto sem assistencia",
  "pergunta": "Cabe indenizacao por dano moral por cancelamento de voo?",
  "ministro": "NANCY ANDRIGHI",
  "turma": "3a Turma"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `fatos` | Yes | Case facts in natural language |
| `pergunta` | Yes | Legal question to answer |
| `ministro` | No | Filter argument composition for a specific minister |
| `turma` | No | Filter by court division |

### Output

```json
{
  "argument_steps": [
    {
      "fact": "cancelamento sem aviso previo",
      "criterion": "dano moral em transporte aereo",
      "success_rate": 0.87,
      "dispositivo": "CDC art. 14",
      "supporting_decisions": ["REsp 1.584.465/SP", "REsp 1.734.946/RJ"]
    }
  ],
  "counter_arguments": [
    {
      "criterion": "excludente de responsabilidade por caso fortuito",
      "dissenting_ministers": ["MINISTRO X"],
      "divergence_score": 0.35
    }
  ],
  "temporal_strength": [
    {
      "criterion": "dano moral em transporte aereo",
      "trend": "growing",
      "recent_decisions_count": 42
    }
  ],
  "anchor_decision": {
    "processo": "REsp 1.584.465/SP",
    "ministro": "NANCY ANDRIGHI",
    "ementa": "...",
    "kg_score": 0.92,
    "citation_count": 15,
    "verified": true
  },
  "overall_strength": 0.83,
  "provenance": [
    {
      "claim_index": 0,
      "graph_node_id": "criterio_dano_moral_transporte",
      "graph_node_type": "Criterio",
      "source_decision": "decisao_REsp_1584465"
    }
  ]
}
```

The `provenance` array is the critical differentiator: every claim in the argument can be traced back to a specific node in the knowledge graph, making the output auditable.

## Orchestrated Capabilities

The reasoning chain does not introduce new queries. It orchestrates existing, production-tested endpoints:

| Reasoning Component | Existing Endpoint | What It Provides |
|---------------------|-------------------|-----------------|
| Fact to Criterion with success rate | `get_optimal_argument` | Maps facts to criteria and computes success rates |
| Criterion to Legal statute | `get_optimal_argument` | Chain includes dispositivos (statutes) |
| Counter-argument detection | `get_divergencias` + `get_ministro_profile` | Finds active disagreements on the criteria used |
| Minister delta vs category | `get_optimal_argument_by_ministro` | Shows how a specific minister diverges from average |
| Temporal trend | `get_temporal_evolution` | Whether the criterion is gaining or losing traction |
| Verified anchor decision | `search_jurisprudence` + `verify_legal_claims` | The strongest decision to cite, verified against reference data |
| Structural similarity | `find_similar_cases` | Cases with similar graph topology |

## Planned Endpoints

| Verb | Route | Description |
|------|-------|-------------|
| POST | `/v1/reasoning-chain` | REST API endpoint for argument composition |
| MCP | `compose_legal_argument` | MCP tool for Claude Desktop/Code and ChatGPT |

## Completion Criteria

The v1.2 milestone defines clear acceptance criteria:

- `POST /v1/reasoning-chain` returns an argument with at least 3 verified steps
- Every claim in the output has a `provenance` entry linking to a graph node
- MCP tool `compose_legal_argument` is functional in Claude Desktop
- Latency p95 for the complete chain is under 5 seconds
- A spike of 50 TRF decisions is executed and documented to assess multi-tribunal complexity

## Open Decision: Sync vs Async

The execution model for the reasoning chain is not yet decided:

| Option | Pros | Cons |
|--------|------|------|
| **Synchronous** | Simple implementation, good for target latency < 5s | Blocks the request thread; fails if any sub-query is slow |
| **Async with polling** | Tolerates > 10s execution; client polls for result | Adds complexity (job queue, status endpoint, client-side polling) |
| **Streaming via SSE** | Real-time partial results; best UX | Most complex; requires SSE support in all consumers |

The decision depends on measured latency of the orchestrated queries once circuit breakers and connection pools (v1.1) are in place.
