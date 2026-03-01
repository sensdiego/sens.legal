---
title: Troubleshooting
description: Common problems and solutions when running the Douto pipeline.
lang: en
sidebar:
  order: 3
---

# Troubleshooting

Common issues, their causes, and how to fix them. Problems are organized by pipeline stage.

---

## Pipeline Won't Start

### FileNotFoundError: hardcoded path doesn't exist

**Symptoms:**

```
FileNotFoundError: [Errno 2] No such file or directory: '/home/sensd/.openclaw/workspace/vault/Knowledge/_staging/processed'
```

or

```
FileNotFoundError: [Errno 2] No such file or directory: '/mnt/c/Users/sensd/vault/Knowledge/_staging/processed'
```

**Cause:** Two pipeline scripts (`process_books.py` and `rechunk_v3.py`) have absolute paths from the creator's machine hardcoded in the source.

| Script | Hardcoded path | Environment |
|--------|---------------|-------------|
| `process_books.py` line 27 | `/home/sensd/.openclaw/workspace/vault` | Linux native |
| `rechunk_v3.py` line 29 | `/mnt/c/Users/sensd/vault` | WSL (Windows mount) |

**Fix (immediate):** Edit the `VAULT_PATH` line in the affected script to point to your vault:

```python
# In process_books.py, change line 27:
VAULT_PATH = Path("/your/actual/vault/path")

# In rechunk_v3.py, change line 29:
VAULT_PATH = Path("/your/actual/vault/path")
```

**Fix (for enrich_chunks.py and embed_doutrina.py):** These scripts read the environment variable:

```bash
export VAULT_PATH="/your/actual/vault/path"
```

**Permanent fix:** F22 (v0.2) will standardize all scripts to use `os.environ.get()`.

---

### ModuleNotFoundError: No module named 'sentence_transformers'

**Cause:** Python dependencies are not installed, or you are running outside the virtual environment.

**Fix:**

```bash
# Activate virtual environment first
source .venv/bin/activate

# Install dependencies
pip install -r pipeline/requirements.txt
```

If you get permission errors, use:

```bash
pip install --user -r pipeline/requirements.txt
```

:::note
The `requirements.txt` does not pin versions. If a dependency fails to install, it may be due to version conflicts with other packages. Try installing individually: `pip install sentence-transformers torch numpy anthropic llama-parse`.
:::

---

### Python version error: unsupported syntax

**Symptoms:**

```
TypeError: 'type' object is not subscriptable
```

on lines like `tuple[dict, str]`.

**Cause:** Python version is below 3.10. The codebase uses modern type hint syntax that requires Python 3.10+.

**Fix:** Upgrade Python to 3.10 or later. Verify with:

```bash
python3 --version
# Must be 3.10.x or higher
```

---

## PDF Extraction Issues (process_books.py)

### LlamaParse API key not found

**Symptoms:**

```
Error: LLAMA_CLOUD_API_KEY not set
```

or a generic authentication error from the LlamaIndex SDK.

**Cause:** The `LLAMA_CLOUD_API_KEY` environment variable is not set. This key is loaded implicitly by the LlamaIndex SDK, not explicitly in the code.

**Fix:**

```bash
export LLAMA_CLOUD_API_KEY="llx-your-key-here"
```

Get a key at [cloud.llamaindex.ai](https://cloud.llamaindex.ai/).

---

### PDF extraction produces garbled text

**Cause:** The PDF may be scanned (image-based) or have a complex multi-column layout that the `cost_effective` tier cannot handle well.

**Fix:** Try the `agentic` tier, which uses more sophisticated extraction:

```bash
python3 pipeline/process_books.py --tier agentic problematic-book.pdf
```

:::tip
If the book has been digitized from a physical copy (OCR), expect some text artifacts regardless of tier. Characters like `fi` may be corrupted to separate characters, `art.` may become `art,`, etc. These artifacts propagate through the entire pipeline and contaminate embeddings.
:::

---

## Chunking Issues (rechunk_v3.py)

### Chunks are too small or too large

**Cause:** The hardcoded `MIN_CHUNK_CHARS` (1500) or `MAX_CHUNK_CHARS` (15000) may not suit your specific book.

**Fix:** Override the minimum via CLI:

```bash
python3 pipeline/rechunk_v3.py --min-chars 1000 your-book-slug
```

`MAX_CHUNK_CHARS` is not configurable via CLI. Edit line 33 of `rechunk_v3.py` to change it.

---

### Running headers appearing as content

**Symptoms:** Chunks that consist mostly of the book title or author name repeated.

**Cause:** The running header detection heuristic may have failed for this specific book. Headers that appear on every page of a PDF are normally detected by frequency and filtered out, but unusual formatting can bypass the detection.

**Fix:** Check the processed markdown for the book (in `$VAULT_PATH/Knowledge/_staging/processed/{slug}/`). If running headers are present in the source markdown, they need to be cleaned before rechunking. Use `--force` to rechunk:

```bash
# After cleaning the source markdown:
python3 pipeline/rechunk_v3.py --force your-book-slug
```

---

## Enrichment Issues (enrich_chunks.py)

### enrich_prompt.md not found

**Symptoms:**

```
ERRO: Prompt nao encontrado em /path/to/pipeline/enrich_prompt.md
```

The script exits immediately.

**Cause:** The enrichment prompt file is **missing from the repository**. It was lost during migration from the original Obsidian vault. This is a known critical issue (PREMORTEM RT01).

**Impact:** You cannot enrich new chunks until the prompt is recovered.

**Workarounds:**

1. **Reconstruct from existing chunks** -- examine enriched chunks in `$VAULT_PATH/Knowledge/_staging/processed/` to reverse-engineer the prompt format and expected output structure.
2. **Check vault history** -- if you have access to the original Obsidian vault, look for `enrich_prompt.md` in the pipeline or templates directory.
3. **Write a new prompt** -- based on the metadata fields (categoria, instituto, tipo_conteudo, fase, ramo, fontes_normativas) and the enrichment code's JSON parsing logic.

**Tracking:** Mitigation action M01 (P0 priority).

---

### MiniMax API authentication failed

**Symptoms:**

```
anthropic.AuthenticationError: Authentication failed
```

or

```
Error code: 401
```

**Cause:** The `MINIMAX_API_KEY` environment variable is not set, expired, or invalid.

**Fix:**

```bash
export MINIMAX_API_KEY="your-valid-minimax-key"
```

Verify the key works:

```bash
python3 -c "
import os
from anthropic import Anthropic
client = Anthropic(api_key=os.environ['MINIMAX_API_KEY'], base_url='https://api.minimax.io/anthropic')
print('Auth OK')
"
```

---

### MiniMax API returns unexpected format

**Symptoms:** Enrichment completes but chunks get `status_enriquecimento: "pendente"` or metadata fields are empty.

**Cause:** The Anthropic SDK compatibility with MiniMax's endpoint may have changed. This integration uses an undocumented compatibility layer (`base_url="https://api.minimax.io/anthropic"`) that is not officially supported by either Anthropic or MiniMax (PREMORTEM RT02).

**Debugging steps:**

1. Check the enrichment log at `$VAULT_PATH/Logs/enrichment_log.jsonl` for error details.
2. Try a single chunk manually to see the raw API response.
3. Check if the `anthropic` package version has changed: `pip show anthropic`.
4. Verify the MiniMax API endpoint is still accessible: `curl -I https://api.minimax.io/anthropic`.

**Workaround:** If the SDK compatibility is broken, you may need to:
- Pin the `anthropic` package to the last working version
- Switch to calling the MiniMax API directly with `requests` instead of the Anthropic SDK
- Consider migrating to Claude API (decision D06)

---

### Enrichment is slow

**Cause:** Enrichment processes chunks sequentially with 5 threads and a 0.5-second delay between requests. For large books (hundreds of chunks), this takes time.

**Expected throughput:** ~10 chunks per second (5 threads x 2 requests/second per thread, minus latency).

**For 1,000 chunks:** ~2 minutes. For the full corpus of 31,500 chunks: ~1 hour.

There is no way to increase the thread count or reduce the delay without editing the source code (lines 34-35 of `enrich_chunks.py`).

:::caution
Increasing `WORKERS` above 5 or reducing `DELAY_BETWEEN_REQUESTS` below 0.5s may trigger MiniMax API rate limiting.
:::

---

## Search Issues (search_doutrina_v2.py)

### Search returns no results

**Possible causes:**

1. **DATA_PATH not set or points to wrong directory:**
   ```bash
   echo $DATA_PATH
   ls $DATA_PATH  # Should contain embeddings_*.json, search_corpus_*.json, bm25_index_*.json
   ```

2. **Area has no corresponding files:**
   ```bash
   # Check available files
   ls $DATA_PATH/embeddings_*.json
   ls $DATA_PATH/search_corpus_*.json
   ```
   The search expects files named `embeddings_{area}.json`, `search_corpus_{area}.json`, and `bm25_index_{area}.json`. Currently supported areas: `contratos` (mapped to `doutrina` files) and `processo_civil`.

3. **JSON files are corrupted or empty:**
   ```bash
   python3 -c "import json; json.load(open('$DATA_PATH/embeddings_doutrina.json')); print('JSON OK')"
   ```

4. **Query terms don't match corpus vocabulary:**
   Try broader terms, or switch to semantic-only mode (`/sem` in interactive mode) which is better for conceptual queries.

---

### Search is very slow (multi-second queries)

**Cause:** This is a known architectural limitation. On every search:

1. Full JSON files (~2 GB total) are loaded into memory (cached after first load)
2. BM25 recalculates document frequencies for every query (O(N * T) complexity)
3. NumPy dot product runs over all 31,500 embedding vectors

**Expected latency:**
- First query: 5-15 seconds (data loading + search)
- Subsequent queries: 1-3 seconds (data cached, but BM25 still recalculates)

**Workarounds:**
- Use `--area contratos` or `--area processo_civil` to search a single area (smaller dataset)
- Use `/sem` mode (semantic only) to skip BM25 calculation
- Keep the interactive session open to benefit from caching

**Permanent fix:** Migration to Qdrant vector DB (mitigation M12, planned for v0.4) and pre-computed BM25 index (M13).

---

### Results seem irrelevant

**Possible causes:**

1. **Enrichment metadata quality is unknown** -- the metadata used for filtered search has never been validated (PREMORTEM PF01). If `instituto` or `ramo` classifications are wrong, filtered results will be wrong.

2. **Semantic vs. keyword mismatch** -- try different search modes:
   - `/sem` (semantic only) -- better for conceptual queries like "what is good faith in contracts"
   - `/bm25` (keyword only) -- better for exact terms like "art. 476 CC"
   - `/hybrid` (default) -- balances both

3. **Embedding pollution** -- the embedding is generated from composed text that includes metadata. If metadata is wrong, the embedding captures wrong context.

4. **Check verbose output:**
   ```
   /verbose
   ```
   This shows the full chunk text in results, letting you judge if the content matches your intent.

---

## Embedding Generation Issues (embed_doutrina.py)

### Out of memory during embedding generation

**Symptoms:**

```
RuntimeError: CUDA out of memory
```

or the process is killed by the OS.

**Cause:** PyTorch + Legal-BERTimbau + a large batch of chunks can exceed available GPU or system memory.

**Fix:**

1. **Reduce batch size** -- edit `BATCH_SIZE` in `embed_doutrina.py` line 25 (default: 32). Try 8 or 16.

2. **Use CPU instead of GPU:**
   ```bash
   export CUDA_VISIBLE_DEVICES=""  # Forces CPU mode
   python3 pipeline/embed_doutrina.py
   ```

3. **Process fewer chunks:**
   ```bash
   python3 pipeline/embed_doutrina.py --limit 100  # If supported
   ```

:::note
CPU mode is slower but uses less memory and works on any machine. For the full corpus of 31,500 chunks, expect ~10-30 minutes on CPU vs. ~2-5 minutes on GPU.
:::

---

### Model download fails

**Symptoms:**

```
OSError: Can't load tokenizer for 'rufimelo/Legal-BERTimbau-sts-base'
```

or

```
ConnectionError: HTTPSConnectionPool(host='huggingface.co', port=443)
```

**Cause:** Network issues or HuggingFace Hub is temporarily unavailable.

**Fix:**

1. **Retry** -- HuggingFace Hub outages are usually brief.

2. **Pre-download the model** on a machine with internet:
   ```bash
   python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base')"
   ```

3. **Copy the cache** to the target machine:
   ```bash
   # Default cache location
   cp -r ~/.cache/huggingface/hub/models--rufimelo--Legal-BERTimbau-sts-base /target/path/
   export HF_HOME="/target/path/.cache/huggingface"
   ```

---

### PyTorch / CUDA compatibility errors

**Symptoms:**

```
RuntimeError: CUDA error: no kernel image is available for execution on the device
```

or various CUDA version mismatch errors.

**Cause:** The installed PyTorch version doesn't match your GPU driver or CUDA version.

**Fix:** CPU mode works for everything Douto does. Embedding generation is slower but fully functional:

```bash
export CUDA_VISIBLE_DEVICES=""
```

If you need GPU acceleration, install the correct PyTorch version for your CUDA:

```bash
# Check your CUDA version
nvidia-smi

# Install matching PyTorch (example for CUDA 12.1)
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

---

## Knowledge Base Issues

### Frontmatter parsing errors

**Symptoms:** Metadata fields are missing, truncated, or contain wrong values after processing.

**Cause:** Douto uses a custom regex-based YAML parser (not PyYAML). This parser cannot handle several edge cases:

| Input | Expected | Actual |
|-------|----------|--------|
| `titulo: "Codigo Civil: Comentado"` | `Codigo Civil: Comentado` | `Codigo Civil` (truncated at colon) |
| `autor: O'Brien` | `O'Brien` | May fail to parse |
| `tags: [a, b, c]` | `["a", "b", "c"]` | Parsed by regex, may fail on nested lists |
| Multiline values | Full text | Only first line |

**Workaround:** Avoid special characters in frontmatter values. Specifically:
- Do not use colons (`:`) inside values -- move them to a description field
- Do not use hash symbols (`#`) -- they may be interpreted as comments
- Keep values on a single line
- Wrap values in double quotes if they contain special characters

**Permanent fix:** Migrate to PyYAML (planned as part of F23/M05 in `utils.py`).

---

### Wikilinks not resolving in Obsidian

**Cause:** The target file may not exist or may have a different name than expected.

**Fix:** Check that the target file exists:
- MOC links should point to `knowledge/mocs/MOC_{DOMAIN}.md`
- All internal links must use wikilink format: `[[target]]`, not markdown links `[text](path)`
- Open the vault in Obsidian to see broken links highlighted

---

## Getting Help

1. **Check this page first** -- most common issues are documented above.
2. **Check PREMORTEM.md** -- your issue may be a known risk with a documented mitigation plan.
3. **File a GitHub issue** at [github.com/sensdiego/douto/issues](https://github.com/sensdiego/douto/issues) with:
   - The script and command you ran
   - The full error message
   - Your environment (OS, Python version, `pip list` output)
   - The values of relevant environment variables (redact API keys)
4. **For ecosystem questions** (Valter/Juca integration), check the respective repositories.
