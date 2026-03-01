---
title: "Feature: Maps of Content (MOCs)"
description: "How MOC files catalog legal books by domain with structured metadata, processing status, and corpus statistics across 8 legal domains."
lang: en
sidebar:
  order: 2
---

# Maps of Content -- MOCs (F09, F10, F11, F19)

`knowledge/mocs/MOC_*.md` -- The second layer of the skill graph. Each MOC catalogs all books within a legal domain, organizing them by sub-topic with wikilinks to book entries, processing statistics, and cross-domain connections.

## What MOCs Are

A Map of Content (MOC) is a curated index file that serves as the entry point for a specific legal domain. Unlike a flat list, MOCs organize books thematically (e.g., "Doutrina Brasileira", "Drafting e Redacao Contratual", "Doutrina Internacional") so researchers can navigate by sub-topic rather than alphabetically.

Each MOC answers three questions:
1. **What books do we have** in this domain?
2. **How are they organized** thematically?
3. **What other domains** does this one connect to?

## MOC Format

All MOCs follow a standard structure defined in `CLAUDE.md`:

### Frontmatter

```yaml
---
type: moc
domain: civil
description: Direito Civil — teoria geral dos contratos, obrigacoes,
             responsabilidade civil, interpretacao contratual
key_authors: [Orlando Gomes, Fabio Ulhoa Coelho, Pontes de Miranda,
              Melvin Eisenberg]
total_obras: 35
total_chunks: ~9365
---
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | `str` | Always `"moc"` |
| `domain` | `str` | Domain identifier (matches INDEX_DOUTO.md) |
| `description` | `str` | Brief description of the domain coverage |
| `key_authors` | `list[str]` | Principal authors in the domain |
| `total_obras` | `int` | Number of cataloged books |
| `total_chunks` | `str` | Approximate chunk count (prefixed with `~`) |
| `key_legislation` | `list[str]` | Key statutes (used in MOC_CONSUMIDOR) |

### Content Structure

```markdown
# Domain Title

Brief description of the domain and its focus.

## Sub-topic 1
- [[book-slug]] — Author, brief description

## Sub-topic 2
- [[book-slug]] — Author, brief description

## Conexoes
- -> [[MOC_OTHER]] (relationship description)
```

Books are referenced via wikilinks (`[[book-slug]]`) that resolve to book directories in the vault staging area.

---

## Active MOCs

### MOC_CIVIL.md (F09)

**File:** `knowledge/mocs/MOC_CIVIL.md`

| Property | Value |
|----------|-------|
| Books cataloged | 35 |
| Approximate chunks | ~9,365 |
| Key authors | Orlando Gomes, Fabio Ulhoa Coelho, Pontes de Miranda, Melvin Eisenberg |
| Status | Active -- largest by book count |

The largest MOC by number of books. Organized into 5 thematic sub-sections:

| Sub-section | Books | Coverage |
|-------------|-------|----------|
| Doutrina Brasileira | 8 | Orlando Gomes, Fabio Ulhoa Coelho, factoring, opcoes, GVLaw, compilacoes |
| Doutrina Internacional -- Teoria | 14 | Chitty on Contracts, Anson's Law, McKendrick, Eisenberg, Benson, Singh, choice of law |
| Interpretacao e Hermeneutica | 3 | Contract interpretation, Scalia, UNIDROIT Principles |
| Drafting e Redacao Contratual | 8 | Kenneth Adams, Fontaine (international), copyright drafting, legal writing |
| Gestao e Negociacao Contratual | 5 | IACCM, contract management, financial elements, negotiation |

**Cross-domain connections:**
- MOC_EMPRESARIAL (contratos empresariais, venture capital)
- MOC_PROCESSUAL (cumprimento de sentenca, execucao contratual)
- MOC_COMPLIANCE (smart contracts, legal tech)

### MOC_PROCESSUAL.md (F10)

**File:** `knowledge/mocs/MOC_PROCESSUAL.md`

| Property | Value |
|----------|-------|
| Books cataloged | 8 |
| Approximate chunks | ~22,182 |
| Key authors | Nelson Nery Jr., Wambier, Marinoni, Mitidiero, Arenhart |
| Status | Active -- largest by chunk count |

The largest MOC by chunk count. CPC commentaries are massive multi-volume works that produce many chunks per book. Organized into 4 sub-sections:

| Sub-section | Books | Coverage |
|-------------|-------|----------|
| CPC Comentado | 2 | Gaio Jr./Cleyson Mello, Nelson Nery Jr./Rosa Maria Nery |
| Teoria Geral do Processo | 2 | Wambier vol. 1, Marinoni/Mitidiero vol. 1 |
| Cognicao e Procedimento Comum | 2 | Wambier vol. 2, Marinoni et al. vol. 2 |
| Procedimentos Diferenciados e Tutelas | 1 | Marinoni et al. vol. 3 |
| Estrategia Processual | 1 | Serie GVLaw |

**Cross-domain connections:**
- MOC_CIVIL (direito material subjacente)
- MOC_CONSUMIDOR (inversao do onus, tutelas de urgencia em consumo)

### MOC_EMPRESARIAL.md (F11)

**File:** `knowledge/mocs/MOC_EMPRESARIAL.md`

| Property | Value |
|----------|-------|
| Books cataloged | 7 |
| Approximate chunks | -- <!-- NEEDS_INPUT: total chunk count for empresarial MOC --> |
| Key authors | Paula Forgioni, Doug Cumming |
| Status | Active |

Organized into 4 sub-sections:

| Sub-section | Books | Coverage |
|-------------|-------|----------|
| Venture Capital e Private Equity | 2 | Doug Cumming (international), economic valuation |
| Contratos Empresariais Especializados | 4 | Agile contracts, construction claims, commercial drafting, international contracts |
| Legal Tech | 3 | Smart contracts/blockchain, IT acquisitions, contract design |
| Litigio Comercial | 1 | Fentiman (international commercial litigation) |

:::note
Some book entries in MOC_EMPRESARIAL appear in multiple sub-sections. The total unique books listed in the file is 7, but 10 wikilinks appear because the Legal Tech section overlaps with specialized contracts.
:::

**Cross-domain connections:**
- MOC_CIVIL (teoria geral dos contratos)
- MOC_COMPLIANCE (governanca, LGPD em contratos tech)

---

## Placeholder MOC

### MOC_CONSUMIDOR.md (F19)

**File:** `knowledge/mocs/MOC_CONSUMIDOR.md`

| Property | Value |
|----------|-------|
| Books cataloged | 0 |
| Approximate chunks | 0 |
| Key legislation | CDC (Lei 8.078/90) |
| Status | In Progress (~10%) -- placeholder with structure only |

The file exists with the correct frontmatter and section structure but no books have been cataloged:

```markdown
## Fundamentos
(a preencher -- relacao de consumo, principios do CDC)

## Responsabilidade Civil
(a preencher -- fato/vicio do produto/servico)

## Praticas Abusivas
(a preencher -- clausulas abusivas, publicidade enganosa)
```

**Cross-domain connections (defined):**
- MOC_CIVIL (responsabilidade civil geral)
- MOC_PROCESSUAL (inversao do onus, tutela de urgencia)

**To complete:** Identify and catalog consumer law books in the existing vault, or process new PDFs through the pipeline.

---

## Planned MOCs

> **Planned Feature** -- These MOCs are on the roadmap (F25, P1, milestone v0.3) but have not been created yet.

| MOC | Domain | Description | Known Books |
|-----|--------|-------------|-------------|
| `MOC_TRIBUTARIO` | Direito Tributario | Obrigacao tributaria, credito tributario, processo administrativo fiscal | <!-- NEEDS_INPUT: any tax law books in the vault? --> |
| `MOC_CONSTITUCIONAL` | Direito Constitucional | Direitos fundamentais, controle de constitucionalidade, hermeneutica constitucional | <!-- NEEDS_INPUT: any constitutional law books in the vault? --> |
| `MOC_COMPLIANCE` | Compliance & Governanca | LGPD, governanca corporativa, due diligence, anticorrupcao | <!-- NEEDS_INPUT: any compliance books in the vault? --> |
| `MOC_SUCESSOES` | Sucessoes & Planejamento Patrimonial | Inventario, testamento, holdings familiares, planejamento sucessorio | <!-- NEEDS_INPUT: any succession law books in the vault? --> |

:::tip
Even without books to catalog, creating placeholder MOCs (like `MOC_CONSUMIDOR.md`) is valuable because it completes the navigational structure in `INDEX_DOUTO.md` and makes the domain visible to agents and scripts that traverse the knowledge base.
:::

---

## How to Add a New MOC

### Step 1: Create the MOC file

Create `knowledge/mocs/MOC_{DOMAIN}.md` with the standard frontmatter:

```yaml
---
type: moc
domain: {domain_id}
description: {brief description of the domain}
key_authors: []
total_obras: 0
total_chunks: 0
---
```

### Step 2: Add section structure

Define thematic sub-sections relevant to the domain. Use other MOCs as templates.

### Step 3: Catalog existing books

If books for this domain already exist in the vault (processed and enriched), add wikilinks:

```markdown
## Sub-topic
- [[book-slug]] — Author, brief description
```

### Step 4: Link from INDEX_DOUTO.md

Verify that `INDEX_DOUTO.md` already has a wikilink `[[MOC_{DOMAIN}]]` pointing to the new file. All 8 domains are already listed in the index.

### Step 5: Process new books (if needed)

For new PDFs:

```bash
# Place PDF in staging
cp new-book.pdf $VAULT_PATH/Knowledge/_staging/input/

# Run the full pipeline
python3 pipeline/process_books.py
python3 pipeline/rechunk_v3.py
python3 pipeline/enrich_chunks.py all
python3 pipeline/embed_doutrina.py
```

Then add the book entry to the MOC file and update `total_obras` and `total_chunks` in the frontmatter.

---

## Corpus Statistics Summary

| MOC | Books | Chunks | % of Total Chunks |
|-----|-------|--------|-------------------|
| MOC_CIVIL | 35 | ~9,365 | ~30% |
| MOC_PROCESSUAL | 8 | ~22,182 | ~70% |
| MOC_EMPRESARIAL | 7 | -- | -- |
| MOC_CONSUMIDOR | 0 | 0 | 0% |
| **Total (active)** | **50** | **~31,547** | **100%** |

:::note
The chunk count disparity between Civil (35 books, ~9K chunks) and Processual (8 books, ~22K chunks) reflects the nature of the source material: CPC commentaries are massive multi-volume works where each article generates multiple chunks, while contract law textbooks are typically shorter and more focused.
:::
