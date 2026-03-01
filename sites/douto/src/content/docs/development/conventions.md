---
title: Coding Conventions
description: Coding standards, naming patterns, and architectural conventions for Douto development.
lang: en
sidebar:
  order: 2
---

# Coding Conventions

Standards and patterns for all code and knowledge base contributions to Douto. These are extracted from `CLAUDE.md` and enforced during code review.

## Priority Order

When principles conflict, prioritize in this order:

| Priority | Principle | In Practice |
|----------|-----------|-------------|
| 1 | **Correctness** | Legal data, citations, and metadata must be accurate. A wrong `instituto` classification is worse than a slow query. |
| 2 | **Simplicity & clarity** | Code that another agent (or a human six months from now) understands without context. No clever tricks. |
| 3 | **Maintainability** | Easy to change without breaking. Small functions, clear interfaces, minimal coupling between scripts. |
| 4 | **Reversibility** | Prefer decisions that can be undone. Use `--dry-run`, keep original data, avoid destructive operations. |
| 5 | **Performance** | Only optimize when there is evidence of a problem. Never sacrifice correctness or clarity for speed. |

:::tip
When in doubt, choose the simplest and most reversible option. Propose the minimal approach and explain alternatives with trade-offs. Ask before implementing if requirements are unclear.
:::

## Python Conventions

### Language & Stack

- **Python 3.10+** -- required for modern type hint syntax
- **Type hints** are mandatory on all public functions
- **`async/await`** only where necessary (LlamaParse). The pipeline is mostly synchronous.
- **Testes:** `pytest` (when implemented)
- **Linting:** `ruff` (when configured)

### Style

| Convention | Rule | Example |
|-----------|------|---------|
| Functions/variables | `snake_case` | `parse_frontmatter()`, `chunk_text` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_CHUNK_CHARS`, `MODEL_NAME` |
| Type hints | Modern syntax | `tuple[dict, str]`, not `Tuple[Dict, str]` |
| String formatting | f-strings preferred | `f"Processed {count} chunks"` |
| Imports | stdlib, then third-party, then local, separated by blank lines | See below |
| Line length | Follow `ruff` defaults (when configured) | ~88 characters |

```python
# Import order example
import os
import json
import re
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

from pipeline.utils import parse_frontmatter, slugify
```

### Error Handling

- **Specific exceptions** -- never use broad `except Exception as e`. Catch the specific error type.
- **Log with context** -- include `doc_id`, `chunk_id`, and traceback when logging errors.
- **Fail loudly** -- if a chunk is corrupted, log and skip it rather than silently producing garbage.

:::caution
The current codebase has 4 broad `except Exception` catches (PREMORTEM RT07). New code must not introduce more. Existing ones should be narrowed during refactoring.
:::

### Docstrings

Required for all public functions. Use Google-style format:

```python
def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter and body from a markdown string.

    Args:
        content: Full markdown content with optional frontmatter.

    Returns:
        Tuple of (metadata dict, body text without frontmatter).
        If no frontmatter found, returns ({}, original content).
    """
```

## Pipeline Script Conventions

Every pipeline script must follow these patterns:

### Required Features

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| `--help` | `argparse` | Document CLI usage |
| `--dry-run` | Check before write | Show what would happen without modifying data |
| `--force` | Skip idempotency checks | Reprocess already-completed items |
| Idempotent | Processing markers, skip logic | Safe to re-run without side effects |
| Structured logging | Append to `processing_log.jsonl` | Track successes, errors, skips |

### Path Handling

```python
# CORRECT: use os.environ.get() with documented fallback
VAULT_PATH = Path(os.environ.get("VAULT_PATH", "/default/fallback/path"))

# INCORRECT: hardcoded absolute path
VAULT_PATH = Path("/home/sensd/.openclaw/workspace/vault")

# CORRECT: relative to script location
PROMPT_PATH = Path(__file__).parent / "enrich_prompt.md"
```

:::danger
No hardcoded absolute paths in pipeline scripts. Every path must use `os.environ.get()` or be relative to the script location (`Path(__file__).parent`). This is a pre-commit review checkpoint.
:::

### Output Conventions

- **JSON** for data output (embeddings, corpus, BM25 index)
- **YAML frontmatter** for metadata in markdown chunks
- **JSONL** for structured logs (append-only)
- **Progress** output goes to `stderr`; results go to `stdout`

### Resource Limits

Do not run processes that consume more than 50% CPU locally. For validation:

```bash
python3 pipeline/rechunk_v3.py --limit 5 --dry-run  # test with small subset
```

## Knowledge Base Conventions

### INDEX_DOUTO.md

- **Source of truth** for domains and navigation
- Lists all 8 legal domains with wikilinks to their MOCs
- Must be updated when adding new domains

### MOC Files

Required frontmatter fields:

```yaml
---
type: moc
domain: civil
description: "Obrigacoes, contratos, responsabilidade civil, propriedade"
---
```

### Chunk Files (Enriched)

Required frontmatter fields:

```yaml
---
knowledge_id: "contratos-orlando-gomes-cap05-001"
tipo: chunk
titulo: "Titulo do chunk"
livro_titulo: "Contratos"
autor: "Orlando Gomes"
area_direito: civil
status_enriquecimento: completo  # "completo" | "pendente" | "lixo"
---
```

Rules:
- Chunks with `status_enriquecimento: "completo"` must have `instituto` and `tipo_conteudo` filled
- Never overwrite enriched chunks without explicit `--force`
- Never leave `status_enriquecimento: "pendente"` after enrichment runs
- Use `"lixo"` for noise chunks (prefaces, acknowledgments, catalog cards)

### Links

- **Always** use wikilinks: `[[MOC_CIVIL]]`
- **Never** use relative markdown links: `[text](../mocs/MOC_CIVIL.md)`
- Wikilinks enable Obsidian graph view and backlink tracking

### Encoding

- UTF-8 for all files
- LF line endings (Unix-style)

## Embedding Conventions

| Rule | Detail |
|------|--------|
| Single model | `rufimelo/Legal-BERTimbau-sts-base` (768-dim) |
| Normalization | Always `normalize_embeddings=True` for cosine similarity |
| Text composition | Use `compose_embedding_text()` -- never embed raw chunk text |
| Output naming | `embeddings_{area}.json`, `search_corpus_{area}.json`, `bm25_index_{area}.json` |
| Compatibility | Output must be compatible with Valter/Juca infrastructure |

The composed text format:

```
[categoria | instituto_1, instituto_2 | tipo_conteudo | titulo | corpo]
```

This ensures the embedding captures both the metadata context and the actual content.

## Git Conventions

### Branch Naming

```
feat/SEN-XXX-description    # new feature linked to Linear issue
fix/SEN-XXX-description     # bug fix linked to Linear issue
docs/description            # documentation changes
refactor/description        # code restructuring
```

Append `-claude` for branches created by Claude Code, `-codex` for branches created by Codex.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add bibliography detection to rechunker
fix: handle colons in frontmatter values
docs: update environment variable reference
refactor: extract parse_frontmatter to utils.py
test: add fixtures for smart_split edge cases
chore: pin dependency versions
```

Include the Linear ticket reference when applicable:

```
feat: standardize env vars across pipeline -- SEN-358
```

### Co-Authorship

When commits are produced with AI assistance:

```
Co-Authored-By (execucao): Claude Opus 4.6 <noreply@anthropic.com>
```

The term **(execucao)** indicates the AI assisted with implementation. All conception, architecture, product decisions, and intellectual property belong to the project owner.

### Never Commit

- `.env` files or API keys
- Embedding JSON files (too large, generated artifacts)
- `__pycache__/` directories
- Model weights or HuggingFace cache
- Node modules (if any frontend tooling is added)

## What NOT To Do (Non-Goals)

Do not do any of the following without explicit authorization:

| Non-goal | Reason |
|----------|--------|
| Introduce abstractions without clear need | Simplicity over elegance |
| Add dependencies for problems already solved in the codebase | Minimize dependency surface |
| Refactor working code without a specific issue | If it works, leave it |
| Optimize without evidence of performance problems | Premature optimization is the root of all evil |
| Expand scope beyond the issue being worked on | Stay focused |
| Create API/MCP server before the pipeline is stable | Foundation before features |
| Manage cases (Joseph's job) | Douto's scope is doctrine only |
| Search case law (Juca/Valter's job) | Douto's scope is doctrine only |
| Search legislation (Leci's job) | Douto's scope is doctrine only |
| Manage infrastructure (Valter's job) | Douto is a processing pipeline, not a service |
