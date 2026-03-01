---
title: Testing
description: Current testing status and the planned testing strategy for Douto.
lang: en
sidebar:
  order: 3
---

# Testing

Current testing status and the planned testing strategy for Douto.

## Current State

:::danger[Zero test coverage]
Douto has **no automated tests**. There is no test framework configured, no test directory, no CI/CD pipeline running tests. The test coverage is **0%**.

This is the #1 technical debt item identified in the PREMORTEM (RT04). The most complex script in the pipeline (`rechunk_v3.py` -- 890 lines, 16 regex patterns, 5 processing passes) has no test coverage at all. Any refactoring risks introducing silent regressions that can only be detected by manual inspection of thousands of chunks.
:::

## Planned Testing Strategy

Testing will be introduced in three phases across milestones v0.3 and v0.5.

### Phase 1: Critical Path Tests (v0.3 -- F26)

**Framework:** pytest
**Target:** `rechunk_v3.py` -- the most complex and fragile component

Priority functions to test:

| Function | Lines | Why it's critical |
|----------|-------|-------------------|
| `smart_split()` | ~200 | The 5-pass chunking algorithm. Core of the entire pipeline. |
| `detect_section()` | ~20 | Uses 16 regex patterns to identify legal document structure. Wrong detection = wrong chunk boundaries. |
| `classify_title()` | ~50 | Distinguishes content from noise, bibliography, summary, and running headers. False positives lose real content. |
| `aggregate_footnotes()` | ~30 | Groups footnotes with parent paragraphs. Broken grouping = orphaned footnotes. |
| `detect_tail()` | ~20 | Identifies trailing content (bibliography, index). Misdetection = bibliography mixed with content. |
| `classify_block_content()` | ~40 | Classifies blocks as example, table, characteristics, law_article, or bibliography. |

**Test fixtures:** Real markdown samples from legal books (anonymized if needed to avoid IP concerns).

**Minimum acceptance:** At least one test per function above, covering both the happy path and at least one edge case.

### Phase 2: Utility Tests (v0.3 -- F27)

**Target:** Shared functions (currently duplicated, to be extracted to `utils.py` in F23)

| Function | Edge cases to cover |
|----------|-------------------|
| `parse_frontmatter()` | Values with colons (`titulo: "Codigo Civil: Comentado"`), hash symbols, multiline values, missing frontmatter, malformed YAML |
| `slugify()` | Unicode characters, accented letters, special characters, collision-prone inputs (e.g., "Contratos - Vol. 1" vs. "Contratos - Vol 1") |
| `extract_json()` | Valid JSON in markdown code blocks, JSON with extra text around it, malformed JSON, nested objects |
| `compose_embedding_text()` | Missing metadata fields, empty body, very long text (truncation at 512 tokens) |

### Phase 3: Search Quality Tests (v0.5 -- F40)

**Target:** End-to-end search quality evaluation

| Component | What to measure |
|-----------|----------------|
| **Evaluation set** | 30+ queries with expected result chunks (manually curated) |
| **recall@5** | What fraction of expected results appear in top 5? |
| **recall@10** | What fraction appear in top 10? |
| **nDCG** | Are the most relevant results ranked highest? |
| **Regression detection** | Before/after comparison when pipeline changes (new model, new prompt, rechunking) |

This phase also includes metadata quality validation (M06):
- Sample 200 random chunks
- Verify `instituto`, `tipo_conteudo`, `ramo` against actual content
- Establish accuracy baseline
- **Quality gate:** if accuracy < 85%, halt and re-enrich before proceeding

## How to Run Tests

:::note
Tests do not exist yet. The commands below describe the planned workflow after F26/F27 are implemented.
:::

> **Planned Feature** -- Test infrastructure is on the roadmap for v0.3 but not yet implemented.

```bash
# Run all tests
make test
# or directly:
pytest

# Run only pipeline tests
pytest tests/pipeline/

# Run a specific test
pytest -k "test_smart_split"

# Run with coverage report
pytest --cov=pipeline --cov-report=html

# Run with verbose output
pytest -v
```

## How to Write Tests

### Directory Structure (Planned)

```
tests/
├── conftest.py                    # Shared fixtures
├── fixtures/
│   ├── markdown/                  # Sample legal markdown files
│   │   ├── contract_chapter.md
│   │   ├── cpc_commentary.md
│   │   └── bibliography.md
│   ├── frontmatter/               # Frontmatter edge cases
│   │   ├── valid.md
│   │   ├── colon_in_value.md
│   │   └── missing_frontmatter.md
│   └── json/                      # Sample JSON responses
│       ├── enrichment_response.json
│       └── malformed_response.json
├── pipeline/
│   ├── test_rechunk_v3.py
│   ├── test_enrich_chunks.py
│   ├── test_embed_doutrina.py
│   ├── test_search_doutrina.py
│   └── test_utils.py
└── evaluation/
    └── test_search_quality.py     # Phase 3 eval set
```

### Conventions

| Convention | Rule |
|-----------|------|
| File naming | `test_{module}.py` |
| Function naming | `test_{function}_{scenario}()` |
| Fixtures | Place in `tests/fixtures/`, use `pytest` fixture mechanism |
| External APIs | **Always mock.** Never call MiniMax, LlamaParse, or HuggingFace in tests. |
| Assertions | Test behavior and output, not implementation details |
| Independence | Each test must be independent -- no shared mutable state between tests |

### Example Test (Preview)

```python
# tests/pipeline/test_rechunk_v3.py
import pytest
from pipeline.rechunk_v3 import detect_section, classify_title

class TestDetectSection:
    def test_markdown_header(self):
        result = detect_section("## Responsabilidade Civil")
        assert result is not None
        title, ptype = result
        assert ptype == "md_header"
        assert "Responsabilidade Civil" in title

    def test_legal_article(self):
        result = detect_section("**Art. 481.** O vendedor obriga-se...")
        assert result is not None
        title, ptype = result
        assert ptype == "artigo"

    def test_plain_text_not_section(self):
        result = detect_section("Este principio fundamenta a boa-fe objetiva.")
        assert result is None

class TestClassifyTitle:
    def test_bibliography_detection(self):
        assert classify_title("REFERENCIAS BIBLIOGRAFICAS") == "bibliography"
        assert classify_title("Bibliografia") == "bibliography"

    def test_noise_detection(self):
        assert classify_title("Agradecimentos") == "noise"
        assert classify_title("PREFACIO") == "noise"
```

## Test Data

### Creating Fixtures

- Use **real legal markdown** for chunking tests (from the processed corpus)
- **Anonymize** if there are IP concerns -- replace proper names, paraphrase content while preserving structure
- Use **synthetic frontmatter** for parser tests (craft specific edge cases)
- Use **pre-computed small embeddings** for search tests (a few dozen vectors, not the full corpus)
- **Never commit full corpus data** to test fixtures (too large, potential IP issues)

### Evaluation Set Guidelines (Phase 3)

Each entry in the evaluation set should include:

```json
{
  "query": "exceptio non adimpleti contractus requisitos",
  "expected_chunks": ["contratos-orlando-gomes-cap12-003", "contratos-civil-cap08-001"],
  "area": "contratos",
  "notes": "Both chunks define the requirements for the defense"
}
```

Target: at least 30 queries covering:
- Different legal domains (civil, processual, empresarial)
- Different query types (conceptual, specific article, comparative)
- Edge cases (cross-domain concepts like "boa-fe", very specific terms)
