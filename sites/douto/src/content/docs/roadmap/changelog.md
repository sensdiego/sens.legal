---
title: Changelog
description: History of significant changes, releases, and milestones in Douto.
lang: en
sidebar:
  order: 3
---

# Changelog

Significant changes to Douto, organized chronologically. Follows [Keep a Changelog](https://keepachangelog.com/) conventions.

Format: each entry lists the date, associated commit(s), and categorized changes (Added, Changed, Fixed, Removed).

---

## v0.1.0 -- Initial Setup (2026-02)

The Douto repository was created and populated with the pipeline scripts (migrated from an Obsidian vault) and the knowledge base structure.

### 2026-02-28 -- North Star Definition

**Commit:** `b7930d3`
**Reference:** SEN-368

#### Added
- `AGENTS.md` updated with Jude.md north star -- Douto is formally a component of the unified legal research platform (Juca + Leci + Douto + Valter = Jude.md)
- Issue epic SEN-368 defined as the convergence target

---

### 2026-02-28 -- Knowledge Base Population

**Commit:** `c4e2c5b`

#### Added
- Populated MOCs with real corpus data -- 56 books classified across 4 legal domains
- `MOC_CIVIL.md` -- 35 books, ~9,365 chunks (largest domain)
- `MOC_PROCESSUAL.md` -- 8 books, ~22,182 chunks
- `MOC_EMPRESARIAL.md` -- 7 books
- `MOC_CONSUMIDOR.md` -- placeholder structure (not yet populated)

---

### 2026-02-28 -- Pipeline Migration

**Commit:** `8f9c702`
**Reference:** SEN-358

#### Added
- `pipeline/process_books.py` -- PDF to markdown extraction via LlamaParse (supports tiers: agentic, cost_effective, fast)
- `pipeline/rechunk_v3.py` -- Intelligent legal chunking with 5 processing passes, 16 section patterns, running header detection, footnote grouping
- `pipeline/enrich_chunks.py` -- Chunk enrichment via MiniMax M2.5 (5 concurrent threads, structured legal metadata)
- `pipeline/embed_doutrina.py` -- Embedding generation using Legal-BERTimbau (768-dim, normalized)
- `pipeline/search_doutrina_v2.py` -- Hybrid search (semantic cosine + BM25) with interactive CLI
- `pipeline/requirements.txt` -- Python dependencies (sentence-transformers, torch, numpy, anthropic, llama-parse)

:::note
These 5 scripts were developed inside an Obsidian vault before being migrated to this repository. They predate the repo itself. The migration commit brought them under version control for the first time.
:::

---

### 2026-02-28 -- Initial Setup

**Commit:** `ce16dbc`

#### Added
- `AGENTS.md` -- Agent identity, responsibilities, boundaries, and git protocol
- `knowledge/INDEX_DOUTO.md` -- Skill graph index mapping 8 legal domains
- `knowledge/mocs/` -- MOC directory structure
- `knowledge/nodes/.gitkeep` -- Placeholder for future atomic notes
- `tools/.gitkeep` -- Placeholder for future auxiliary tools
- `.gitignore` -- Excludes node_modules, embeddings, .env, __pycache__

---

## Documentation Session (2026-02-28)

In a single documentation session, the following strategic documents were created:

#### Added
- `CLAUDE.md` -- Coding guidelines for AI code agents, aligned with the sens.legal ecosystem conventions (priority order, Python conventions, pipeline rules, knowledge base rules, embedding conventions, git patterns)
- `PROJECT_MAP.md` -- Full project diagnostic: directory tree, stack details, architecture, data flow diagrams, gap analysis, recommendations
- `ROADMAP.md` -- Product roadmap with 42 features across 6 milestones, 7 pending decisions, risk matrix, and mitigation plan
- `PREMORTEM.md` -- Risk analysis: 6 false premises, 14 technical risks, 5 product risks, 4 execution risks, 7 edge cases, and the IP risk disclosure
- `docs/` -- Starlight documentation site with 22+ pages covering getting started, architecture, features, configuration, development, roadmap, and reference

---

## Pre-History

The pipeline was developed over an undetermined period inside an Obsidian vault before this repository existed. Key facts about the pre-history:

- The 5 Python scripts in `pipeline/` predate the repository
- The corpus (~50 books, ~31,500 chunks) was processed before migration
- Hardcoded paths in the scripts reflect the original development environments (Linux native and WSL)
- The enrichment prompt (`enrich_prompt.md`) was lost during migration and is not in the repository
- Linear issues (SEN-XXX) were used for tracking before the repository had GitHub Issues

<!-- NEEDS_INPUT: Exact dates of pipeline development pre-migration are not available. The creator may have additional context about when each script was originally written. -->
