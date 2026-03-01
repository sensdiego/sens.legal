---
title: Funcionalidades
description: Inventario completo de funcionalidades do Douto — implementadas, em andamento, planejadas e propostas — com links para paginas detalhadas.
lang: pt-BR
sidebar:
  order: 1
---

# Funcionalidades

Todas as funcionalidades do Douto, organizadas por status de implementacao. Cada estagio do pipeline e componente da knowledge base possui uma pagina dedicada com detalhes de arquitetura, exemplos de codigo e limitacoes conhecidas.

## Legenda de Status

| Badge | Significado |
|-------|-------------|
| **Implemented** | Em producao, funcional, utilizado no pipeline atual |
| **In Progress** | Parcialmente implementado — estrutura existe mas esta incompleta |
| **Planned** | No roadmap com milestone definido |
| **Idea** | Proposta ainda nao agendada |
| **Innovation** | Propostas estrategicas do `INNOVATION_LAYER.md` |

---

## Funcionalidades do Pipeline (Implemented)

O pipeline principal transforma PDFs de livros juridicos em embeddings pesquisaveis atraves de cinco estagios sequenciais.

| # | Funcionalidade | Status | Script | Pagina |
|---|----------------|--------|--------|--------|
| F01 | Extracao de PDF | Implemented | `process_books.py` | [pdf-extraction](pipeline/pdf-extraction.md) |
| F02 | Chunking Inteligente v3 | Implemented | `rechunk_v3.py` | [intelligent-chunking](pipeline/intelligent-chunking.md) |
| F03 | Enriquecimento de Chunks | Implemented | `enrich_chunks.py` | [enrichment](pipeline/enrichment.md) |
| F04 | Geracao de Embeddings | Implemented | `embed_doutrina.py` | [embeddings](pipeline/embeddings.md) |
| F05 | Busca Hibrida | Implemented | `search_doutrina_v2.py` | [hybrid-search](pipeline/hybrid-search.md) |
| F06 | Busca Multi-Area | Implemented | `search_doutrina_v2.py` | [hybrid-search](pipeline/hybrid-search.md) |
| F07 | CLI de Busca Interativa | Implemented | `search_doutrina_v2.py` | [hybrid-search](pipeline/hybrid-search.md) |

```mermaid
flowchart LR
    PDF["Arquivos PDF"]
    MD["Markdown + capitulos"]
    CHK["Chunks semanticos"]
    ENR["Chunks enriquecidos"]
    EMB["Embeddings + corpus"]
    SRCH["Resultados de busca"]

    PDF -->|"F01 process_books.py"| MD
    MD -->|"F02 rechunk_v3.py"| CHK
    CHK -->|"F03 enrich_chunks.py"| ENR
    ENR -->|"F04 embed_doutrina.py"| EMB
    EMB -->|"F05 search_doutrina_v2.py"| SRCH
```

## Funcionalidades da Knowledge Base

A knowledge base e um skill graph no estilo Obsidian que organiza o acervo doutrinario por area do direito.

| # | Funcionalidade | Status | Artefato | Pagina |
|---|----------------|--------|----------|--------|
| F08 | Skill Graph INDEX | Implemented | `INDEX_DOUTO.md` | [skill-graph](knowledge-base/skill-graph.md) |
| F09 | MOC Direito Civil | Implemented | `MOC_CIVIL.md` | [mocs](knowledge-base/mocs.md) |
| F10 | MOC Processual Civil | Implemented | `MOC_PROCESSUAL.md` | [mocs](knowledge-base/mocs.md) |
| F11 | MOC Empresarial | Implemented | `MOC_EMPRESARIAL.md` | [mocs](knowledge-base/mocs.md) |
| F19 | MOC Consumidor | In Progress | `MOC_CONSUMIDOR.md` | [mocs](knowledge-base/mocs.md) |
| F21 | Notas Atomicas (nodes/) | In Progress | `knowledge/nodes/` | [atomic-notes](knowledge-base/atomic-notes.md) |

## Funcionalidades de Qualidade do Pipeline (Implemented)

Capacidades transversais que garantem confiabilidade e rastreabilidade em todos os estagios do pipeline.

| # | Funcionalidade | Status | Descricao |
|---|----------------|--------|-----------|
| F12 | Processamento Idempotente | Implemented | Markers impedem reprocessamento; `--force` para sobrescrever |
| F13 | Logging Estruturado | Implemented | `processing_log.jsonl` com eventos append-only |
| F14 | Modo Dry-Run | Implemented | Flag `--dry-run` em todos os scripts que alteram dados |
| F15 | Frontmatter YAML Padronizado | Implemented | Schema consistente: `knowledge_id`, `tipo`, `titulo`, `livro_titulo`, `autor`, `area_direito`, `status_enriquecimento` |

## Infraestrutura do Projeto (Implemented)

| # | Funcionalidade | Status | Descricao |
|---|----------------|--------|-----------|
| F16 | AGENTS.md | Implemented | Identidade do agente, responsabilidades, limites, protocolo git |
| F17 | CLAUDE.md | Implemented | Diretrizes de codigo para agentes de IA alinhados ao ecossistema sens.legal |
| F18 | PROJECT_MAP.md | Implemented | Diagnostico completo do projeto e mapa de arquitetura |

---

## Funcionalidades Planejadas

Organizadas por milestone-alvo. Fonte: `ROADMAP.md`.

### v0.2 -- Pipeline Estavel

| # | Funcionalidade | Prioridade | Descricao |
|---|----------------|------------|-----------|
| F22 | Padronizar caminhos | **P0** | Eliminar caminhos absolutos hardcoded em `process_books.py` e `rechunk_v3.py` |
| F23 | Extrair `pipeline/utils.py` | **P1** | Deduplicar `parse_frontmatter()`, `slugify()`, `build_frontmatter()` |
| F24 | Fixar versoes de dependencias | **P1** | `requirements.txt` com versoes exatas |
| F20 | Padronizacao completa de env vars | **P1** | 2/5 scripts usam `os.environ.get()`, 3 tem caminhos hardcoded |

### v0.3 -- Qualidade & Cobertura

| # | Funcionalidade | Prioridade | Descricao |
|---|----------------|------------|-----------|
| F25 | Criar MOCs faltantes | **P1** | `MOC_TRIBUTARIO`, `MOC_CONSTITUCIONAL`, `MOC_COMPLIANCE`, `MOC_SUCESSOES` |
| F26 | Testes para `rechunk_v3.py` | **P1** | pytest com fixtures de markdown juridico real |
| F27 | Testes para funcoes utilitarias | **P2** | `parse_frontmatter`, `slugify`, `extract_json`, `compose_embedding_text` |
| F28 | README completo | **P2** | Setup, pre-requisitos, env vars, uso, arquitetura |
| F31 | Makefile do Pipeline | **P2** | `make pipeline`, `make search`, `make test`, `make lint` |
| F32 | Linting com ruff | **P2** | Configurar ruff, integrar ao Makefile |
| F42 | Versionar prompt de enriquecimento | **P1** | `enrich_prompt.md` referenciado no codigo mas ausente do repositorio |

### v0.4 -- Integracao sens.legal

| # | Funcionalidade | Prioridade | Descricao |
|---|----------------|------------|-----------|
| F29 | Integracao Douto-Valter | **P1** | Definir protocolo: arquivo, API ou MCP |
| F30 | MCP Server para doutrina | **P1** | Expor busca via Model Context Protocol |

## Ideias

Funcionalidades inferidas a partir da arquitetura do ecossistema sens.legal.

| # | Funcionalidade | Prioridade | Milestone | Descricao |
|---|----------------|------------|-----------|-----------|
| F33 | Doutrina no Neo4j | **P2** | v1.0 | Ingerir nos doutrinarios no knowledge graph do Valter |
| F34 | Cross-ref doutrina-jurisprudencia | **P2** | v1.0 | Link automatico quando decisoes do STJ citam autor doutrinario |
| F35 | Cross-ref doutrina-legislacao | **P3** | v1.0 | Vincular comentario doutrinario a dispositivos legais na Leci |
| F36 | Gerar notas atomicas automaticamente | **P2** | v0.5 | Uma nota por `instituto` a partir dos chunks enriquecidos |
| F37 | Suporte a Progressive Briefing | **P2** | v1.0 | Alimentar briefing de 4 fases do Juca com fontes doutrinarias |
| F38 | Pipeline em Docker | **P3** | v1.0 | Containerizar com PyTorch + modelos pre-baixados |
| F39 | CI/CD basico | **P3** | v0.5 | GitHub Actions: ruff lint + pytest em PRs |
| F40 | Eval set de qualidade de embeddings | **P2** | v0.5 | Pares query-resposta para medir recall@k e nDCG |
| F41 | CLI unificada de ingestao | **P3** | v0.5 | `douto ingest livro.pdf` executa o pipeline completo |

---

## Innovation Layer (Proposed)

Propostas estrategicas do `INNOVATION_LAYER.md`. Essas funcionalidades transformariam o Douto de um "motor de busca de livros" em um "motor de raciocinio doutrinario".

| # | Funcionalidade | Prioridade | Milestone | Descricao |
|---|----------------|------------|-----------|-----------|
| F43 | Doctrine Synthesis Engine | **P1** | v0.3.5 | Sintetizar todos os chunks de um conceito juridico em todos os livros |
| F44 | Prompt de sintese | **P1** | v0.3.5 | Prompt cuidadosamente projetado para gerar Doctrine Briefs |
| F45 | Template de Doctrine Brief | **P1** | v0.3.5 | Formato de saida padronizado (Markdown + JSON) |
| F46 | Extracao ontologica de conceitos | **P2** | v0.6 | Coletar todos os institutos e coocorrencias do corpus |
| F47 | Tipagem de relacoes | **P2** | v0.6 | LLM classifica relacoes (IS_A, APPLIES_TO, REQUIRES, etc.) |
| F48 | Exportacao e visualizacao da ontologia | **P3** | v0.6 | GraphML, RDF/Turtle, JSON, visualizacao interativa |

:::tip
O Doctrine Synthesis Engine (F43) e a funcionalidade proposta de maior impacto. Ele aproveita o corpus enriquecido existente para produzir Doctrine Briefs estruturados que nenhum concorrente oferece atualmente. Consulte `INNOVATION_LAYER.md` para a proposta completa.
:::
