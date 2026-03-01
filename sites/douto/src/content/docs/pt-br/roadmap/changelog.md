---
title: Changelog
description: Historico de mudancas significativas, releases e milestones do Douto.
lang: pt-BR
sidebar:
  order: 3
---

# Changelog

Mudancas significativas no Douto, organizadas cronologicamente. Segue as convencoes do [Keep a Changelog](https://keepachangelog.com/).

Formato: cada entrada lista a data, commit(s) associado(s) e mudancas categorizadas (Adicionado, Alterado, Corrigido, Removido).

---

## v0.1.0 -- Setup Inicial (2026-02)

O repositorio Douto foi criado e populado com os scripts do pipeline (migrados de uma vault Obsidian) e a estrutura da knowledge base.

### 2026-02-28 -- Definicao do Norte

**Commit:** `b7930d3`
**Referencia:** SEN-368

#### Adicionado
- `AGENTS.md` atualizado com o norte Jude.md — Douto e formalmente um componente da plataforma unificada de pesquisa juridica (Juca + Leci + Douto + Valter = Jude.md)
- Epic SEN-368 definido como alvo de convergencia

---

### 2026-02-28 -- Populacao da Knowledge Base

**Commit:** `c4e2c5b`

#### Adicionado
- MOCs populados com dados reais do corpus — 56 livros classificados em 4 dominios juridicos
- `MOC_CIVIL.md` — 35 livros, ~9.365 chunks (maior dominio)
- `MOC_PROCESSUAL.md` — 8 livros, ~22.182 chunks
- `MOC_EMPRESARIAL.md` — 7 livros
- `MOC_CONSUMIDOR.md` — estrutura placeholder (ainda nao populado)

---

### 2026-02-28 -- Migracao do Pipeline

**Commit:** `8f9c702`
**Referencia:** SEN-358

#### Adicionado
- `pipeline/process_books.py` — Extracao de PDF para markdown via LlamaParse (suporta tiers: agentic, cost_effective, fast)
- `pipeline/rechunk_v3.py` — Chunking juridico inteligente com 5 passes de processamento, 16 padroes de secao, deteccao de running headers, agrupamento de notas de rodape
- `pipeline/enrich_chunks.py` — Enriquecimento de chunks via MiniMax M2.5 (5 threads concorrentes, metadados juridicos estruturados)
- `pipeline/embed_doutrina.py` — Geracao de embeddings usando Legal-BERTimbau (768-dim, normalizado)
- `pipeline/search_doutrina_v2.py` — Busca hibrida (semantica cosine + BM25) com CLI interativo
- `pipeline/requirements.txt` — Dependencias Python (sentence-transformers, torch, numpy, anthropic, llama-parse)

:::note
Estes 5 scripts foram desenvolvidos dentro de uma vault Obsidian antes de serem migrados para este repositorio. Eles sao anteriores ao proprio repo. O commit de migracao os colocou sob controle de versao pela primeira vez.
:::

---

### 2026-02-28 -- Setup Inicial

**Commit:** `ce16dbc`

#### Adicionado
- `AGENTS.md` — Identidade do agente, responsabilidades, limites e protocolo git
- `knowledge/INDEX_DOUTO.md` — Indice do skill graph mapeando 8 dominios juridicos
- `knowledge/mocs/` — Estrutura de diretorios para MOCs
- `knowledge/nodes/.gitkeep` — Placeholder para futuras notas atomicas
- `tools/.gitkeep` — Placeholder para futuras ferramentas auxiliares
- `.gitignore` — Exclui node_modules, embeddings, .env, __pycache__

---

## Sessao de Documentacao (2026-02-28)

Em uma unica sessao de documentacao, os seguintes documentos estrategicos foram criados:

#### Adicionado
- `CLAUDE.md` — Diretrizes de codigo para agentes de IA, alinhadas com as convencoes do ecossistema sens.legal (ordem de prioridade, convencoes Python, regras do pipeline, regras da knowledge base, convencoes de embedding, padroes git)
- `PROJECT_MAP.md` — Diagnostico completo do projeto: arvore de diretorios, detalhes da stack, arquitetura, diagramas de fluxo de dados, analise de lacunas, recomendacoes
- `ROADMAP.md` — Roadmap de produto com 42 features em 6 milestones, 7 decisoes pendentes, matriz de riscos e plano de mitigacao
- `PREMORTEM.md` — Analise de riscos: 6 premissas falsas, 14 riscos tecnicos, 5 riscos de produto, 4 riscos de execucao, 7 edge cases e a divulgacao de risco de PI
- `docs/` — Site de documentacao Starlight com 22+ paginas cobrindo getting started, arquitetura, features, configuracao, desenvolvimento, roadmap e referencia

---

## Pre-Historia

O pipeline foi desenvolvido durante um periodo indeterminado dentro de uma vault Obsidian antes deste repositorio existir. Fatos-chave sobre a pre-historia:

- Os 5 scripts Python em `pipeline/` sao anteriores ao repositorio
- O corpus (~50 livros, ~31.500 chunks) foi processado antes da migracao
- Paths hardcoded nos scripts refletem os ambientes de desenvolvimento originais (Linux nativo e WSL)
- O prompt de enriquecimento (`enrich_prompt.md`) foi perdido durante a migracao e nao esta no repositorio
- Issues do Linear (SEN-XXX) eram usadas para tracking antes do repositorio ter GitHub Issues

<!-- NEEDS_INPUT: Datas exatas do desenvolvimento do pipeline antes da migracao nao estao disponiveis. O criador pode ter contexto adicional sobre quando cada script foi originalmente escrito. -->
