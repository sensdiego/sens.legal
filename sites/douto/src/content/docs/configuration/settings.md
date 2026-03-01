---
title: Settings & Configuration
description: Hardcoded settings, tunable parameters, and configuration constants across the Douto pipeline.
lang: en
sidebar:
  order: 2
---

# Settings & Configuration

Douto's configurable parameters. Most are currently hardcoded in the source files and need to be externalized in future milestones.

## Pipeline Settings

### process_books.py -- PDF Extraction

| Setting | Value | Location | Configurable |
|---------|-------|----------|--------------|
| `DEFAULT_TIER` | `"cost_effective"` | Line 37 | Yes, via `--tier` CLI arg |
| Chapter split pattern | H1/H2 markdown headers | Hardcoded in `split_into_chapters()` | No |
| Input directory | `$VAULT_PATH/Knowledge/_staging/input/` | Hardcoded | No |
| Output directory | `$VAULT_PATH/Knowledge/_staging/processed/` | Hardcoded | No |
| Failed directory | `$VAULT_PATH/Knowledge/_staging/failed/` | Hardcoded | No |

**LlamaParse Tiers:**

| Tier | Quality | Speed | Cost | When to use |
|------|---------|-------|------|-------------|
| `agentic` | Best | Slowest | Highest | Scanned PDFs, complex layouts, tables |
| `cost_effective` | Good (default) | Medium | Medium | Clean text PDFs, most legal textbooks |
| `fast` | Basic | Fastest | Lowest | Simple text-only documents |

```bash
python3 pipeline/process_books.py --tier agentic livro.pdf
```

---

### rechunk_v3.py -- Intelligent Chunking

| Setting | Value | Location | Configurable |
|---------|-------|----------|--------------|
| `MIN_CHUNK_CHARS` | `1500` | Line 32 | Yes, via `--min-chars` CLI arg |
| `MAX_CHUNK_CHARS` | `15000` | Line 33 | No (hardcoded) |
| `SECTION_PATTERNS` | 16 regex patterns | Lines 41-72 | No (hardcoded) |
| Running header threshold | Frequency-based detection | Hardcoded heuristic | No |

**Section Detection Patterns (16 total):**

The rechunker recognizes the following structural patterns in legal markdown:

| Pattern Type | Example | Regex ID |
|-------------|---------|----------|
| Markdown headers | `## Section Title` | `md_header` |
| English chapters | `**Chapter 5:** Title` | `chapter_en` |
| Portuguese chapters | `**Capitulo X** Title` | `capitulo_pt` |
| All-caps CHAPTER | `CHAPTER 5 Title` | `chapter_caps` |
| All-caps CAPITULO | `CAPITULO X` | `capitulo_caps` |
| Titulo (title/book) | `TITULO VI` | `titulo` |
| Parte (part) | `PARTE GERAL` | `parte` |
| English Part | `Part One` | `part_en` |
| Legal article | `Art. 481.` or `### Art. 481` | `artigo` |
| Portuguese section | `Secao I` | `secao` |
| English section | `Section X` | `section_en` |
| Numbered caps | `1. TITULO EM MAIUSCULAS` | `numbered_caps` |
| Numbered bold | `**1.** Title` | `numbered_bold` |
| All-caps title line | `RESPONSABILIDADE CIVIL OBJETIVA` | `allcaps_title` |
| Bold caps title | `**SOME TITLE HERE**` | `bold_caps_title` |

:::note
Patterns are evaluated in order. The first match wins. This means markdown headers (`## Title`) take priority over all other patterns.
:::

**Chunking Rules (hardcoded, not configurable):**

- Footnotes are grouped with their parent paragraph
- Law articles + commentary are never separated
- Practical examples stay with the principle they illustrate
- Running headers (repeated title/author) are filtered by frequency
- Bibliographies are extracted as separate chunks with type `"bibliografia"`
- Prefaces, acknowledgments, cataloging cards are filtered as noise

---

### enrich_chunks.py -- Metadata Enrichment

| Setting | Value | Location | Configurable |
|---------|-------|----------|--------------|
| `MINIMAX_BASE_URL` | `"https://api.minimax.io/anthropic"` | Line 30 | No (hardcoded) |
| `MINIMAX_MODEL` | `"MiniMax-M2.5"` | Line 31 | No (hardcoded) |
| `WORKERS` | `5` | Line 34 | No (hardcoded) |
| `DELAY_BETWEEN_REQUESTS` | `0.5` seconds | Line 35 | No (hardcoded) |
| `PROMPT_PATH` | `pipeline/enrich_prompt.md` | Line 27 | No (hardcoded) |

:::danger[Missing prompt file]
`enrich_prompt.md` is referenced at line 27 but is **not present in the repository**. This means enrichment cannot be run on new chunks until the prompt is recovered or reconstructed. This is tracked as mitigation action M01 (P0 priority).
:::

**Enrichment Metadata Fields:**

The LLM classifies each chunk into these structured fields:

| Field | Type | Description | Example values |
|-------|------|-------------|----------------|
| `categoria` | string | High-level category | `"doutrina"`, `"legislacao_comentada"` |
| `instituto` | list[string] | Legal institutes | `["boa-fe objetiva", "exceptio non adimpleti"]` |
| `tipo_conteudo` | string | Content type | `"definicao"`, `"requisitos"`, `"exemplo"`, `"critica"` |
| `fase` | string | Procedural phase | `"formacao"`, `"execucao"`, `"extincao"` |
| `ramo` | string | Branch of law | `"civil"`, `"processual_civil"`, `"empresarial"` |
| `fontes_normativas` | list[string] | Statutory references | `["CC art. 476", "CPC art. 300"]` |

---

### embed_doutrina.py -- Embedding Generation

| Setting | Value | Location | Configurable |
|---------|-------|----------|--------------|
| `MODEL_NAME` | `"rufimelo/Legal-BERTimbau-sts-base"` | Line 24 | No (hardcoded) |
| Embedding dimensions | 768 | Model-determined | No |
| `BATCH_SIZE` | `32` | Line 25 | No (hardcoded) |
| `MAX_TOKENS` | `512` | Line 26 | No (hardcoded, BERTimbau limit) |
| Normalization | `True` | Hardcoded | No |

**Text Composition Template:**

Embeddings are generated from a composed text, not the raw chunk body:

```
[categoria | instituto_1, instituto_2 | tipo_conteudo | titulo | corpo_truncado_at_512_tokens]
```

:::caution
If enrichment metadata is incorrect (see PREMORTEM PF01), the composed text will contain wrong information, causing the embedding to represent something other than the actual chunk content. The model's 512-token limit means the body is silently truncated.
:::

**Output Files:**

| File | Contents |
|------|----------|
| `embeddings_{area}.json` | 768-dim vectors per chunk, normalized |
| `search_corpus_{area}.json` | Chunk text + metadata for display |
| `bm25_index_{area}.json` | Pre-tokenized terms for BM25 ranking |

---

### search_doutrina_v2.py -- Hybrid Search

| Setting | Value | Location | Configurable |
|---------|-------|----------|--------------|
| `semantic_weight` | `0.7` | Line 163 (function default) | Yes, via `/weight` in interactive mode |
| BM25 `k1` | `1.5` | Line 126 | No (hardcoded) |
| BM25 `b` | `0.75` | Line 126 | No (hardcoded) |
| Default `top_k` | `5` | Line 263 | Yes, via `--top` CLI arg or `/top` command |

**Search Modes (interactive):**

| Command | Mode | Description |
|---------|------|-------------|
| `/hybrid` | Hybrid (default) | `semantic_weight * cosine + (1 - semantic_weight) * BM25` |
| `/sem` | Semantic only | Pure cosine similarity on embeddings |
| `/bm25` | BM25 only | Pure keyword ranking |
| `/area contratos` | Area filter | Restrict search to a specific legal area |
| `/filtro instituto=X` | Metadata filter | Filter by enrichment metadata field |
| `/verbose` | Verbose output | Show full chunk text in results |
| `/top N` | Top-K | Change number of results returned |

**BM25 Parameters Explained:**

- `k1 = 1.5` -- Controls term frequency saturation. Higher values give more weight to repeated terms. Standard range: 1.2-2.0.
- `b = 0.75` -- Controls document length normalization. `b = 1.0` means full normalization; `b = 0.0` means no normalization. Standard value for general text.

:::note
BM25 document frequencies are recalculated on every query (O(N * T) complexity). This is a known performance issue tracked in PREMORTEM RT06. Pre-computation is planned for mitigation action M13.
:::

---

## Knowledge Base Settings

These conventions are defined in `CLAUDE.md` and enforced manually:

### Frontmatter Schema

**MOC files** require:

```yaml
---
type: moc
domain: civil          # legal domain
description: "..."     # brief description
---
```

**Chunk files** require:

```yaml
---
knowledge_id: "contratos-orlando-gomes-cap05-001"
tipo: chunk
titulo: "Exceptio non adimpleti contractus"
livro_titulo: "Contratos"
autor: "Orlando Gomes"
area_direito: civil
status_enriquecimento: completo  # or "pendente" or "lixo"
instituto: ["exceptio non adimpleti contractus"]
tipo_conteudo: definicao
ramo: civil
---
```

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| MOC | `MOC_{DOMAIN}.md` | `MOC_CIVIL.md` |
| Book directory | `{author}-{title}` (slugified) | `contratos-orlando-gomes/` |
| Chunk file | `chunk_{NNN}.md` | `chunk_001.md` |

### Link Format

Always use Obsidian-style wikilinks for internal references:

```markdown
[[MOC_CIVIL]]           # correct
[MOC Civil](mocs/MOC_CIVIL.md)  # incorrect — never use relative markdown links
```

---

## Configuration Roadmap

Current settings are scattered across 5 scripts as hardcoded constants. The roadmap includes several steps toward centralized configuration:

| Milestone | Feature | What changes |
|-----------|---------|--------------|
| v0.2 | F22 | All paths use `os.environ.get()` with consistent fallbacks |
| v0.2 | F23 | Shared settings extracted to `pipeline/utils.py` |
| v0.3 | F31 | `Makefile` with configurable targets (`make pipeline`, `make test`) |
| v0.3 | F32 | `ruff` linter configuration |

> **Planned Feature** -- A centralized `config.yaml` or `pyproject.toml` for all pipeline settings is under consideration but not yet on the roadmap. Currently, editing source files is the only way to change most parameters.
