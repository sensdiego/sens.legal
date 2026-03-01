---
title: Roadmap
description: Roadmap do Douto — visao de produto, prioridades atuais, milestones planejados e principais riscos.
lang: pt-BR
sidebar:
  order: 1
---

# Roadmap

Para onde o Douto esta indo — da estabilizacao do pipeline ate a integracao completa com o sens.legal.

:::note[Status de rascunho]
Este roadmap foi inferido a partir do codebase, commits, AGENTS.md e contexto do ecossistema. Ainda nao foi formalmente validado pelo dono do projeto. Prioridades podem mudar. Veja a Decisao D07 em [Milestones](/docs/pt-br/roadmap/milestones/).
:::

## Visao de Produto

O Douto sera o **backend de conhecimento doutrinario** do ecossistema sens.legal. Quando maduro, ele vai:

- Processar livros juridicos de forma autonoma (PDF para chunks para embeddings)
- Manter um skill graph navegavel organizado por area do direito
- Expor conhecimento doutrinario via MCP/API para que Valter, Juca e Leci consultem em tempo real
- Apoiar briefings, analises de risco e minutas com referencias doutrinarias autoritativas

O corpus atual contem **~50 livros** e **~31.500 chunks** nas areas de direito civil, processo civil e direito empresarial.

## Status Atual

| Categoria | Qtde | Detalhes |
|-----------|------|----------|
| Implementado | 18 | F01-F18: pipeline completo (PDF ate busca), skill graph, 4 MOCs, idempotencia, logging, dry-run |
| Em andamento | 3 | F19 (MOC Consumidor), F20 (padronizacao de env vars), F21 (notas atomicas) |
| Planejado | 11 | F22-F32: correcao de paths, utils.py, testes, MOCs, README, Makefile, linting, MCP |
| Ideias | 10 | F33-F42: integracao Neo4j, cross-references, Docker, CI/CD, eval set |
| Decisoes pendentes | 7 | D01-D07: protocolo de integracao, repo vs. modulo, tracking, escolha de modelo |
| Cobertura de testes | 0% | Sem framework de testes, sem testes |

### O que funciona hoje

- Pipeline completo: `process_books.py` -> `rechunk_v3.py` -> `enrich_chunks.py` -> `embed_doutrina.py` -> `search_doutrina_v2.py`
- Busca hibrida (semantica + BM25) com filtros de metadados
- CLI interativo de busca com comandos `/area`, `/filtro`, `/verbose`
- 4 MOCs populados: Civil (35 livros), Processual (8 livros), Empresarial (7 livros), Consumidor (placeholder)
- Metadados de enriquecimento estruturados: instituto, tipo_conteudo, ramo, fase, fontes_normativas

### O que nao funciona

- O pipeline so roda na maquina do criador (paths hardcoded)
- Sem testes automatizados
- Sem integracao em tempo real com o ecossistema sens.legal (apenas arquivos JSON)
- 4 dos 8 MOCs nao existem como arquivos (Tributario, Constitucional, Compliance, Sucessoes)
- `enrich_prompt.md` esta ausente do repositorio (impossivel enriquecer novos chunks)
- Versoes de dependencias nao estao pinadas

## Visao Geral dos Milestones

| Milestone | Nome | Entrega principal | Status |
|-----------|------|-------------------|--------|
| **v0.2** | Pipeline Estavel | Roda em qualquer maquina | Planejado |
| **v0.2.5** | Validacao de Dados | Quality gate de metadados (>= 85%) | Proposto (pos-PREMORTEM) |
| **v0.3** | Qualidade & Cobertura | Testes, MOCs, docs, linting | Planejado |
| **v0.3.5** | Sintese Doutrinaria | Motor de Sintese | Proposto |
| **v0.4** | Integracao sens.legal | Servidor MCP | Planejado |
| **v0.5** | Knowledge Graph & Automacao | Notas atomicas, eval set, CI/CD | Planejado |
| **v0.6** | Ontologia Juridica | Grafo de conceitos | Proposto |
| **v1.0** | Plataforma Integrada | Integracao completa com ecossistema | Planejado |

Veja [Milestones](/docs/pt-br/roadmap/milestones/) para o detalhamento de cada um.

### Sequencia dos Milestones

```
v0.2 Pipeline Estavel
  |
  v
v0.2.5 Validacao de Dados  <-- Checkpoint proposto
  |  - Validar 200 chunks
  |  - Criar eval set
  |  - Validacao de schema
  |  - Gate: precisao >= 85%?
  v
v0.3 Qualidade & Cobertura (testes, MOCs, docs)
  |
  v
v0.3.5 Sintese Doutrinaria (se quality gate passou)
  |
  v
v0.4 Integracao sens.legal (servidor MCP)
  |
  v
v0.5 Knowledge Graph & Automacao
  |
  v
v0.6 Ontologia Juridica (proposto)
  |
  v
v1.0 Plataforma Integrada
```

## Decisoes Pendentes

Sete decisoes arquiteturais permanecem em aberto. Duas delas (D01 e D02) bloqueiam completamente o milestone v0.4.

| # | Pergunta | Impacto | Bloqueia |
|---|----------|---------|----------|
| **D01** | Protocolo de integracao: MCP stdio, MCP HTTP/SSE, REST ou manter JSON files? | Define a arquitetura de longo prazo | v0.4 |
| **D02** | Servico independente ou modulo do Valter? | Identidade do Douto como servico | v0.4 |
| D03 | Notas atomicas: geradas automaticamente ou curadas manualmente? | Trade-off volume vs. qualidade | v0.5 |
| D04 | Tracking de issues: Linear (SEN-XXX) ou GitHub Issues? | Workflow de contribuicao | -- |
| D05 | Schema doutrinario no Neo4j? | Integracao com knowledge graph | v1.0 |
| D06 | Manter MiniMax M2.5 ou migrar modelo de enriquecimento? | Custo, qualidade, dependencia | -- |
| D07 | As prioridades inferidas estao corretas? | O roadmap inteiro pode ser reordenado | Todos |

Veja [Decisoes de Arquitetura](/docs/architecture/decisions/) para analise detalhada de cada opcao.

## Resumo de Riscos

Os 5 principais riscos da analise PREMORTEM, ordenados por probabilidade:

### 1. Morte por Abandono

**Probabilidade: Alta** | Desenvolvedor solo mantendo 5 repositorios (Valter, Juca, Leci, Joseph, Douto). Valter e Juca atendem clientes e provavelmente tem prioridade. O Douto pode ficar 6+ meses sem commits, perdendo contexto e momentum.

### 2. Ilusao de Qualidade

**Probabilidade: Alta** | Os metadados de enriquecimento nunca foram validados contra julgamento humano. Se 30-40% das classificacoes de `instituto` e `tipo_conteudo` estiverem erradas, a busca filtrada retorna lixo e qualquer feature de sintese amplifica os erros. Nao existe eval set para medir isso.

### 3. Fundacao Irreproduzivel

**Probabilidade: Alta** | `enrich_prompt.md` esta ausente. Versoes de dependencias nao estao pinadas. Se o corpus precisar de reprocessamento (novo modelo, bug fix, novo dominio), o resultado sera diferente do original. Dois datasets inconsistentes sem como voltar ao estado anterior.

### 4. Redundancia com o Valter

**Probabilidade: Media** | Se o Valter precisar de doutrina antes do v0.4, a equipe pode construir `valter/stores/doutrina/` com Qdrant (ja disponivel). Uma vez que o Valter tenha um modulo de doutrina "bom o suficiente", integrar o Douto fica mais dificil de justificar do que reescrever.

### 5. Zero Escalabilidade

**Probabilidade: Certa** | Embeddings armazenados como JSON puro (~2 GB para 31.500 chunks). BM25 recalcula frequencias de documentos a cada consulta. Tempo de carga em segundos. Adicionar mais 50 livros dobra tudo. Inutilizavel como ferramenta MCP com essa latencia.

Para a analise completa incluindo 14 riscos tecnicos, 5 riscos de produto, 4 riscos de execucao e 7 edge cases, veja `PREMORTEM.md` na raiz do repositorio.

## Backlog de Features

### Implementadas (F01-F18)

| # | Feature | Script/Arquivo |
|---|---------|----------------|
| F01 | Extracao de PDF via LlamaParse | `process_books.py` |
| F02 | Chunking juridico inteligente v3 | `rechunk_v3.py` |
| F03 | Enriquecimento de chunks via MiniMax M2.5 | `enrich_chunks.py` |
| F04 | Geracao de embeddings (Legal-BERTimbau 768-dim) | `embed_doutrina.py` |
| F05 | Busca hibrida (semantica + BM25 + filtros) | `search_doutrina_v2.py` |
| F06 | Suporte a busca multi-area | `search_doutrina_v2.py` |
| F07 | CLI interativo de busca | `search_doutrina_v2.py` |
| F08 | INDEX do skill graph | `INDEX_DOUTO.md` |
| F09 | MOC Direito Civil (35 livros) | `MOC_CIVIL.md` |
| F10 | MOC Processual Civil (8 livros) | `MOC_PROCESSUAL.md` |
| F11 | MOC Empresarial (7 livros) | `MOC_EMPRESARIAL.md` |
| F12 | Idempotencia do pipeline | Todos os scripts |
| F13 | Logging estruturado (JSONL) | Todos os scripts |
| F14 | Dry-run em todos os scripts | Todos os scripts |
| F15 | Frontmatter YAML padronizado | Todos os scripts |
| F16 | AGENTS.md | `AGENTS.md` |
| F17 | CLAUDE.md | `CLAUDE.md` |
| F18 | PROJECT_MAP.md | `PROJECT_MAP.md` |

### Planejadas (F22-F32)

Veja [Milestones](/docs/pt-br/roadmap/milestones/) para saber a qual milestone cada feature pertence.

| # | Feature | Prioridade | Milestone |
|---|---------|------------|-----------|
| F22 | Padronizar paths (eliminar hardcodes) | P0 | v0.2 |
| F23 | Extrair `pipeline/utils.py` | P1 | v0.2 |
| F24 | Pinar versoes de dependencias | P1 | v0.2 |
| F25 | Criar MOCs ausentes (4 MOCs) | P1 | v0.3 |
| F26 | Testes para `rechunk_v3.py` | P1 | v0.3 |
| F27 | Testes para funcoes utilitarias | P2 | v0.3 |
| F28 | README completo | P2 | v0.3 |
| F29 | Protocolo de integracao Douto -> Valter | P1 | v0.4 |
| F30 | Servidor MCP para doutrina | P1 | v0.4 |
| F31 | Makefile para orquestracao do pipeline | P2 | v0.3 |
| F32 | Linting com ruff | P2 | v0.3 |
