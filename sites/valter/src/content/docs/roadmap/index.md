---
title: Roadmap
description: Product vision, strategic direction, and competitive positioning of Valter as a legal reasoning engine.
lang: en
sidebar:
  order: 1

---

# Roadmap

Valter's evolution from legal search backend to legal reasoning engine — strategic vision, competitive positioning, and risk-informed planning.

## Product Vision

Valter will be the **legal reasoning engine** for LLMs and lawyers. The core differentiator is not search — it is the ability to **compose verified legal arguments** from a knowledge graph containing ~28,000 STJ decisions and 207,000 relations.

The platform combines six capabilities that do not exist together in any other legal tech product:

1. **Anti-hallucination verification** against real tribunal data
2. **Temporal intelligence** — weighting by recency, trend detection across jurisprudence
3. **Judge profiling** — delta analysis by minister, active divergence tracking
4. **Knowledge graph** — decisions connected by criteria, legal provisions, and precedents
5. **MCP-native architecture** — any LLM (Claude, ChatGPT) can use Valter as a tool
6. **Argument composition** — assembling multi-step legal reasoning chains from graph patterns

The v1.x series stabilizes production, adds resilience, and launches the Legal Reasoning Chain (the flagship feature). The v2.x series expands to multiple tribunals, integrates sister products (Leci, Juca), and establishes public presence via the ChatGPT App Directory.

## Competitive Positioning

| Dimension | Others | Valter |
|---|---|---|
| **Search** | Keyword search | Hybrid search with KG boost and cross-encoder reranking |
| **Results** | List of similar cases | Argument composition from success patterns in graph |
| **Citations** | "The jurisprudence says..." | "REsp X says Y, verified, cited Z times in graph" |
| **Weighting** | Treat all decisions equally | Temporal intelligence — weights by recency, trend detection |
| **Judges** | Ignore who judges | Judge profiling — delta by minister, active divergences |
| **Accuracy** | Hallucinate references | Anti-hallucination verification against real tribunal data |
| **Integration** | Closed systems | MCP-native — any LLM can use as tool |
| **Data model** | Documents as text blobs | Knowledge graph — decisions connected by criteria, provisions, precedents |

## Current State

As of February 2026, Valter has:

- **33 implemented features** spanning search, graph analytics, MCP server, ingestion, verification, observability, and CI/CD
- **3 features in progress**: App Directory preparation (~70%), R2 canary storage (~90%), missing integras download flow (~80%)
- **18 planned features** distributed across v1.0 through v1.2
- **11 ideas** under evaluation for v2.0+

The system indexes ~23,400 STJ decisions in PostgreSQL, with ~3,700 vectorized in Qdrant and ~28,000 nodes with ~207,000 relationships in Neo4j.

:::note
See [Milestones](./milestones) for the detailed breakdown of each version, and [Changelog](./changelog) for the history of shipped features.
:::

## Premortem Analysis

Eight failure scenarios were analyzed to identify risks before they materialize. Each scenario maps to a specific milestone that addresses it.

| # | Failure Scenario | False Premise | Mitigation | Milestone |
|---|---|---|---|---|
| 1 | Redis goes down, all requests blocked | "Redis will always be up" | Fail-open rate limiter for valid API keys | v1.0 |
| 2 | Neo4j silently returns stale data | "Graph data is always fresh" | Health check endpoint, staleness alerts | v1.0 |
| 3 | Data stagnation — corpus stops growing | "23K docs are enough" | ARQ cron ingestion, indexation gap closure | v1.0 / v1.1 |
| 4 | Neo4j query hangs, blocks entire request | "Neo4j always responds in time" | Circuit breaker with 5s timeout | v1.1 |
| 5 | Multi-tribunal is much harder than expected | "Just add more data" | TRF spike in v1.2 before committing to v2.0 | v1.2 |
| 6 | App Directory yields low ROI | "ChatGPT users will find us" | Demoted from v1.2 to v2.1, focus on core product | v2.1 |
| 7 | Single developer becomes unavailable | "Diego can always fix things" | Absence runbook, documented ops procedures | v1.0 |
| 8 | Docker compose issues in new environments | "It works on my machine" | Documented setup, pinned versions, CI validation | v1.0 |

## Pending Decisions

Nine architectural and product decisions remain open. Each will be resolved before or during its target milestone.

| # | Decision | Options Under Consideration | Target |
|---|---|---|---|
| 1 | R2 canary activation timing | Activate in v1.0 vs wait for more traffic data | v1.0 |
| 2 | Legacy route sunset | Immediate removal vs deprecation period with warnings | v1.0 |
| 3 | Privacy policy / terms of use authorship | Write in-house vs engage legal counsel | v1.0 |
| 4 | Leci integration model | Embedded library vs API calls vs shared database | v2.0 |
| 5 | Juca integration level | Read-only consumer vs bidirectional sync | v2.0 |
| 6 | Multi-tribunal starting point | TRF-4 (most data) vs TST (simpler schema) vs STF (highest impact) | v2.0 |
| 7 | Doutrina (legal doctrine) scope | Index doctrine texts vs link to external sources only | v2.0+ |
| 8 | Embedding model migration | Keep Legal-BERTimbau 768d vs upgrade to 1024d model | v1.1 |
| 9 | Reasoning chain sync vs async | Synchronous endpoint vs background job with polling | v1.2 |
