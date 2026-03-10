---
title: "Architecture Diagrams"
description: "Visual diagrams of Douto's architecture, data flow, and ecosystem position in Mermaid."
lang: en
sidebar:
  order: 4
---

# Architecture Diagrams

All visual representations of Douto's architecture, rendered in Mermaid.

## Pipeline Data Flow

The complete five-stage pipeline, showing data formats at each transition:

```mermaid
flowchart TD
    PDF["📄 Legal PDFs"]
    MD["📝 Markdown<br/>(chapters)"]
    CK["📦 Intelligent Chunks<br/>(1,500–15,000 chars)"]
    ECK["🏷️ Enriched Chunks<br/>(+ 13 metadata fields)"]
    EMB["🔢 Embeddings<br/>(768-dim float32)"]
    RES["🔍 Ranked Results"]

    PDF -->|"process_books.py<br/>LlamaParse API"| MD
    MD -->|"rechunk_v3.py<br/>5-pass algorithm"| CK
    CK -->|"enrich_chunks.py<br/>MiniMax M2.5"| ECK
    ECK -->|"embed_doutrina.py<br/>Legal-BERTimbau"| EMB
    EMB -->|"search_doutrina_v2.py<br/>Semantic + BM25"| RES
```

## Component Diagram

All Douto components and their connections to external services and the sens.legal ecosystem:

```mermaid
graph TB
    subgraph "Douto — Pipeline"
        PB["process_books.py<br/>PDF → Markdown"]
        RC["rechunk_v3.py<br/>Chunking (890 lines)"]
        EN["enrich_chunks.py<br/>LLM Classification"]
        EM["embed_doutrina.py<br/>Embedding Generation"]
        SE["search_doutrina_v2.py<br/>Hybrid Search"]
    end

    subgraph "Douto — Knowledge Base"
        IX["INDEX_DOUTO.md<br/>(8 domains)"]
        MC["MOC_CIVIL<br/>35 books, ~9,365 chunks"]
        MP["MOC_PROCESSUAL<br/>8 books, ~22,182 chunks"]
        ME["MOC_EMPRESARIAL<br/>7 books"]
        MCo["MOC_CONSUMIDOR<br/>(placeholder)"]
    end

    subgraph "sens.legal Ecosystem"
        VA["Valter<br/>Backend API<br/>FastAPI + Neo4j + Qdrant"]
        JU["Juca<br/>Frontend Hub<br/>Next.js"]
        LE["Leci<br/>Legislation<br/>Next.js + pgvector"]
    end

    subgraph "External Services"
        LP["LlamaParse API"]
        MM["MiniMax M2.5 API"]
        HF["HuggingFace Hub"]
    end

    PB --> RC --> EN --> EM --> SE
    SE -.->|"JSON files"| VA
    VA --> JU
    IX --> MC & MP & ME & MCo
    PB -.-> LP
    EN -.-> MM
    EM -.-> HF
```

## Ecosystem Position

How Douto fits within the sens.legal platform after the Valter-first realignment:

```mermaid
graph LR
    DO["Douto<br/>Doctrine Layer"]
    VA["Valter<br/>Primary Consumer"]
    JU["Juca<br/>Indirect Interface"]
    LW["Lawyer"]

    DO -->|"artifacts, retrieval,<br/>later synthesis"| VA
    VA --> JU
    JU --> LW
```

## Knowledge Base Hierarchy

The skill graph structure from root to leaf:

```mermaid
graph TD
    IX["INDEX_DOUTO.md<br/>(root)"]

    MC["MOC_CIVIL.md<br/>35 books, ~9,365 chunks ✅"]
    MP["MOC_PROCESSUAL.md<br/>8 books, ~22,182 chunks ✅"]
    ME["MOC_EMPRESARIAL.md<br/>7 books ✅"]
    MCo["MOC_CONSUMIDOR.md<br/>(placeholder) 🔨"]
    MT["MOC_TRIBUTARIO ❌"]
    MCn["MOC_CONSTITUCIONAL ❌"]
    MCp["MOC_COMPLIANCE ❌"]
    MS["MOC_SUCESSOES ❌"]

    ND["nodes/<br/>(atomic notes — planned)"]

    IX --> MC & MP & ME & MCo & MT & MCn & MCp & MS
    MC & MP & ME -.-> ND
```

## Enrichment Metadata Schema

The 13 metadata fields added to each chunk during enrichment:

```mermaid
erDiagram
    CHUNK {
        string knowledge_id
        string titulo
        string livro_titulo
        string autor
        int chunk_numero
        int chunk_total
    }

    ENRICHMENT {
        string categoria
        list instituto
        list sub_instituto
        list tipo_conteudo
        list fase
        string ramo
        list fontes_normativas
        string confiabilidade
        string utilidade
        boolean jurisdicao_estrangeira
        string justificativa
        string status_enriquecimento
        string modelo_enriquecimento
    }

    CHUNK ||--|| ENRICHMENT : "enriched by"
```

Field descriptions:

| Field | Type | Example Values |
|-------|------|---------------|
| `instituto` | `list[str]` | `["exceptio non adimpleti contractus", "contrato bilateral"]` |
| `sub_instituto` | `list[str]` | `["inadimplemento relativo"]` |
| `tipo_conteudo` | `list[str]` | `["definicao", "requisitos", "jurisprudencia_comentada"]` |
| `fase` | `list[str]` | `["formacao", "execucao", "extincao"]` |
| `ramo` | `str` | `"direito_civil"` |
| `fontes_normativas` | `list[str]` | `["CC art. 476", "CC art. 477"]` |
| `confiabilidade` | `str` | `"alta"`, `"media"`, `"baixa"` |
| `categoria` | `str` | `"doutrina"` |

## Search Architecture

How hybrid search combines semantic and keyword scoring:

```mermaid
flowchart LR
    Q["Query"]
    SEM["Semantic Search<br/>(cosine similarity<br/>on 768-dim vectors)"]
    BM["BM25 Search<br/>(keyword matching<br/>k1=1.5, b=0.75)"]
    NORM["Min-Max<br/>Normalization"]
    COMB["Weighted<br/>Combination<br/>(0.7 sem + 0.3 bm25)"]
    FILT["Metadata<br/>Filtering<br/>(instituto, tipo,<br/>ramo, livro, fase)"]
    RES["Ranked<br/>Results"]

    Q --> SEM & BM
    SEM --> NORM
    BM --> NORM
    NORM --> COMB --> FILT --> RES
```

## Next-Line Architecture

What comes next is not an autonomous service by default. It is better delivery to Valter:

```mermaid
graph TB
    subgraph "Douto"
        ART["artifact contract"]
        RET["explainable retrieval"]
        SYN["gated synthesis"]
    end

    subgraph "Consumer"
        VA["Valter"]
    end

    ART --> RET --> SYN --> VA
```

## Optional Future Surface

If and only if the Valter handoff is mature, Douto may later expose an MCP/API surface:

```mermaid
graph LR
    DT["Douto MCP/API"]
    VA["Valter"]
    OC["Other consumers"]

    DT --> VA
    DT --> OC
```
