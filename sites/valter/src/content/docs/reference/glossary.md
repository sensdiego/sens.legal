---
title: Glossary
description: Legal domain terms and technical concepts used throughout Valter's documentation and codebase.
lang: en
sidebar:
  order: 1

---

# Glossary

Essential terms from the Brazilian legal domain and Valter's technical architecture. Understanding these terms is critical for working with the codebase and reading the documentation.

## Legal Domain

### A

**Acórdão**
A collegial (collective) court decision, issued by a panel of ministers rather than a single judge. Most STJ decisions indexed by Valter are acórdãos.

### C

**Critério**
A legal criterion or standard applied by the court to decide a case. In the knowledge graph, criteria are nodes that connect multiple decisions applying the same legal test.

### D

**Desembargador**
A justice of a regional court (TRF). Relevant for multi-tribunal expansion in v2.0. Equivalent to "judge" at the appellate level.

**Dispositivo Legal**
A legal provision — a specific article, paragraph, or clause of a statute or regulation cited in a court decision. In the knowledge graph, dispositivos connect decisions that apply the same legal text.

**Divergência**
A disagreement between ministers or turmas on how to apply a legal criterion. Valter's graph analytics can detect and track active divergences, which are valuable for identifying unsettled areas of law.

### E

**Ementa**
The official summary or headnote of a court decision. This is the most commonly indexed text in Valter's corpus. Most of the ~23,400 documents have at least an ementa; fewer have the full text (íntegra).

### F

**Fase**
A procedural phase or stage in a case (e.g., initial petition, defense, judgment). Used in the PROJUDI pipeline for classifying document types within a case file.

### I

**Íntegra**
The full text of a court decision, as opposed to just the ementa (summary). Downloading and indexing íntegras improves search quality and enables deeper analysis.

**IRAC**
Issue, Rule, Application, Conclusion — a standard legal analysis framework. Valter uses IRAC to structure the analysis of court decisions, breaking each into its constituent reasoning steps. Implemented in `models/irac.py`.

### J

**Jurisprudência**
The body of court decisions on a topic. "Case law" in English. Valter's primary domain is STJ jurisprudência on federal law matters.

### M

**Ministro**
A justice of a superior court (STJ, STF). Called "minister" in Portuguese court terminology. Valter tracks minister voting patterns, specializations, and divergences.

**Ministro Relator**
The reporting minister — the justice assigned to a case who writes the decision and presents it to the panel. The relator's identity is a key metadata field for every indexed decision.

### N

**Número de Registro**
The registration number of a decision in the court's internal system. Used as a unique identifier when linking to STJ public records.

### P

**Precedente**
A prior court decision used as the basis for a legal argument. In the knowledge graph, precedent relationships form citation chains that the reasoning engine traverses.

**PROJUDI** (Processo Judicial Digital)
The electronic judicial process system used in Paraná (PR) state courts. Valter has a specific pipeline (`core/projudi_pipeline.py`) for extracting and classifying documents from PROJUDI case files.

### R

**REsp** (Recurso Especial)
A special appeal to the STJ on matters of federal law interpretation. REsps are the most common type of decision in Valter's corpus.

### S

**Seção**
A section of the court, composed of two turmas. The STJ has three sections: 1st Section (1st + 2nd Turma), 2nd Section (3rd + 4th Turma), and 3rd Section (5th + 6th Turma). Sections hear cases when turmas disagree.

**seqDocumento**
The sequential document identifier in STJ's internal system. Used for linking directly to specific decisions on the STJ portal.

**STF** (Supremo Tribunal Federal)
Brazil's Supreme Federal Court. Handles constitutional matters. Planned for v2.0 multi-tribunal expansion.

**STJ** (Superior Tribunal de Justiça)
Brazil's Superior Court of Justice. Responsible for unifying the interpretation of federal law. Valter's primary and currently only data source.

**Súmula**
A binding legal summary issued by a superior court (STJ or STF) that consolidates the court's understanding on a specific legal question. Súmulas are numbered (e.g., Súmula 123/STJ) and carry significant precedential weight.

### T

**TRF** (Tribunal Regional Federal)
Federal Regional Courts at the appellate level. Brazil has six TRFs. Planned as the first expansion target in v2.0.

**TST** (Tribunal Superior do Trabalho)
The Superior Labor Court. Handles labor law appeals. Planned for v2.0.

**Turma**
A panel or division of ministers that hears cases. The STJ has six turmas. Each minister belongs to one turma. Turma assignment affects which cases a minister hears and can reveal patterns in voting behavior.

---

## Technical Terms

### A

**ARQ** (Async Redis Queue)
A Python library for background job processing using Redis as a broker. Valter uses ARQ for asynchronous ingestion tasks in `workers/`.

### B

**BM25** (Best Matching 25)
A probabilistic text ranking algorithm used for lexical (keyword-based) search. One of two retrieval strategies in Valter's hybrid search, alongside semantic vector search.

### C

**Canary Rollout**
A deployment strategy where a small percentage of traffic is gradually routed to a new system to validate it before full migration. Applied to R2 artifact storage in `stores/artifact_storage.py`.

**Circuit Breaker**
A resilience pattern that stops calling a failing service after repeated failures, allowing it to recover. Planned for v1.1 to prevent Neo4j hangs from blocking all requests.

**Cross-Encoder**
A neural model that jointly encodes a query and a document together for fine-grained relevance scoring. Used in the reranking stage of search, after initial retrieval by BM25 and semantic search.

### D

**Dual-Vector**
An encoding strategy that creates separate embeddings for facts and legal thesis within a document, enabling more targeted retrieval. Implemented in `core/dual_vector_retriever.py`.

### F

**FRBR** (Functional Requirements for Bibliographic Records)
A conceptual model for bibliographic records, adapted as the ontology for Valter's Neo4j knowledge graph. Structures how decisions, provisions, and concepts relate to each other.

### K

**KG Boost** (Knowledge Graph Boost)
A relevance boost applied to search results based on their connectivity in the Neo4j knowledge graph. Documents with more citations, shared criteria, and graph connections receive higher scores. Configurable via `VALTER_KG_BOOST_BATCH_ENABLED`.

### M

**MCP** (Model Context Protocol)
An open standard for LLM-to-tool integration. Allows language models like Claude and ChatGPT to use external tools through structured tool definitions with JSON Schema. Valter supports two MCP transports: stdio (local, for Claude Desktop) and HTTP/SSE (remote, for ChatGPT and other consumers).

### R

**RRF** (Reciprocal Rank Fusion)
A method for combining ranked lists from different retrieval strategies into a single ranking. Valter uses RRF to merge BM25 lexical results with semantic vector results, producing a hybrid ranked list.

### S

**structlog**
A structured logging library for Python. Valter uses structlog for JSON-formatted logs with request-scoped `trace_id` for tracing requests across the system.
