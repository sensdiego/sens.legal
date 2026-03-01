---
title: Roadmap
description: Douto's product roadmap — vision, current priorities, planned milestones, and top risks.
lang: en
sidebar:
  order: 1
---

# Roadmap

Where Douto is going -- from pipeline stabilization to full sens.legal integration.

:::note[Draft status]
This roadmap is inferred from the codebase, commits, AGENTS.md, and ecosystem context. It has not been formally validated by the project owner. Priorities may change. See Decision D07 in [Milestones](/docs/roadmap/milestones/).
:::

## Product Vision

Douto will be the **doctrine knowledge backend** of the sens.legal ecosystem. When mature, it will:

- Process legal textbooks autonomously (PDF to chunks to embeddings)
- Maintain a navigable skill graph organized by legal domain
- Expose doctrine knowledge via MCP/API for Valter, Juca, and Leci to query in real time
- Support briefings, risk analysis, and legal document drafting with authoritative doctrinal references

The current corpus contains **~50 books** and **~31,500 chunks** across civil law, civil procedure, and business law.

## Current Status

| Category | Count | Details |
|----------|-------|---------|
| Implemented | 18 | F01-F18: full pipeline (PDF to search), skill graph, 4 MOCs, idempotency, logging, dry-run |
| In progress | 3 | F19 (MOC Consumidor), F20 (env var standardization), F21 (atomic notes) |
| Planned | 11 | F22-F32: path fixes, utils.py, tests, MOCs, README, Makefile, linting, MCP |
| Ideas | 10 | F33-F42: Neo4j integration, cross-references, Docker, CI/CD, eval set |
| Pending decisions | 7 | D01-D07: integration protocol, repo vs. module, tracking, model choice |
| Test coverage | 0% | No test framework, no tests |

### What Works Today

- Complete pipeline: `process_books.py` -> `rechunk_v3.py` -> `enrich_chunks.py` -> `embed_doutrina.py` -> `search_doutrina_v2.py`
- Hybrid search (semantic + BM25) with metadata filters
- Interactive CLI search with `/area`, `/filtro`, `/verbose` commands
- 4 populated MOCs: Civil (35 books), Processual (8 books), Empresarial (7 books), Consumidor (placeholder)
- Structured enrichment metadata: instituto, tipo_conteudo, ramo, fase, fontes_normativas

### What Doesn't Work

- Pipeline only runs on the creator's machine (hardcoded paths)
- No automated tests
- No real-time integration with sens.legal ecosystem (JSON files only)
- 4 of 8 MOCs do not exist as files (Tributario, Constitucional, Compliance, Sucessoes)
- `enrich_prompt.md` is missing from the repository (cannot enrich new chunks)
- Unpinned dependency versions

## Milestone Overview

| Milestone | Name | Key Deliverable | Status |
|-----------|------|-----------------|--------|
| **v0.2** | Pipeline Estavel | Runs on any machine | Planned |
| **v0.2.5** | Data Validation | Metadata quality gate (>= 85%) | Proposed (post-PREMORTEM) |
| **v0.3** | Quality & Coverage | Tests, MOCs, docs, linting | Planned |
| **v0.3.5** | Doctrine Synthesis | Synthesis Engine | Proposed |
| **v0.4** | sens.legal Integration | MCP server | Planned |
| **v0.5** | Knowledge Graph & Automation | Atomic notes, eval set, CI/CD | Planned |
| **v0.6** | Legal Ontology | Concept graph | Proposed |
| **v1.0** | Integrated Platform | Full ecosystem integration | Planned |

See [Milestones](/docs/roadmap/milestones/) for detailed breakdown of each.

### Milestone Sequence

```
v0.2 Pipeline Estavel
  |
  v
v0.2.5 Data Validation  <-- Proposed checkpoint
  |  - Validate 200 chunks
  |  - Create eval set
  |  - Schema validation
  |  - Gate: accuracy >= 85%?
  v
v0.3 Quality & Coverage (tests, MOCs, docs)
  |
  v
v0.3.5 Doctrine Synthesis (if quality gate passed)
  |
  v
v0.4 sens.legal Integration (MCP server)
  |
  v
v0.5 Knowledge Graph & Automation
  |
  v
v0.6 Legal Ontology (proposed)
  |
  v
v1.0 Integrated Platform
```

## Pending Decisions

Seven architectural decisions remain unresolved. Two of them (D01 and D02) block the v0.4 milestone entirely.

| # | Question | Impact | Blocks |
|---|----------|--------|--------|
| **D01** | Integration protocol: MCP stdio, MCP HTTP/SSE, REST, or keep JSON files? | Defines long-term architecture | v0.4 |
| **D02** | Independent service or Valter module? | Douto's identity as a service | v0.4 |
| D03 | Atomic notes: auto-generated or manually curated? | Volume vs. quality trade-off | v0.5 |
| D04 | Issue tracking: Linear (SEN-XXX) or GitHub Issues? | Contribution workflow | -- |
| D05 | Doctrine schema in Neo4j? | Knowledge graph integration | v1.0 |
| D06 | Keep MiniMax M2.5 or migrate enrichment model? | Cost, quality, dependency | -- |
| D07 | Are the inferred priorities correct? | Entire roadmap may reorder | All |

See [Architecture Decisions](/docs/architecture/decisions/) for detailed analysis of each option.

## Risk Summary

The top 5 risks from the PREMORTEM analysis, ordered by likelihood:

### 1. Death by Abandonment

**Probability: High** | Solo developer maintains 5 repos (Valter, Juca, Leci, Joseph, Douto). Valter and Juca are customer-facing and likely take priority. Douto may go 6+ months without commits, losing context and momentum.

### 2. Illusion of Quality

**Probability: High** | Enrichment metadata has never been validated against human judgment. If 30-40% of `instituto` and `tipo_conteudo` classifications are wrong, filtered search returns garbage and any synthesis features amplify errors. No eval set exists to measure this.

### 3. Irreproducible Foundation

**Probability: High** | `enrich_prompt.md` is missing. Dependency versions are unpinned. If the corpus needs reprocessing (new model, bug fix, new domain), the result will differ from the original. Two inconsistent datasets with no way to return to the previous state.

### 4. Redundancy with Valter

**Probability: Medium** | If Valter needs doctrine before v0.4, the team may build `valter/stores/doutrina/` with Qdrant (already available). Once Valter has a "good enough" doctrine module, integrating Douto becomes harder to justify than rewriting.

### 5. Zero Scalability

**Probability: Certain** | Embeddings stored as flat JSON (~2 GB for 31,500 chunks). BM25 recalculates document frequencies per query. Load time is seconds. Adding 50 more books doubles everything. Unusable as an MCP tool with this latency.

For the full risk analysis including 14 technical risks, 5 product risks, 4 execution risks, and 7 edge cases, see `PREMORTEM.md` in the repository root.

## Feature Backlog

### Implemented (F01-F18)

| # | Feature | Script/File |
|---|---------|------------|
| F01 | PDF extraction via LlamaParse | `process_books.py` |
| F02 | Intelligent legal chunking v3 | `rechunk_v3.py` |
| F03 | Chunk enrichment via MiniMax M2.5 | `enrich_chunks.py` |
| F04 | Embedding generation (Legal-BERTimbau 768-dim) | `embed_doutrina.py` |
| F05 | Hybrid search (semantic + BM25 + filters) | `search_doutrina_v2.py` |
| F06 | Multi-area search support | `search_doutrina_v2.py` |
| F07 | Interactive CLI search | `search_doutrina_v2.py` |
| F08 | Skill graph INDEX | `INDEX_DOUTO.md` |
| F09 | MOC Direito Civil (35 books) | `MOC_CIVIL.md` |
| F10 | MOC Processual Civil (8 books) | `MOC_PROCESSUAL.md` |
| F11 | MOC Empresarial (7 books) | `MOC_EMPRESARIAL.md` |
| F12 | Pipeline idempotency | All scripts |
| F13 | Structured logging (JSONL) | All scripts |
| F14 | Dry-run in all scripts | All scripts |
| F15 | Standardized YAML frontmatter | All scripts |
| F16 | AGENTS.md | `AGENTS.md` |
| F17 | CLAUDE.md | `CLAUDE.md` |
| F18 | PROJECT_MAP.md | `PROJECT_MAP.md` |

### Planned (F22-F32)

See [Milestones](/docs/roadmap/milestones/) for which features belong to which milestone.

| # | Feature | Priority | Milestone |
|---|---------|----------|-----------|
| F22 | Standardize paths (eliminate hardcodes) | P0 | v0.2 |
| F23 | Extract `pipeline/utils.py` | P1 | v0.2 |
| F24 | Pin dependency versions | P1 | v0.2 |
| F25 | Create missing MOCs (4 MOCs) | P1 | v0.3 |
| F26 | Tests for `rechunk_v3.py` | P1 | v0.3 |
| F27 | Tests for utility functions | P2 | v0.3 |
| F28 | Complete README | P2 | v0.3 |
| F29 | Douto -> Valter integration protocol | P1 | v0.4 |
| F30 | MCP server for doctrine | P1 | v0.4 |
| F31 | Makefile for pipeline orchestration | P2 | v0.3 |
| F32 | Linting with ruff | P2 | v0.3 |
