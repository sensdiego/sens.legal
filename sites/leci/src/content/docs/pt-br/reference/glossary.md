---
title: "Glossário"
description: "Definições compartilhadas de termos jurídicos e técnicos usados em toda a documentação do Leci."
lang: pt-BR
sidebar:
  order: 1
---


# Glossário

## This glossary standardizes terminology across teams and agents
Consistent terms reduce misunderstandings in legal-data and architecture discussions.

## Legal-domain terms
### Regulation
Top-level legal document entity represented in `regulations`.

### Document node
Hierarchical legal text unit stored in `document_nodes` (article, section, etc.).

### Revision
Audit record of a controlled legal text change stored in `revisions`.

### Suggestion
Proposed correction submitted before or alongside revision application.

## Search and data terms
### Full-text search (FTS)
Lexical search approach backed by PostgreSQL `tsvector` and GIN indexing.

### Embedding
Vector representation of text used for semantic similarity workflows.

### IVFFlat index
Vector index strategy used for approximate nearest-neighbor style retrieval.

## Process terms
### Planned feature
A roadmap-approved capability not yet implemented in current code.

### Unverified
Information that requires explicit owner confirmation before being treated as fact.
