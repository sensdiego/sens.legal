---
title: Features
description: Complete feature inventory for Douto — implemented, in progress, planned, and proposed — with links to detailed pages.
lang: en
sidebar:
  order: 1
---

# Features

Every feature in Douto, organized by implementation status. Each pipeline stage and knowledge-base component links to a dedicated page with architecture details, code examples, and known limitations.

## Feature Status Legend

| Badge | Meaning |
|-------|---------|
| **Implemented** | In production, functional, used in the current pipeline |
| **In Progress** | Partially implemented -- structure exists but incomplete |
| **Planned** | On the roadmap with an assigned milestone |
| **Idea** | Proposed but not yet scheduled |
| **Innovation** | Strategic proposals from `INNOVATION_LAYER.md` |

---

## Pipeline Features (Implemented)

The core processing pipeline transforms legal textbook PDFs into searchable embeddings through five sequential stages.

| # | Feature | Status | Script | Page |
|---|---------|--------|--------|------|
| F01 | PDF Extraction | Implemented | `process_books.py` | [pdf-extraction](pipeline/pdf-extraction.md) |
| F02 | Intelligent Chunking v3 | Implemented | `rechunk_v3.py` | [intelligent-chunking](pipeline/intelligent-chunking.md) |
| F03 | Chunk Enrichment | Implemented | `enrich_chunks.py` | [enrichment](pipeline/enrichment.md) |
| F04 | Embedding Generation | Implemented | `embed_doutrina.py` | [embeddings](pipeline/embeddings.md) |
| F05 | Hybrid Search | Implemented | `search_doutrina_v2.py` | [hybrid-search](pipeline/hybrid-search.md) |
| F06 | Multi-Area Search | Implemented | `search_doutrina_v2.py` | [hybrid-search](pipeline/hybrid-search.md) |
| F07 | Interactive Search CLI | Implemented | `search_doutrina_v2.py` | [hybrid-search](pipeline/hybrid-search.md) |

```mermaid
flowchart LR
    PDF["PDF files"]
    MD["Markdown + chapters"]
    CHK["Semantic chunks"]
    ENR["Enriched chunks"]
    EMB["Embeddings + corpus"]
    SRCH["Search results"]

    PDF -->|"F01 process_books.py"| MD
    MD -->|"F02 rechunk_v3.py"| CHK
    CHK -->|"F03 enrich_chunks.py"| ENR
    ENR -->|"F04 embed_doutrina.py"| EMB
    EMB -->|"F05 search_doutrina_v2.py"| SRCH
```

## Knowledge Base Features

The knowledge base is an Obsidian-style skill graph that organizes the doctrinal corpus by legal domain.

| # | Feature | Status | Artifact | Page |
|---|---------|--------|----------|------|
| F08 | Skill Graph INDEX | Implemented | `INDEX_DOUTO.md` | [skill-graph](knowledge-base/skill-graph.md) |
| F09 | MOC Direito Civil | Implemented | `MOC_CIVIL.md` | [mocs](knowledge-base/mocs.md) |
| F10 | MOC Processual Civil | Implemented | `MOC_PROCESSUAL.md` | [mocs](knowledge-base/mocs.md) |
| F11 | MOC Empresarial | Implemented | `MOC_EMPRESARIAL.md` | [mocs](knowledge-base/mocs.md) |
| F19 | MOC Consumidor | In Progress | `MOC_CONSUMIDOR.md` | [mocs](knowledge-base/mocs.md) |
| F21 | Atomic Notes (nodes/) | In Progress | `knowledge/nodes/` | [atomic-notes](knowledge-base/atomic-notes.md) |

## Pipeline Quality Features (Implemented)

Cross-cutting capabilities that ensure reliability and debuggability across all pipeline stages.

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| F12 | Idempotent Processing | Implemented | Markers prevent re-processing; `--force` to override |
| F13 | Structured Logging | Implemented | `processing_log.jsonl` with append-only events |
| F14 | Dry-Run Mode | Implemented | `--dry-run` flag on all scripts that mutate data |
| F15 | Standardized YAML Frontmatter | Implemented | Consistent schema: `knowledge_id`, `tipo`, `titulo`, `livro_titulo`, `autor`, `area_direito`, `status_enriquecimento` |

## Project Infrastructure (Implemented)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| F16 | AGENTS.md | Implemented | Agent identity, responsibilities, limits, git protocol |
| F17 | CLAUDE.md | Implemented | Coding guidelines for AI agents aligned with the sens.legal ecosystem |
| F18 | PROJECT_MAP.md | Implemented | Full project diagnostic and architecture map |

---

## Planned Features

Organized by target milestone. Source: `ROADMAP.md`.

### v0.2 -- Pipeline Estavel

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| F22 | Standardize paths | **P0** | Eliminate hardcoded absolute paths in `process_books.py` and `rechunk_v3.py` |
| F23 | Extract `pipeline/utils.py` | **P1** | Deduplicate `parse_frontmatter()`, `slugify()`, `build_frontmatter()` |
| F24 | Pin dependency versions | **P1** | `requirements.txt` with exact versions |
| F20 | Complete env var standardization | **P1** | 2/5 scripts use `os.environ.get()`, 3 have hardcoded paths |

### v0.3 -- Qualidade & Cobertura

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| F25 | Create missing MOCs | **P1** | `MOC_TRIBUTARIO`, `MOC_CONSTITUCIONAL`, `MOC_COMPLIANCE`, `MOC_SUCESSOES` |
| F26 | Tests for `rechunk_v3.py` | **P1** | pytest with real legal markdown fixtures |
| F27 | Tests for utility functions | **P2** | `parse_frontmatter`, `slugify`, `extract_json`, `compose_embedding_text` |
| F28 | Complete README | **P2** | Setup, prerequisites, env vars, usage, architecture |
| F31 | Pipeline Makefile | **P2** | `make pipeline`, `make search`, `make test`, `make lint` |
| F32 | Linting with ruff | **P2** | Configure ruff, integrate into Makefile |
| F42 | Version enrich prompt | **P1** | `enrich_prompt.md` referenced in code but missing from repo |

### v0.4 -- Integracao sens.legal

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| F29 | Douto-to-Valter integration | **P1** | Define protocol: file, API, or MCP |
| F30 | MCP Server for doctrine | **P1** | Expose search via Model Context Protocol |

## Ideas

Features inferred from the sens.legal ecosystem architecture.

| # | Feature | Priority | Milestone | Description |
|---|---------|----------|-----------|-------------|
| F33 | Doutrina in Neo4j | **P2** | v1.0 | Ingest doctrine nodes into Valter's knowledge graph |
| F34 | Doutrina-jurisprudencia cross-ref | **P2** | v1.0 | Auto-link when STJ decisions cite a doctrinal author |
| F35 | Doutrina-legislacao cross-ref | **P3** | v1.0 | Link doctrinal commentary to statutory provisions in Leci |
| F36 | Auto-generate atomic notes | **P2** | v0.5 | One note per `instituto` from enriched chunks |
| F37 | Progressive Briefing support | **P2** | v1.0 | Feed Juca's 4-phase briefing with doctrinal sources |
| F38 | Docker pipeline | **P3** | v1.0 | Containerize with PyTorch + pre-downloaded models |
| F39 | Basic CI/CD | **P3** | v0.5 | GitHub Actions: ruff lint + pytest on PRs |
| F40 | Embedding quality eval set | **P2** | v0.5 | Query-answer pairs to measure recall@k and nDCG |
| F41 | Unified ingestion CLI | **P3** | v0.5 | `douto ingest livro.pdf` runs the full pipeline |

---

## Innovation Layer (Proposed)

Strategic proposals from `INNOVATION_LAYER.md`. These would transform Douto from a "book search engine" into a "doctrinal reasoning engine."

| # | Feature | Priority | Milestone | Description |
|---|---------|----------|-----------|-------------|
| F43 | Doctrine Synthesis Engine | **P1** | v0.3.5 | Synthesize all chunks for a given legal concept across all books |
| F44 | Synthesis prompt | **P1** | v0.3.5 | Carefully designed prompt for generating Doctrine Briefs |
| F45 | Doctrine Brief template | **P1** | v0.3.5 | Standardized output format (Markdown + JSON) |
| F46 | Ontological concept extraction | **P2** | v0.6 | Collect all institutos and co-occurrences from the corpus |
| F47 | Relationship typing | **P2** | v0.6 | LLM classifies relationships (IS_A, APPLIES_TO, REQUIRES, etc.) |
| F48 | Ontology export and visualization | **P3** | v0.6 | GraphML, RDF/Turtle, JSON, interactive visualization |

:::tip
The Doctrine Synthesis Engine (F43) is the single highest-impact proposed feature. It leverages the existing enriched corpus to produce structured Doctrine Briefs that no competitor currently offers. See `INNOVATION_LAYER.md` for the full proposal.
:::
