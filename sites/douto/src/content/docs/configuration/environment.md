---
title: Environment Variables
description: Complete reference for all environment variables used across the Douto pipeline.
lang: en
sidebar:
  order: 1
---

# Environment Variables

Every environment variable used by Douto, which scripts read it, default values, and whether it is required.

## Variable Reference

| Variable | Required | Default | Used In | Description |
|----------|----------|---------|---------|-------------|
| `VAULT_PATH` | Yes | varies (see Known Issues) | `enrich_chunks.py`, `embed_doutrina.py` | Path to the Obsidian vault containing processed markdown chunks in `Knowledge/_staging/processed/` |
| `OUTPUT_PATH` | No | `~/.openclaw/workspace/juca/data` | `embed_doutrina.py` | Directory where embedding, corpus, and BM25 index JSON files are written |
| `DATA_PATH` | No | `~/.openclaw/workspace/juca/data` | `search_doutrina_v2.py` | Directory containing pre-built search data (embeddings, corpus, BM25 index) |
| `MINIMAX_API_KEY` | Yes (for enrichment) | -- | `enrich_chunks.py` | API key for MiniMax M2.5, used via the Anthropic SDK with a custom `base_url` |
| `LLAMA_CLOUD_API_KEY` | Yes (for extraction) | -- | `process_books.py` | API key for LlamaParse (LlamaIndex), loaded implicitly by the SDK |

:::caution[Two scripts use hardcoded paths]
`process_books.py` and `rechunk_v3.py` do **not** read `VAULT_PATH` from the environment. They have hardcoded absolute paths. Setting `VAULT_PATH` has no effect on these scripts until [F22](/docs/roadmap/milestones/#v02--stable-pipeline) is completed.
:::

### Optional / Implicit Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HF_HOME` | No | `~/.cache/huggingface` | Override the HuggingFace cache directory where `Legal-BERTimbau` is downloaded |
| `SENTENCE_TRANSFORMERS_HOME` | No | `$HF_HOME` | Override the sentence-transformers model cache specifically |
| `CUDA_VISIBLE_DEVICES` | No | all GPUs | Restrict which GPU(s) PyTorch uses for embedding generation |

## Known Issues with Paths

:::danger[Three different default paths across scripts]
The pipeline scripts currently reference three different hardcoded environments, making the pipeline runnable **only on the creator's machine**:

| Script | Path | Environment |
|--------|------|-------------|
| `process_books.py` (line 27) | `/home/sensd/.openclaw/workspace/vault` | Linux native |
| `rechunk_v3.py` (line 29) | `/mnt/c/Users/sensd/vault` | WSL (Windows mount) |
| `enrich_chunks.py` (line 25) | `os.environ.get("VAULT_PATH", "/mnt/c/Users/sensd/vault")` | WSL fallback |
| `embed_doutrina.py` (line 21) | `os.environ.get("VAULT_PATH", "/mnt/c/Users/sensd/vault")` | WSL fallback |
| `search_doutrina_v2.py` (line 23) | `os.environ.get("DATA_PATH", "/home/sensd/.openclaw/workspace/juca/data")` | Linux native |

This inconsistency is the **#1 technical debt item** (rated P0) and is tracked as F22 in the roadmap. The resolution is to standardize all scripts to use `os.environ.get()` with a single consistent fallback.
:::

### Path Relationship

The scripts expect a specific directory structure under `VAULT_PATH`:

```
$VAULT_PATH/
  Knowledge/
    _staging/
      input/         # PDFs to process (process_books.py reads from here)
      processed/     # Markdown chapters + enriched chunks (all scripts)
      failed/        # Failed PDF extractions
      processing_log.jsonl
```

`OUTPUT_PATH` and `DATA_PATH` both default to the same directory (`~/.openclaw/workspace/juca/data`), where the embedding and search index files live:

```
$OUTPUT_PATH/  (== $DATA_PATH/)
  embeddings_doutrina.json
  search_corpus_doutrina.json
  bm25_index_doutrina.json
  embeddings_processo_civil.json
  search_corpus_processo_civil.json
  bm25_index_processo_civil.json
```

## Setup by Use Case

### Search Only (querying existing data)

You only need `DATA_PATH`:

```bash
export DATA_PATH="/path/to/juca/data"
python3 pipeline/search_doutrina_v2.py --interativo
```

### Embedding Generation

You need `VAULT_PATH` (source chunks) and `OUTPUT_PATH` (where to write embeddings):

```bash
export VAULT_PATH="/path/to/vault"
export OUTPUT_PATH="/path/to/juca/data"
python3 pipeline/embed_doutrina.py
```

### Chunk Enrichment

You need `VAULT_PATH` (source chunks) and `MINIMAX_API_KEY`:

```bash
export VAULT_PATH="/path/to/vault"
export MINIMAX_API_KEY="your-minimax-api-key"
python3 pipeline/enrich_chunks.py all
```

### Full Pipeline (PDF to search)

All variables are required:

```bash
export VAULT_PATH="/path/to/vault"
export OUTPUT_PATH="/path/to/juca/data"
export MINIMAX_API_KEY="your-minimax-api-key"
export LLAMA_CLOUD_API_KEY="your-llamaparse-key"

python3 pipeline/process_books.py          # PDF -> markdown
python3 pipeline/rechunk_v3.py             # markdown -> chunks
python3 pipeline/enrich_chunks.py all      # chunks -> classified
python3 pipeline/embed_doutrina.py         # chunks -> embeddings
python3 pipeline/search_doutrina_v2.py -i  # interactive search
```

:::caution
Remember that `process_books.py` and `rechunk_v3.py` currently **ignore** `VAULT_PATH` and use hardcoded paths. You must edit these files directly or wait for [F22](/docs/roadmap/milestones/#v02--stable-pipeline).
:::

## Example .env File

:::note
Douto does **not** use `python-dotenv`. Environment variables must be set in your shell (e.g., `export` in bash/zsh, or sourced from a file). The `.env` file below is a template for your shell profile or a `source`-able file.
:::

```bash
# Douto — Environment Variables
# Copy this to .env and run: source .env

# Path to the Obsidian vault with Knowledge/_staging/ structure
export VAULT_PATH="/path/to/your/vault"

# Where embedding and search index JSONs are written/read
export OUTPUT_PATH="/path/to/juca/data"
export DATA_PATH="/path/to/juca/data"  # typically same as OUTPUT_PATH

# API Keys — required for specific pipeline stages
export MINIMAX_API_KEY="your-minimax-api-key"        # enrichment (enrich_chunks.py)
export LLAMA_CLOUD_API_KEY="your-llamaparse-key"      # PDF extraction (process_books.py)

# Optional: HuggingFace model cache (Legal-BERTimbau is ~500MB)
# export HF_HOME="/path/to/hf-cache"

# Optional: GPU control
# export CUDA_VISIBLE_DEVICES="0"  # use only GPU 0
```

:::tip
Add `.env` to your `.gitignore` to avoid committing API keys. The project's `.gitignore` already excludes `.env` files.
:::
