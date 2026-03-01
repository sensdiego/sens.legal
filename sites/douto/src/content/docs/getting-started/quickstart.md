---
title: "Quickstart"
description: "Run a doctrine search in under 5 minutes with Douto's pre-built corpus."
lang: en
sidebar:
  order: 2
---

# Quickstart

This guide gets you running a doctrine search against Douto's pre-built corpus in under 5 minutes. For full pipeline setup (including PDF extraction and enrichment), see [Installation](installation).

## Prerequisites

- Python 3.10 or later
- pip
- ~4 GB RAM (for loading embeddings into memory)
- Pre-built corpus files (JSON) — available from the project maintainer

## 1. Clone and Install

```bash
git clone https://github.com/sensdiego/douto.git
cd douto
pip install -r pipeline/requirements.txt
```

:::caution
Dependencies in `requirements.txt` are currently unpinned. If you encounter version conflicts, see [Installation](installation) for workarounds. Pinning versions is planned for [v0.2](../roadmap/milestones#v02--stable-pipeline).
:::

## 2. Set the Data Path

Point Douto to the directory containing the pre-built corpus files:

```bash
export DATA_PATH="/path/to/your/corpus/data"
```

This directory must contain:

| File | Description |
|------|-------------|
| `embeddings_doutrina.json` | 768-dim embedding vectors for contract law chunks |
| `search_corpus_doutrina.json` | Metadata for each chunk (title, author, instituto, etc.) |
| `bm25_index_doutrina.json` | Tokenized documents for BM25 keyword search |
| `embeddings_processo_civil.json` | Embeddings for civil procedure chunks |
| `search_corpus_processo_civil.json` | Metadata for civil procedure chunks |
| `bm25_index_processo_civil.json` | BM25 index for civil procedure |

## 3. Run a Search

### Single Query

```bash
# Search contract law for "exceptio non adimpleti contractus"
python3 pipeline/search_doutrina_v2.py "exceptio non adimpleti contractus" --area contratos

# Search civil procedure for "tutela antecipada"
python3 pipeline/search_doutrina_v2.py "tutela antecipada requisitos" --area processo_civil

# Search all areas
python3 pipeline/search_doutrina_v2.py "boa-fé objetiva" --area all --verbose
```

### Interactive Mode

```bash
python3 pipeline/search_doutrina_v2.py --interativo
```

In interactive mode, you get a REPL with these commands:

| Command | Description |
|---------|-------------|
| `/area contratos\|processo_civil\|all` | Switch search area |
| `/filtro instituto=X tipo=Y fase=Z` | Set metadata filters |
| `/verbose` | Toggle text preview of chunks |
| `/top N` | Change number of results (default: 5) |
| `/bm25` | Switch to keyword-only search |
| `/sem` | Switch to semantic-only search |
| `/hybrid` | Switch to hybrid search (default) |
| `/quit` | Exit |

### With Filters

```bash
# Search for a specific legal concept (instituto)
python3 pipeline/search_doutrina_v2.py "contrato bilateral" --instituto "exceptio" --area contratos

# Search for definitions only
python3 pipeline/search_doutrina_v2.py "boa-fé objetiva" --tipo "definicao" --verbose
```

## 4. Understand the Output

A typical search result looks like this:

```
  1. [0.847] 📗 Da Exceção do Contrato Não Cumprido
     📖 Contratos — Orlando Gomes (chunk 26/89) [contratos]
     🏷️  exceptio non adimpleti contractus, contrato bilateral | definição, requisitos
```

| Element | Meaning |
|---------|---------|
| `1.` | Rank position |
| `[0.847]` | Relevance score (0-1, higher is better) |
| `📗` / `📘` | Area: 📗 = contratos, 📘 = processo_civil |
| First line | Chunk title (section heading from the book) |
| `📖` | Book title, author, chunk position within the book |
| `🏷️` | Instituto tags and content type tags from enrichment |

With `--verbose`, the actual chunk text (first 300 characters) is also shown.

## Next Steps

- [Installation](installation) — set up the full pipeline (PDF extraction, enrichment, embedding generation)
- [Hybrid Search](../features/pipeline/hybrid-search) — deep dive into search modes and configuration
- [Architecture Overview](../architecture/overview) — understand the complete data flow
