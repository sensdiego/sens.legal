---
title: External Integrations
description: Setup and configuration for LlamaParse, MiniMax M2.5, HuggingFace, and the sens.legal ecosystem.
lang: en
sidebar:
  order: 3
---

# External Integrations

How Douto connects to external services and the sens.legal ecosystem.

## LlamaParse (PDF Extraction)

**Service:** [LlamaParse](https://cloud.llamaindex.ai/) by LlamaIndex
**Purpose:** Convert legal PDF textbooks into structured markdown
**Used by:** `process_books.py`
**Auth:** `LLAMA_CLOUD_API_KEY` environment variable (loaded implicitly by the SDK)

### Setup

1. Create a free account at [cloud.llamaindex.ai](https://cloud.llamaindex.ai/).
2. Generate an API key from the dashboard.
3. Set the environment variable:

```bash
export LLAMA_CLOUD_API_KEY="llx-your-key-here"
```

### Tiers

LlamaParse offers three processing tiers. The default in Douto is `cost_effective`:

| Tier | Best for | Speed | Cost |
|------|----------|-------|------|
| `agentic` | Scanned PDFs, complex tables, multi-column layouts | Slowest | Highest |
| `cost_effective` | Clean-text legal textbooks (default) | Medium | Medium |
| `fast` | Simple text-only documents | Fastest | Lowest |

Override the tier per run:

```bash
python3 pipeline/process_books.py --tier agentic livro.pdf
```

### Usage Notes

- PDF extraction is a **one-time operation** per book. Once converted to markdown, the original PDF is not needed again by the pipeline.
- Processed markdown is saved to `$VAULT_PATH/Knowledge/_staging/processed/{slug}/`.
- If extraction fails, the PDF is moved to `$VAULT_PATH/Knowledge/_staging/failed/`.
- LlamaParse uses `asyncio` internally. This is the only async component in the pipeline.

:::tip
Since extraction is one-time, even if LlamaParse changes pricing or becomes unavailable, previously extracted books are unaffected. Only processing new books requires an active API key.
:::

---

## MiniMax M2.5 (Chunk Enrichment)

**Service:** MiniMax M2.5 LLM
**Purpose:** Classify chunks with structured legal metadata (instituto, tipo_conteudo, ramo, etc.)
**Used by:** `enrich_chunks.py`
**Auth:** `MINIMAX_API_KEY` environment variable

### Setup

1. Obtain an API key from [MiniMax](https://www.minimax.io/).
2. Set the environment variable:

```bash
export MINIMAX_API_KEY="your-minimax-api-key"
```

### The Anthropic SDK Hack

:::caution[Fragile integration -- not officially supported]
Douto uses the **Anthropic Python SDK** to call MiniMax's API. This works because MiniMax exposes an Anthropic-compatible endpoint, but it is **not an officially documented or supported integration** by either Anthropic or MiniMax.

```python
# From enrich_chunks.py (line 30-31)
MINIMAX_BASE_URL = "https://api.minimax.io/anthropic"
MINIMAX_MODEL = "MiniMax-M2.5"

# The client is instantiated as:
client = anthropic.Anthropic(
    api_key=os.environ["MINIMAX_API_KEY"],
    base_url=MINIMAX_BASE_URL,
)
```

Any change to MiniMax's API compatibility layer, or a breaking change in the Anthropic SDK, will silently break enrichment. There will be no deprecation warning.
:::

### Concurrency Settings

Enrichment runs with 5 concurrent threads and a 0.5-second delay between requests to avoid rate limiting:

| Parameter | Value |
|-----------|-------|
| `WORKERS` | 5 threads |
| `DELAY_BETWEEN_REQUESTS` | 0.5 seconds |
| Model | `MiniMax-M2.5` |

### Missing Prompt File

:::danger
The enrichment prompt file (`enrich_prompt.md`) is referenced in the code at line 27 but is **not present in the repository**. Without this file, `enrich_chunks.py` will exit with an error. Recovering or reconstructing this prompt is tracked as mitigation action M01 (P0 priority).
:::

### Pending Decision: D06

The choice of MiniMax M2.5 as the enrichment model is under review. Options being evaluated:

| Option | Pros | Cons |
|--------|------|------|
| **Keep MiniMax M2.5** | Works, cheap | Fragile SDK hack, generic model |
| Migrate to Claude | Ecosystem consistency | Higher cost |
| Local model | Zero cost, no dependency | Slower, setup complexity |
| Evaluate later | No effort now | Risk compounds |

---

## HuggingFace (Embedding Model)

**Service:** HuggingFace Hub (public model)
**Purpose:** Download and cache the Legal-BERTimbau embedding model
**Used by:** `embed_doutrina.py`, `search_doutrina_v2.py`
**Auth:** None required (public model)

### Model Details

| Property | Value |
|----------|-------|
| Model ID | `rufimelo/Legal-BERTimbau-sts-base` |
| Dimensions | 768 |
| Max tokens | 512 |
| Language | Portuguese (trained on PT-PT legal corpus) |
| Size on disk | ~500 MB |
| License | Open source |

### Setup

The model is **automatically downloaded** on first run by the `sentence-transformers` library. No manual setup is needed.

To pre-download the model (useful for offline environments or Docker):

```bash
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base')"
```

To control where the model is cached:

```bash
export HF_HOME="/path/to/cache"
# or specifically:
export SENTENCE_TRANSFORMERS_HOME="/path/to/cache"
```

:::note
The model was trained on Portuguese (PT-PT) legal text, not specifically Brazilian Portuguese. This may cause minor differences in semantic similarity for BR-specific legal terms (see PREMORTEM PF04). No benchmark comparison against alternatives exists yet (planned in F40).
:::

---

## sens.legal Ecosystem Integration

### Current State

Real integration with the ecosystem currently happens through **artifacts delivered to Valter**:

```
embed_doutrina.py
      |
      v
doctrine artifacts  ─── delivered to ──→  Valter
```

- Valter is the primary consumer.
- There is no mature programmatic delivery yet.
- Rebuilding artifacts is still part of the flow.

### Ecosystem Components

| Component | Role | Stack | Douto's relationship |
|-----------|------|-------|---------------------|
| **Valter** | Ecosystem backend | FastAPI, PostgreSQL, Qdrant, Neo4j, Redis | Douto's primary consumer |
| **Juca** | Indirect interface for lawyers | Next.js | Consumes the final layer through Valter |
| **Leci** | Legislation layer | Next.js, PostgreSQL, pgvector | Complementary source, not a competitor |
| **Joseph** | Coordination/orchestration | -- | Execution context, not Douto's product center |

### Planned Integration

The next step is not “becoming a service”.
The next step is **delivering well to Valter**.

Correct sequence:

1. artifact contract;
2. stable IDs and coverage;
3. explainable retrieval;
4. synthesis with its own gate.

MCP, a dedicated API, or an internal module remain future options, but they should not bypass this sequence.

:::tip
The decision criterion is not “which protocol looks more modern”.
The decision criterion is: which form delivers reliable doctrine to Valter with less risk and less architectural theater.
:::

### Integration Diagram

```mermaid
graph TB
    subgraph "Current"
        ED["embed_doutrina.py"] -->|artifacts| VA1["Valter"]
    end

    subgraph "Next line"
        DT["contract + manifest + explainable retrieval"] --> VA2["Valter"]
        VA2 --> JU["Juca"]
    end

    subgraph "Optional future"
        MCP["Douto MCP/API"] --> VAL["Valter or other consumers"]
    end
```
