---
title: Changelog
description: Historico de mudancas significativas, features entregues e milestones alcancados.
lang: pt-BR
sidebar:
  order: 3

---

# Changelog

Mudancas significativas organizadas por data, mais recentes primeiro. Para logs de desenvolvimento por sessao, veja `PROGRESS.md` na raiz do repositorio.

Categorias: **Added** (nova feature), **Changed** (modificacao em feature existente), **Fixed** (correcao de bug), **Security** (mudanca relacionada a seguranca), **Removed** (feature ou codigo morto removido).

---

## Fevereiro de 2026

### 2026-02-28 -- Reorg, Roadmap v2, Mapa do Projeto

**Changed**
- Reorg Fases 0-2: correcoes de seguranca, limpeza de dependencias, remocao de codigo morto
- Roadmap v2: analise premortem, visao da reasoning chain, reestruturacao de milestones com planejamento orientado a riscos
- Organizacao de issues: 5 milestones no GitHub criados, 9 novas issues abertas, 2 fechadas, 11 atualizadas com labels e milestones

### 2026-02-27 -- Preparacao para App Directory

**Added**
- Hardening de seguranca para requisitos do App Directory (validacao de input, sanitizacao de erros)
- Melhorias de UX para descricoes de tools MCP e schemas de parametros
- Alinhamento de metadata com formato de submissao do App Directory
- Validacao dry-run do fluxo de submissao ao App Directory

### 2026-02-25 -- Quality Gates

**Added**
- `ruff check` e `ruff format` impostos como quality gates
- `mypy` com tipagem estrita em modulos criticos (`api/deps.py`, `api/routes/ingest.py`, `mcp/tools.py`)
- Target `make quality` combinando lint + type check + test

### 2026-02-24 -- Rate Limit Fail-Safe, Tracing, Desacoplamento

**Added**
- Mecanismo de rate limit fail-safe (implementacao inicial)
- OpenTelemetry tracing com console exporter e propagacao de `trace_id`
- Desacoplamento arquitetural: 10 sprints separando responsabilidades entre camadas

**Changed**
- Implementacoes de store desacopladas de imports diretos do core (injecao de dependencia)

### 2026-02-22 -- Integracao ChatGPT, Enriquecimento de Busca

**Added**
- Integracao com ChatGPT ao vivo via MCP remote (transporte HTTP/SSE)
- Enriquecimento de resultados de busca com metadata do grafo (contagem de citacoes, score de conectividade)

### 2026-02-21 -- Qualidade do KG, MCP Remote, Auth, Governanca

**Added**
- Servidor MCP remote com transporte HTTP/SSE (`mcp/remote_server.py`)
- Hardening de autenticacao (validacao de API key, verificacao HMAC)
- Documentacao de governanca operacional (secao de governanca no `CLAUDE.md`)

**Changed**
- Melhorias na qualidade do knowledge graph (deduplicacao de nos, validacao de relacoes)

### 2026-02-17 -- Classificacao em Lote, Deploy Railway

**Added**
- Pipeline de classificacao de documentos em lote
- Configuracao de deploy em producao no Railway

### 2026-02-16 -- Paginacao, Metadata STJ, Ingestao, Embeddings

**Added**
- Paginacao baseada em cursor para resultados de busca
- Store de metadata do STJ (`stores/stj_metadata.py`) para dados especificos do tribunal
- Workflow de ingestao com maquina de estados (`core/workflow_state_machine.py`)
- Queries de caminho mais curto entre decisoes no grafo
- Servico de embedding com modelo configuravel (`embeddings/`)

### 2026-02-15 -- Features Search, MCP Desktop, Reranking, Endpoints de Grafo

**Added**
- Endpoint de busca por features (busca por features juridicas extraidas)
- Servidor MCP para Claude Desktop (transporte stdio)
- Reranking por cross-encoder para resultados de busca
- 4 endpoints adicionais de analitico de grafo (analise temporal, comparacao de ministros, evolucao de criterios, rede de citacoes)

### 2026-02-13 -- Endpoints de Analitico de Grafo

**Added**
- Endpoints de analitico de grafo via `POST /v1/graph/`:
  - Deteccao de divergencia entre ministros e turmas
  - Busca de caminho otimo de argumento juridico
  - Analise de perfil de ministro (padroes de voto, especializacoes)
  - Evolucao temporal de criterios juridicos

### 2026-02-10 -- Ingestao de Dados em Escala

**Added**
- Ingestao de dados em larga escala: 23.441 documentos, 2.119 features extraidas, 810.225 registros de metadata
- Pipeline de ingestao com extracao de PDF, processamento de texto e parsing de metadata

### 2026-02-09 -- Fundacao do Projeto

**Added**
- Motor de busca hibrida (lexica BM25 + busca vetorial semantica com fusao RRF)
- Verificacao anti-alucinacao contra dados publicos do STJ (`core/verifier.py`)
- Framework de analise juridica IRAC (`models/irac.py`)
- Esqueleto do servidor MCP com definicoes de tools
- Corpus inicial: 3.673 documentos indexados com embeddings
- Document store PostgreSQL com metadata JSONB
- Vector store Qdrant para busca semantica
- Camada de cache Redis com rate limiting
- Knowledge graph Neo4j com ontologia baseada em FRBR
- API REST FastAPI com tratamento estruturado de erros
- Logging JSON via structlog com `trace_id` por request
