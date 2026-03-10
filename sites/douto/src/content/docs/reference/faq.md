---
title: FAQ
description: Frequently asked questions about Douto — for developers, lawyers, and stakeholders.
lang: en
sidebar:
  order: 2
---

# Frequently Asked Questions

Answers to common questions about Douto, organized by audience.

---

## For Developers

### How do I add a new book to the corpus?

Run the full pipeline sequentially. Place the PDF in the staging input directory, then execute each step:

```bash
# 1. Place PDF in input directory
cp livro.pdf $VAULT_PATH/Knowledge/_staging/input/

# 2. Extract PDF to markdown
python3 pipeline/process_books.py livro.pdf

# 3. Chunk the markdown
python3 pipeline/rechunk_v3.py slug-of-book

# 4. Enrich chunks with metadata
python3 pipeline/enrich_chunks.py slug-of-book

# 5. Generate embeddings
python3 pipeline/embed_doutrina.py

# 6. Verify with a search
python3 pipeline/search_doutrina_v2.py "query from the book" --area contratos
```

:::caution
Step 4 requires `enrich_prompt.md`, which is currently **missing from the repository**. You cannot enrich new chunks until it is recovered (mitigation M01). Steps 1-3 and 5-6 work without it if chunks are manually enriched.
:::

### Why doesn't the pipeline run on my machine?

The most common cause is **hardcoded paths**. Two of the five scripts (`process_books.py` and `rechunk_v3.py`) have absolute paths from the creator's machine baked into the source code:

- `process_books.py` line 27: `/home/sensd/.openclaw/workspace/vault`
- `rechunk_v3.py` line 29: `/mnt/c/Users/sensd/vault`

**Workaround:** Edit the `VAULT_PATH` line in each script to point to your local vault path.

**Permanent fix:** F22 (v0.2) will standardize all scripts to use `os.environ.get("VAULT_PATH")`.

See [Environment Variables](/docs/configuration/environment/) for the full variable reference.

### Why is there no database?

Douto stores embeddings and search indices as flat JSON files. This was the simplest approach for a single-machine prototype. The trade-offs:

| Flat JSON (current) | Vector DB (planned) |
|---------------------|---------------------|
| No infrastructure needed | Requires Qdrant/FAISS setup |
| Simple to debug (human-readable) | Binary/opaque storage |
| Full load into memory per query | Indexed, sub-second queries |
| ~2 GB for 31,500 chunks | Compact, scalable storage |
| Does not scale past ~100 books | Scales to millions of vectors |

Migration to a vector DB (likely Qdrant, since Valter already uses it) is planned for v0.4 (mitigation M12).

### Why MiniMax M2.5 instead of Claude for enrichment?

Cost. Enriching 31,500 chunks with a classification prompt requires significant token throughput. MiniMax M2.5 is substantially cheaper than Claude for this batch workload. The trade-off is quality -- MiniMax is a generic model, not fine-tuned for Brazilian law.

This is an open decision (D06). Options under evaluation:

| Option | Cost | Quality | Dependency |
|--------|------|---------|------------|
| MiniMax M2.5 (current) | Low | Unknown (unvalidated) | Fragile SDK hack |
| Claude | Higher | Likely better | Ecosystem-consistent |
| Local model | Zero | Unknown | Setup complexity |

### Can I use a different embedding model?

Technically yes, but it requires **re-embedding the entire corpus** (~31,500 chunks). The model is hardcoded in `embed_doutrina.py` (line 24) and `search_doutrina_v2.py` (line 24) as `rufimelo/Legal-BERTimbau-sts-base`.

Important considerations:
- All existing embeddings become incompatible (different vector space)
- Search quality may improve or degrade -- there is no benchmark comparison yet (planned in F40)
- The current model was trained on Portuguese (PT-PT) legal text, which may not be optimal for Brazilian legal terminology

### Where is the enrichment prompt?

:::danger[Critical missing file]
`enrich_prompt.md` is referenced in `enrich_chunks.py` at line 27 (`Path(__file__).parent / "enrich_prompt.md"`) but **does not exist in the repository**. It was lost during migration from the original Obsidian vault.

This means:
- Enrichment cannot be run on new chunks
- The prompt that generated metadata for 31,500 existing chunks is not version-controlled
- If chunks need re-enrichment, the exact same results cannot be reproduced

Recovery is priority M01 (P0) in the roadmap mitigation plan. Options: locate in vault history, reconstruct from MiniMax API logs, or reverse-engineer from existing enriched chunks.
:::

### How do I contribute tests?

This is the highest-impact contribution you can make. Douto has 0% test coverage.

1. Create a `tests/` directory structure (see [Testing](/docs/development/testing/))
2. Add `pytest` to the development dependencies
3. Start with `rechunk_v3.py` functions: `detect_section()`, `classify_title()`, `smart_split()`
4. Use real markdown snippets from legal books as fixtures
5. Mock all external API calls (MiniMax, LlamaParse, HuggingFace)

See the [Testing](/docs/development/testing/) page for the full planned strategy and example tests.

---

## For Users (Lawyers)

:::note
Douto does not have a user-facing interface yet. These questions anticipate the future integrated experience via Juca/Valter.
:::

### What legal domains does Douto cover?

Currently, three domains have populated content:

| Domain | Books | Chunks | Coverage |
|--------|-------|--------|----------|
| Direito Civil | 35 | ~9,365 | Contracts, obligations, civil liability, property |
| Direito Processual Civil | 8 | ~22,182 | CPC commentary, general theory, procedures |
| Direito Empresarial | 7 | -- | Venture capital, smart contracts, commercial litigation |

**Gaps:** Direito do Consumidor has a placeholder MOC. Tributario, Constitucional, Compliance, and Sucessoes have no content at all. If you search for a topic in an uncovered domain, you will get empty results.

### How accurate are the search results?

**Honest answer: we do not know.** There is no evaluation set, no accuracy benchmark, and no human validation of search quality.

What we do know:
- The hybrid search combines semantic similarity (meaning) with keyword matching (exact terms)
- Results are ranked by a combined score (70% semantic, 30% keyword by default)
- Metadata filters (by instituto, ramo, tipo) depend on the enrichment quality, which has not been validated

Quality measurement is planned for v0.2.5 (validation of 200 chunks) and v0.5 (formal eval set with 30+ queries).

### Can I trust the citations?

**With caution.** Citations include the book title, author, and chapter, but **not page numbers**. There are known risks:

- **Chunking errors** -- the chunk boundary may not align with the chapter boundary in the original book, leading to misattribution (e.g., citing Chapter 5 when the content is from Chapter 4)
- **Quotation nesting** -- legal authors frequently quote other authors at length. A chunk may be attributed to the book's author when the content is actually a quotation from another scholar
- **No edition tracking** -- if a newer edition of a book is processed, old chunks remain in the index. You may receive citations from an outdated edition

**Recommendation:** Always verify doctrinal citations against the original source before using them in legal documents.

### Will this replace legal research?

No. Douto is a search and retrieval tool, not a replacement for legal analysis. It helps you find relevant doctrinal passages faster, but:

- The corpus is limited (~50 books, not comprehensive)
- Metadata may contain errors
- No system can replace a lawyer's judgment about relevance and applicability
- The tool does not understand the nuances of your specific case

---

## For Stakeholders

### What is the competitive advantage?

Douto's differentiator is **structured metadata on Brazilian legal doctrine**. Each of the ~31,500 chunks is classified with its legal institute, content type, procedural phase, branch of law, and statutory references. This enables filtered semantic search that generic legal search engines cannot do.

No competitor currently offers this level of structured access to Brazilian legal textbooks.

### What is the IP situation?

:::note[Corpus status]
The current product position is that the books used by Douto were properly acquired. Old code references that suggest otherwise should be treated as stale implementation residue, not as the current operational policy.

The real operational risk is different: corpus provenance and licensing evidence should remain organized enough to support future audit, replacement, or expansion without ambiguity.
:::

### What is the timeline to production?

The roadmap is now framed as delivery gates, not as an API-first sequence:

| Stage | What it enables |
|-------|------------------|
| 1. Reproducible foundation | Prompt, paths, CLI, and install become stable enough to rerun the pipeline safely |
| 2. Measurable quality | Contracts and civil procedure gain annotated samples and retrieval evaluation |
| 3. Valter delivery contract | Douto artifacts become explicit, versioned, and consumable by Valter |
| 4. Explainable retrieval | Doctrine results become traceable, ambiguity-aware, and operationally reliable |
| 5. Gated synthesis | Valter can consume doctrinal briefs only after evidence quality passes a defined bar |

**Caveats:**
- The work is still maintained in a small-team context
- Precision is preferred over forcing delivery
- No large product surface should be built before retrieval quality and artifact contracts are stable

### How much does it cost to run?

| Component | Cost type | Estimate |
|-----------|-----------|----------|
| LlamaParse | Per-PDF, one-time | ~$0.01-0.10 per book (cost_effective tier) |
| MiniMax M2.5 | Per-chunk enrichment | Low (exact pricing varies) |
| Legal-BERTimbau | Free (open source model) | $0 |
| Compute | CPU/GPU for embeddings | Local machine, no cloud cost |
| Storage | JSON files | ~2 GB for current corpus |

<!-- NEEDS_INPUT: Exact MiniMax M2.5 pricing per token is not documented in the codebase. The creator may have this information. -->

### What happens if the solo developer is unavailable?

This is identified as risk RE01 (highest probability in the PREMORTEM). Currently:

- The pipeline runs only on the developer's machine
- The enrichment prompt is not in the repository
- Dependencies are unpinned
- There are no tests and no CI/CD
- Documentation is in progress (these docs)

The v0.2 and v0.3 milestones specifically address this bus-factor risk by making the project portable and contributable. Until those milestones are completed, another developer would face significant onboarding friction.
