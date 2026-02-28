---
title: Stack Tecnologica
description: Stack tecnologica completa com versoes, justificativas e papel de cada componente.
lang: pt-BR
sidebar:
  order: 2
---

# Stack Tecnologica

> Cada escolha tecnologica do Valter, com versoes, proposito e por que foi escolhida.

## Linguagem

O Valter e escrito em **Python >=3.12** (producao usa a imagem Docker `3.12-slim`). Python foi escolhido por tres razoes:

1. **Ecossistema de ML** — sentence-transformers, cross-encoders e bibliotecas de NLP para processamento de texto juridico sao nativos de Python. Nao existe alternativa viavel em outras linguagens para embeddings com Legal-BERTimbau.
2. **Performance assincrona** — Python 3.12 com `asyncio`, `asyncpg` e `uvicorn` entrega throughput suficiente para a carga esperada (usuarios concorrentes em digito unico durante a adocao inicial).
3. **Tipagem rica** — type hints com `mypy --strict` e validacao via Pydantic v2 capturam erros em tempo de desenvolvimento que, de outra forma, surgiriam como bugs em runtime no processamento de dados juridicos, onde corretude e primordial.

Todas as funcoes publicas exigem type hints. Isso e aplicado pelo `mypy` no CI e por convencao no `CLAUDE.md`.

## Framework Web

**FastAPI >=0.115.0** com **Uvicorn >=0.34.0** serve como camada HTTP.

O FastAPI foi escolhido porque se alinha com todas as restricoes arquiteturais do projeto:

- **Async-first** — toda operacao de I/O no Valter (queries de banco, busca vetorial, travessia de grafo, chamadas LLM) e `async/await`. O FastAPI e construido sobre a fundacao assincrona do Starlette.
- **Integracao com Pydantic v2** — validacao de request e response usa os mesmos modelos Pydantic que definem entidades de dominio, eliminando camadas de traducao.
- **Geracao automatica de OpenAPI** — a REST API produz uma spec OpenAPI completa a partir das anotacoes de tipo, consumida por integradores externos.
- **DI via `Depends()`** — o sistema de injecao de dependencia do FastAPI alimenta a arquitetura baseada em protocols. Stores sao conectados em `api/deps.py` e injetados nos route handlers sem que a camada core conheca implementacoes concretas.

## Data Stores

O Valter usa quatro bancos de dados especializados, cada um escolhido para uma carga de trabalho especifica:

| Store | Versao | Papel | Volume de Dados | Por Que Este Store |
|-------|--------|-------|-----------------|-------------------|
| PostgreSQL | 16 (Alpine) | Documentos, features, metadados do STJ, jobs de ingestao, estado de workflow, memoria de sessao, API keys, audit logs | ~23.441 docs, 2.119 features, 810.225 registros de metadados | Integridade relacional para documentos juridicos, JSONB para metadados flexiveis, suporte async maduro via `asyncpg`, migracoes com Alembic |
| Qdrant | latest | Busca semantica vetorial | ~3.673 vetores (768-dim, similaridade por cosseno) | Banco vetorial construido para esse fim, com filtragem por payload, similaridade por cosseno nativa e latencia sub-segundo para embeddings juridicos |
| Neo4j | 5.x / Aura | Knowledge graph (ontologia FRBR) | ~28.482 nos, ~207.163 arestas | Travessia nativa de grafo para queries multi-hop (cadeias de citacao, deteccao de divergencia, descoberta de comunidades), linguagem de query Cypher, opcao gerenciada Aura para producao |
| Redis | 7 (Alpine) | Cache, rate limiting, fila de jobs | Efemero | Latencia sub-milissegundo para cache de queries (TTL 180s), TTL nativo para sliding windows de rate limiting, integracao ARQ para filas de jobs em background |

:::note
A decisao de usar quatro bancos de dados ao inves de consolidar (por exemplo, PostgreSQL com pgvector para vetores) esta documentada em [ADR-002: Quatro Data Stores](/pt-br/architecture/decisions#adr-003-quatro-data-stores). Em resumo: cada store e otimizado para sua carga de trabalho, e a complexidade operacional e gerenciada pelo Docker Compose localmente e pelo Railway em producao.
:::

## Dependencias de Producao

Todas as dependencias de producao com seu proposito, agrupadas por funcao:

### Web e HTTP

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `fastapi` | >=0.115.0 | Framework web, roteamento, DI, geracao OpenAPI |
| `uvicorn[standard]` | >=0.34.0 | Servidor ASGI com suporte a HTTP/1.1 e WebSocket |
| `httpx` | >=0.28.0 | Cliente HTTP async para chamadas bridge (MCP remoto para API, Railway encoder) |

### Validacao de Dados e Configuracao

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `pydantic` | >=2.10.0 | Modelos de dominio, schemas de request/response, validacao em runtime |
| `pydantic-settings` | >=2.7.0 | Parsing de variaveis de ambiente em objetos de configuracao tipados |

### Drivers de Banco de Dados

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `sqlalchemy[asyncio]` | >=2.0.36 | ORM async e query builder para PostgreSQL |
| `asyncpg` | >=0.30.0 | Driver async de alta performance para PostgreSQL |
| `alembic` | >=1.14.0 | Gerenciamento de migracoes de banco de dados |
| `qdrant-client` | >=1.12.0 | Cliente do banco vetorial Qdrant |
| `neo4j` | >=5.27.0 | Driver do banco de dados de grafo Neo4j (protocolo bolt async) |
| `redis` | >=5.2.0 | Cliente Redis para cache, rate limiting e ARQ |

### Busca e ML

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `rank-bm25` | >=0.2.2 | Scoring BM25 para busca baseada em palavras-chave |
| `sentence-transformers` | >=3.3.0 | Modelo de embedding Legal-BERTimbau (768-dim) e reranking via cross-encoder |

### Observabilidade

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `structlog` | >=24.4.0 | Logging estruturado em JSON com `trace_id` por request |
| `prometheus-client` | >=0.21.0 | 30+ metricas Prometheus (latencia, taxas de erro, cache hits) |
| `opentelemetry-api` | >=1.29.0 | API de tracing distribuido |
| `opentelemetry-sdk` | >=1.29.0 | SDK do OpenTelemetry para exportacao de traces |
| `opentelemetry-instrumentation-fastapi` | >=0.50b0 | Auto-instrumentacao de rotas FastAPI |

### Jobs em Background e Armazenamento

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `arq` | >=0.26.1 | Fila async de jobs com Redis como backend (workflow de ingestao) |
| `aioboto3` | >=13.3.0 | Cliente async compativel com S3 para armazenamento de artefatos no Cloudflare R2 |

### Processamento de Documentos

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `pdfplumber` | >=0.11.0 | Extracao de texto de PDFs de documentos juridicos |
| `pypdf` | >=5.0.0 | Leitura de PDF e extracao de metadados |

### Protocolo

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `mcp` | >=1.3.0 | SDK do Model Context Protocol para transporte stdio e HTTP/SSE |

## Dependencias de Desenvolvimento

Ferramentas de desenvolvimento sao instaladas via `pip install -e ".[dev]"`:

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `pytest` | >=8.0.0 | Framework de testes |
| `pytest-asyncio` | >=0.24.0 | Suporte a testes async (modo auto) |
| `pytest-cov` | >=6.0.0 | Relatorio de cobertura |
| `ruff` | >=0.8.0 | Linter e formatador (substitui flake8 + isort + black) |
| `mypy` | >=1.13.0 | Verificador estatico de tipos |

Dependencias opcionais de OCR (para processamento de PDFs escaneados):

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `pytesseract` | >=0.3.13 | OCR via motor Tesseract |
| `pdf2image` | >=1.17.0 | Conversao de PDF para imagem no pipeline de OCR |

## Servicos Externos

O Valter se integra com diversos servicos externos, a maioria dos quais e opcional para desenvolvimento local:

| Servico | Proposito | Obrigatorio? | Observacoes |
|---------|-----------|--------------|-------------|
| Groq API | LLM para classificacao de documentos, extracao factual, expansao de query | Opcional | Habilita funcionalidades com IA (21 campos por decisao). Sem ele, essas funcionalidades ficam indisponiveis, mas o sistema continua funcionando. |
| Cloudflare R2 | Armazenamento de artefatos (PDFs, arquivos JSON de analise) | Opcional | Canary rollout em 0%. Sistema de arquivos local e o padrao. |
| Railway | Deploy de producao/staging | Apenas producao | Hospeda API, MCP remoto e ARQ worker como servicos separados. |
| Neo4j Aura | Banco de dados de grafo gerenciado | Staging/prod | Neo4j 5.x local para desenvolvimento. PRs que tocam codigo de grafo devem passar validacao Aura no CI. |
| HuggingFace | Hosting do modelo de embedding | Download unico | `make download-model` busca `rufimelo/Legal-BERTimbau-sts-base` (ou o modelo especificado por `VALTER_EMBEDDING_MODEL`). |

## Build e Deploy

| Ferramenta | Proposito |
|------------|-----------|
| `make` | Interface canonica de comandos. Todas as operacoes comuns tem targets no `make`. Comandos diretos (`pytest`, `uvicorn`) apenas para debug. |
| `uv` / `pip` | Gerenciamento de dependencias. `uv` preferido pela velocidade; `pip` como fallback. |
| Docker + docker-compose | Stack de desenvolvimento local (PostgreSQL, Qdrant, Redis). Neo4j pode rodar localmente ou via Aura. |
| Alembic | Migracoes de schema PostgreSQL com suporte a upgrade/downgrade. |
| GitHub Actions | Pipeline de CI/CD: `make lint` + `make test` + validacao Aura para PRs relacionados a grafo. |
| Railway | Deploy em producao via `railway.json` e `Dockerfile`. Suporta deploy multi-servico (API, Worker, MCP remoto). |
| Hatchling | Build backend Python (configurado em `pyproject.toml`). |
