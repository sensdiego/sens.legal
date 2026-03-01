---
title: "Architecture Decision Records"
description: "Key architectural decisions in Douto — context, rationale, trade-offs, and pending questions."
lang: en
sidebar:
  order: 3
---

# Architecture Decision Records

This page documents the "why" behind Douto's architectural choices. Each ADR follows a consistent format: context, decision, consequences, and current status.

## ADR-001: Legal-BERTimbau as Embedding Model

**Status:** Accepted (pending evaluation)

**Context:** Douto needs a Portuguese-language embedding model optimized for legal text. The model must produce embeddings suitable for cosine similarity search.

**Options considered:**
- `rufimelo/Legal-BERTimbau-sts-base` — Portuguese legal BERT, 768-dim, trained on legal corpora
- `multilingual-e5-large` — Multilingual, 1024-dim, general-purpose
- `Cohere embed-multilingual-v3.0` — Commercial, excellent multilingual performance
- `text-embedding-ada-002` (OpenAI) — Commercial, general-purpose

**Decision:** Legal-BERTimbau. It's the only model specifically trained on Portuguese legal text, it's free, and it runs locally without API calls.

**Consequences:**
- 512-token limit means chunks longer than ~2,000 characters are truncated
- Trained on PT-PT (Portugal), not PT-BR (Brazil) — potential subtle mismatches
- No benchmark comparison exists for Douto's specific domain
- Evaluation is planned as [F40](../roadmap/milestones#v05--knowledge-graph--automation)

## ADR-002: MiniMax M2.5 for Chunk Enrichment

**Status:** Accepted (under review — see [D06](#pending-decisions))

**Context:** Each chunk needs classification with structured legal metadata (instituto, tipo_conteudo, ramo, etc.). This requires an LLM capable of understanding legal concepts and producing valid JSON.

**Decision:** MiniMax M2.5, accessed via the Anthropic Python SDK with a custom `base_url`:

```python
# enrich_chunks.py line 30-31
MINIMAX_BASE_URL = "https://api.minimax.io/anthropic"
MINIMAX_MODEL = "MiniMax-M2.5"
```

**Consequences:**
- Low cost compared to Claude or GPT-4
- Uses an **undocumented compatibility layer** — the Anthropic SDK was not designed to talk to MiniMax
- No quality validation has been performed on the enrichment output
- Breaking changes in either the Anthropic SDK or MiniMax API could silently break enrichment

## ADR-003: JSON Flat Files Instead of Vector Database

**Status:** Accepted (migration planned for v0.4)

**Context:** The pipeline produces embeddings that need to be stored and queried. Valter (the backend service) already runs Qdrant as its vector database.

**Decision:** Serialize everything as JSON files on disk:
- `embeddings_{area}.json` — vectors as nested arrays
- `search_corpus_{area}.json` — metadata as array of objects
- `bm25_index_{area}.json` — tokenized documents as array of strings

**Consequences:**
- Zero infrastructure dependency — no database to run
- Portable — files can be copied anywhere
- **Does not scale** — all data loaded into memory on each query (~1 GB for 31,500 chunks)
- No HNSW or FAISS indexing — search is brute-force O(n) cosine similarity
- Migration to Qdrant planned as [M12](../roadmap/milestones#v04--senslegal-integration)

## ADR-004: Custom BM25 Implementation

**Status:** Accepted (optimization planned)

**Context:** Hybrid search needs a keyword component alongside semantic search. Options included the `rank-bm25` library, Elasticsearch, or a custom implementation.

**Decision:** Hand-rolled BM25 in `search_doutrina_v2.py` with parameters `k1=1.5, b=0.75`.

**Consequences:**
- No external dependency
- Document frequencies are **recalculated per query** — O(N × T) where N=docs, T=query terms
- With 31,500 documents, each query recomputes token frequencies across the entire corpus
- Pre-computing the inverted index is planned as [M13](../roadmap/milestones#v04--senslegal-integration)

## ADR-005: Five-Pass Intelligent Chunking

**Status:** Accepted

**Context:** Legal books have complex structure that naive chunking (by token count or paragraph) destroys. Running headers from PDF extraction, footnotes separated from their text, law articles split from their commentary — all degrade search quality.

**Decision:** A five-pass algorithm in `rechunk_v3.py` (890 lines):

1. **Section Split** — detect sections using 14 regex patterns (markdown headers, chapters, articles, etc.)
2. **Classify** — identify block type: noise, bibliography, summary, running header, content
3. **Merge Small** — combine undersized chunks (< 1,500 chars) with neighbors
4. **Split Oversized** — break chunks exceeding 15,000 chars at sentence boundaries
5. **Cleanup** — remove empty chunks, normalize whitespace

**Consequences:**
- High-quality chunks that preserve legal context
- 890 lines of complex regex-based code with **0% test coverage**
- Running header detection uses frequency analysis — heuristic, not deterministic
- Footnote aggregation and law article preservation are domain-specific and fragile

## ADR-006: Obsidian-Style Knowledge Base

**Status:** Accepted

**Context:** The knowledge base needs to be navigable by humans (in Obsidian) and by AI agents (via file reads).

**Decision:** Markdown files with YAML frontmatter, wikilinks (`[[target]]`), and a hierarchical MOC structure.

**Consequences:**
- Human-readable and version-controllable
- Compatible with Obsidian for visual navigation
- No programmatic query layer — searching requires reading files or using the pipeline's search
- Frontmatter parsed by a custom regex parser (not PyYAML), which is fragile with special characters

## ADR-007: Separate Repository vs. Valter Module

**Status:** PENDING — blocks v0.4

**Context:** Douto could exist as a module inside Valter (which already has Qdrant, Neo4j, and search infrastructure) or remain a separate repository with its own MCP server.

**Options:**
- **(A)** Separate repo with own MCP server
- **(B)** Module at `valter/stores/doutrina/` inside Valter
- **(C)** Separate repo, but Valter proxies all queries

This decision has not been made. See [D02](#pending-decisions).

## Pending Decisions

These decisions are blocking or influencing future milestones:

| # | Question | Options | Blocks |
|---|---------|---------|--------|
| D01 | Integration protocol: MCP stdio, MCP HTTP/SSE, REST, or JSON files? | A) MCP stdio B) MCP HTTP C) REST D) Keep JSON | v0.4 |
| D02 | Separate repo or Valter module? | A) Separate + MCP B) valter/stores/doutrina/ C) Separate + proxy | v0.4 |
| D03 | Atomic notes: auto-generated or curated? | A) Auto B) Manual C) Hybrid | v0.5 |
| D04 | Issue tracking: Linear (SEN-XXX) or GitHub Issues? | A) Linear B) GitHub C) Both | — |
| D05 | Neo4j schema for doctrine nodes? | A) Doctrine node B) Authority + DoctrineClaim C) Reuse Criterion | v1.0 |
| D06 | Keep MiniMax M2.5 or migrate enrichment model? | A) Keep B) Claude C) Local model D) Evaluate later | — |
| D07 | Project owner's actual priorities? | Roadmap is entirely inferred — needs validation | All |
| D08 | Which LLM for the Synthesis Engine? | A) Claude B) MiniMax C) Other | v0.3.5 |
| D09 | Doctrine Briefs: on-demand or pre-computed? | A) On-demand B) Pre-computed C) Hybrid | v0.3.5 |
