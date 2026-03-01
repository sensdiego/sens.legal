---
title: "Installation"
description: "Complete setup guide for running the full Douto pipeline from PDF extraction to search."
lang: en
sidebar:
  order: 3
---

# Installation

This guide covers the complete setup for running every stage of the Douto pipeline, from PDF extraction through search. If you only need to search the existing corpus, see [Quickstart](quickstart).

## System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Python | 3.10+ | 3.11+ |
| RAM | 4 GB | 8 GB+ |
| Disk | 2 GB (models + corpus) | 10 GB (with all books) |
| GPU | Not required | CUDA-compatible (speeds up embedding generation) |
| OS | Linux, macOS, WSL2 | Linux or macOS |

## Step 1: Clone the Repository

```bash
git clone https://github.com/sensdiego/douto.git
cd douto
```

## Step 2: Create a Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows
pip install -r pipeline/requirements.txt
```

:::caution
All dependencies in `requirements.txt` are unpinned (`sentence-transformers` instead of `sentence-transformers==2.6.1`). For reproducible builds, consider running `pip freeze > requirements.lock` after installation and committing it. This is tracked as [F24 in the roadmap](../roadmap/milestones#v02--stable-pipeline).
:::

Current dependencies:

| Package | Purpose | Size |
|---------|---------|------|
| `sentence-transformers` | Embedding generation (Legal-BERTimbau) | ~200 MB |
| `torch` | ML backend for sentence-transformers | ~800 MB |
| `numpy` | Vector operations (cosine similarity, etc.) | ~30 MB |
| `anthropic` | SDK for MiniMax M2.5 API (via custom base_url) | ~5 MB |
| `llama-parse` | PDF extraction via LlamaIndex | ~10 MB |

## Step 3: Configure Environment Variables

```bash
# Required for all pipeline stages
export VAULT_PATH="/path/to/your/vault"

# Required for PDF extraction (process_books.py)
export LLAMA_CLOUD_API_KEY="your-llamaparse-api-key"

# Required for chunk enrichment (enrich_chunks.py)
export MINIMAX_API_KEY="your-minimax-api-key"

# Optional: customize output paths
export OUTPUT_PATH="/path/to/output"    # default: ~/.openclaw/workspace/juca/data
export DATA_PATH="/path/to/search/data" # default: same as OUTPUT_PATH
```

The `VAULT_PATH` directory should be an Obsidian vault with the following structure:

```
$VAULT_PATH/
└── Knowledge/
    └── _staging/
        ├── input/      # Place PDFs here
        ├── processed/  # Output from process_books.py and rechunk_v3.py
        └── failed/     # PDFs that failed extraction
```

:::danger
Two pipeline scripts (`process_books.py` and `rechunk_v3.py`) currently have **hardcoded paths** instead of reading `VAULT_PATH` from the environment. Until [F22](../roadmap/milestones#v02--stable-pipeline) is implemented, you may need to edit these paths directly in the scripts:

- `process_books.py` line 27: `VAULT_PATH = Path("/home/sensd/.openclaw/workspace/vault")`
- `rechunk_v3.py` line 29: `VAULT_PATH = Path("/mnt/c/Users/sensd/vault")`
:::

For a complete environment variable reference, see [Environment Variables](../configuration/environment).

## Step 4: Download the Embedding Model

The `sentence-transformers` library auto-downloads `rufimelo/Legal-BERTimbau-sts-base` (~500 MB) on first run. To pre-download:

```bash
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base')"
```

:::tip
To cache models in a custom location, set `SENTENCE_TRANSFORMERS_HOME` or `HF_HOME` before downloading:
```bash
export SENTENCE_TRANSFORMERS_HOME="/path/to/model/cache"
```
:::

## Step 5: Verify Installation

```bash
# Check Python version
python3 --version  # Should be 3.10+

# Check core dependencies
python3 -c "from sentence_transformers import SentenceTransformer; print('sentence-transformers OK')"
python3 -c "import torch; print(f'torch OK, CUDA: {torch.cuda.is_available()}')"
python3 -c "import numpy; print(f'numpy OK, version: {numpy.__version__}')"
python3 -c "import anthropic; print('anthropic OK')"

# Check search CLI
python3 pipeline/search_doutrina_v2.py --help
```

## Running the Full Pipeline

Each stage depends on the output of the previous one. Run them in order:

### Stage 1: PDF Extraction

```bash
# Place PDFs in $VAULT_PATH/Knowledge/_staging/input/
python3 pipeline/process_books.py --dry-run   # Preview what will be processed
python3 pipeline/process_books.py             # Run extraction
python3 pipeline/process_books.py --tier fast # Use cheaper LlamaParse tier
```

Requires: `LLAMA_CLOUD_API_KEY`. See [PDF Extraction](../features/pipeline/pdf-extraction).

### Stage 2: Intelligent Chunking

```bash
python3 pipeline/rechunk_v3.py --dry-run       # Preview
python3 pipeline/rechunk_v3.py                  # Process all books
python3 pipeline/rechunk_v3.py contratos-gomes  # Process one book
python3 pipeline/rechunk_v3.py --min-chars 1500 # Custom minimum chunk size
```

No API keys required. See [Intelligent Chunking](../features/pipeline/intelligent-chunking).

### Stage 3: Chunk Enrichment

```bash
python3 pipeline/enrich_chunks.py --dry-run   # Preview
python3 pipeline/enrich_chunks.py all         # Enrich all chunks
python3 pipeline/enrich_chunks.py contratos   # Enrich one area
```

Requires: `MINIMAX_API_KEY`. See [Enrichment](../features/pipeline/enrichment).

### Stage 4: Embedding Generation

```bash
python3 pipeline/embed_doutrina.py --dry-run  # Preview
python3 pipeline/embed_doutrina.py            # Generate embeddings
```

No API keys required (model is downloaded from HuggingFace). See [Embeddings](../features/pipeline/embeddings).

### Stage 5: Search

```bash
python3 pipeline/search_doutrina_v2.py --interativo  # Interactive mode
python3 pipeline/search_doutrina_v2.py "query" --area all
```

See [Hybrid Search](../features/pipeline/hybrid-search).

## Troubleshooting

### `FileNotFoundError` on hardcoded paths

Two scripts have hardcoded paths. Edit them directly or wait for [F22](../roadmap/milestones#v02--stable-pipeline):

```python
# process_books.py line 27 — change to:
VAULT_PATH = Path(os.environ.get("VAULT_PATH", "/your/path"))

# rechunk_v3.py line 29 — change to:
VAULT_PATH = Path(os.environ.get("VAULT_PATH", "/your/path"))
```

### PyTorch CUDA errors

If your GPU isn't compatible, force CPU mode:

```bash
export CUDA_VISIBLE_DEVICES=""
```

### `enrich_prompt.md` not found

The enrichment prompt file is **missing from the repository**. This is a known critical issue ([RT01 in PREMORTEM.md](https://github.com/sensdiego/douto/blob/main/PREMORTEM.md)). Until it's recovered, enrichment of new chunks will fail.

For more solutions, see [Troubleshooting](../reference/troubleshooting).
