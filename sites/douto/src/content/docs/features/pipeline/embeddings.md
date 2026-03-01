---
title: "Feature: Embedding Generation"
description: "How embed_doutrina.py generates 768-dimensional Legal-BERTimbau embeddings with a metadata-enriched text composition strategy for semantic search."
lang: en
sidebar:
  order: 4
---

# Embedding Generation (F04)

`pipeline/embed_doutrina.py` -- Generates 768-dimensional semantic embeddings using Legal-BERTimbau, with a metadata-enriched text composition strategy that embeds not just the chunk body but also its legal classification. This is what enables semantic search over the doctrinal corpus.

## Overview

| Property | Value |
|----------|-------|
| **Script** | `pipeline/embed_doutrina.py` (345 lines) |
| **Input** | Enriched chunks with `status_enriquecimento: "completo"` |
| **Output** | Three JSON files: embeddings, search corpus, BM25 index |
| **Model** | `rufimelo/Legal-BERTimbau-sts-base` (768-dim) |
| **Max tokens** | 512 (`MAX_TOKENS`) |
| **Batch size** | 32 (`BATCH_SIZE`) |
| **Device** | CUDA if available, otherwise CPU |

## Text Composition Strategy

This is the most important design decision in the embedding stage. Instead of embedding raw chunk text, Douto composes a structured prefix that captures the legal classification within the BERT token limit.

### Format

```
[categoria] | [institutos] | [tipo_conteudo] | [titulo] | [corpo_truncado]
```

### Why This Matters

Legal-BERTimbau has a hard 512-token limit (~2,000 characters in Portuguese). A raw chunk body would fill the entire token budget with text, losing the semantic signal from its classification. By prefixing with structured metadata, the embedding captures both *what* the text is about (instituto, categoria) and *what kind* of content it is (definicao vs. jurisprudencia vs. exemplo) in the vector space.

This means a search for "requisitos da exceptio non adimpleti contractus" will match chunks classified as `instituto: ["exceptio_non_adimpleti_contractus"]` + `tipo_conteudo: ["requisitos"]` even if the body text uses different phrasing.

### The Actual Code

```python
def compose_embedding_text(fm: dict, body: str) -> str:
    parts = []

    # 1. Categoria geral
    cat = fm.get("categoria", "")
    if cat:
        parts.append(cat)

    # 2. Institutos juridicos (most important for search)
    institutos = fm.get("instituto", [])
    if isinstance(institutos, list) and institutos:
        parts.append(", ".join(i.replace("_", " ") for i in institutos[:5]))

    # 3. Tipo de conteudo (definicao, jurisprudencia, etc.)
    tipos = fm.get("tipo_conteudo", [])
    if isinstance(tipos, list) and tipos:
        parts.append(", ".join(t.replace("_", " ") for t in tipos[:3]))

    # 4. Titulo da secao
    titulo = fm.get("titulo", "")
    if titulo:
        titulo_clean = re.sub(r'\(cont\.\s*\d+\)', '', titulo).strip()
        titulo_clean = re.sub(r'^\d+\.\s*', '', titulo_clean).strip()
        if titulo_clean:
            parts.append(titulo_clean[:150])

    # 5. Corpo — truncate to fit model (512 tokens ~ 2000 chars PT)
    body_clean = body.strip()
    body_clean = re.sub(r'^>.*\n', '', body_clean, flags=re.MULTILINE).strip()
    body_clean = re.sub(r'^#+\s+.*\n', '', body_clean, count=1).strip()

    prefix = " | ".join(parts)

    # BERTimbau: ~512 tokens, ~4 chars/token PT -> ~2000 chars
    max_body = 1800 - len(prefix)
    if max_body < 200:
        max_body = 200

    text = f"{prefix} | {body_clean[:max_body]}"
    return text
```

### Example Output

```
contratos | contrato bilateral, exceptio non adimpleti contractus |
definicao, requisitos | Contratos bilaterais e unilaterais |
A exceptio non adimpleti contractus e a defesa que pode ser oposta
pelo contratante demandado quando o outro nao cumpriu...
```

:::tip
The underscores in instituto names are replaced with spaces before embedding (`i.replace("_", " ")`) so the BERT tokenizer treats them as natural language rather than single tokens.
:::

## Corpus Entry Structure

For each chunk, `build_corpus_entry()` creates a metadata document used for search result display and metadata filtering:

```python
def build_corpus_entry(fm: dict, body: str, filepath: Path) -> dict:
    return {
        "id": filepath.stem,           # e.g., "026-contratos-bilaterais"
        "livro": fm.get("livro_titulo", ""),
        "autor": fm.get("autor", ""),
        "titulo": fm.get("titulo", ""),
        "chunk_numero": fm.get("chunk_numero", 0),
        "chunk_total": fm.get("chunk_total", 0),
        "categoria": fm.get("categoria", ""),
        "instituto": fm.get("instituto", []),
        "sub_instituto": fm.get("sub_instituto", []),
        "tipo_conteudo": fm.get("tipo_conteudo", []),
        "fase": fm.get("fase", []),
        "ramo": fm.get("ramo", ""),
        "fontes_normativas": fm.get("fontes_normativas", []),
        "confiabilidade": fm.get("confiabilidade", ""),
        "livro_dir": filepath.parent.name,
        "texto": body[:3000],           # Preview for display
    }
```

## Output Files

The script produces three files, all JSON, designed for compatibility with the existing Juca/Valter infrastructure.

| File | Contents | Used By |
|------|----------|---------|
| `embeddings_doutrina.json` | `doc_ids[]` + `embeddings[][]` (768-dim float32, normalized) + model metadata | Semantic search (`search_doutrina_v2.py`) |
| `search_corpus_doutrina.json` | Full metadata per chunk (15 fields from `build_corpus_entry`) | Result display and metadata filtering |
| `bm25_index_doutrina.json` | `doc_ids[]` + `documents[]` (composed text, same as embedding input) | BM25 keyword search |

### Embeddings JSON structure

```json
{
  "model": "rufimelo/Legal-BERTimbau-sts-base",
  "dimension": 768,
  "num_docs": 9365,
  "min_val": -0.123,
  "max_val": 0.456,
  "created_at": "2026-02-28T14:30:00",
  "doc_ids": ["book-dir/001-chapter-slug", "..."],
  "embeddings": [[0.012, -0.034, ...], ...]
}
```

:::note
Embeddings are stored as flat JSON arrays, not as binary formats like FAISS or HNSW indexes. This means the entire embedding matrix must be loaded into memory for search. For the current corpus (~31,500 chunks, 768 dims), this requires approximately 500 MB of RAM. This will not scale past ~100 books without migrating to a vector database (tracked as mitigation **M12** -- Qdrant migration).
:::

## Chunk Collection and Filtering

Before embedding, `collect_chunks()` filters the corpus:

1. **Skip `_` prefixed files** (index files like `_INDEX.md`, `_RAW_FULL.md`)
2. **Skip `status_enriquecimento: "lixo"`** (noise chunks)
3. **Skip chunks with body < 200 characters**
4. **Skip unenriched chunks** (no `instituto` and no `tipo_conteudo` -- not yet classified)

This ensures only substantive, classified chunks enter the embedding index.

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VAULT_PATH` | No | `/mnt/c/Users/sensd/vault` | Base directory with enriched chunks |
| `OUTPUT_PATH` | No | `/home/sensd/.openclaw/workspace/juca/data` | Where to write output JSON files |

### CLI Arguments

```bash
# Generate embeddings with default settings
python3 pipeline/embed_doutrina.py

# Specify output directory
python3 pipeline/embed_doutrina.py --output /path/to/output

# Preview without generating embeddings
python3 pipeline/embed_doutrina.py --dry-run

# Limit chunks for testing
python3 pipeline/embed_doutrina.py --limit 100

# Adjust batch size (default: 32)
python3 pipeline/embed_doutrina.py --batch-size 16
```

The `--dry-run` mode is especially useful: it shows chunk counts per book and sample composed texts without loading the BERT model or generating embeddings.

## Performance

The embedding process has two phases:

1. **Model loading** -- 5-15 seconds depending on hardware and caching
2. **Encoding** -- speed depends on device:

| Device | Approximate Speed |
|--------|-------------------|
| CUDA (GPU) | ~500-1000 chunks/s |
| CPU | ~30-50 chunks/s |

For the full corpus (~9,000+ chunks per area), CPU encoding takes approximately 3-5 minutes.

Embeddings are normalized (`normalize_embeddings=True`) so that cosine similarity can be computed as a simple dot product, avoiding the need for normalization at search time.

## Known Limitations

- **Flat JSON storage** -- no HNSW/FAISS/Qdrant indexing. Search is brute-force dot product over the entire matrix. Works for the current scale but will not scale past ~100 books. Tracked as mitigation **M12**.
- **512-token truncation** -- chunks longer than ~2,000 characters (after prefix) lose tail content. The prefix takes 100-400 characters, leaving 1,400-1,700 characters for the body. Long legal analyses may have important content truncated.
- **Metadata pollution** -- if enrichment metadata is wrong (e.g., `instituto` misclassified), the embedding captures incorrect semantics. Since the prefix is weighted first in the token sequence, bad metadata actively harms search quality. This is why the metadata quality gate (**M06**) is critical.
- **Legal-BERTimbau trained on PT-PT** -- the model was trained on Portuguese from Portugal, not Brazilian Portuguese. While the languages are mutually intelligible, there may be subtle vocabulary mismatches for Brazilian legal terminology.
- **No incremental update** -- adding a new book requires regenerating the entire embedding file. There is no append-only or incremental index update mechanism.
- **BM25 index reuses composed text** -- the BM25 index uses the same metadata-prefixed text as embeddings. This means BM25 keyword search matches against metadata terms (instituto names, categories) in addition to body text, which may inflate relevance of metadata-matching but content-irrelevant results.
