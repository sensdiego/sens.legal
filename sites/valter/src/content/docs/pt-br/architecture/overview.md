---
title: Visao Geral da Arquitetura
description: Monolito modular com 4 runtimes, arquitetura em camadas com injecao de dependencia via protocols.
lang: pt-BR
sidebar:
  order: 1
---

# Visao Geral da Arquitetura

> O Valter e um monolito modular com 4 runtimes (API, Worker, MCP stdio, MCP HTTP), todos compartilhando o mesmo codebase Python com separacao rigorosa em camadas.

## Padrao Arquitetural

O Valter segue um padrao de **monolito modular** — nao microservicos. Todos os runtimes compartilham o mesmo pacote Python (`src/valter/`), os mesmos modelos de dominio e a mesma logica de negocio. O que muda entre runtimes e o entry point e a camada de transporte, nao a logica central.

Esse design foi escolhido por tres razoes:

1. **Consistencia** — um unico codebase garante que o comportamento de uma tool MCP e de seu endpoint REST equivalente sejam sempre identicos, porque ambos chamam a mesma funcao do core.
2. **Simplicidade** — existe uma unica unidade de deploy para construir, testar e raciocinar sobre. Nenhuma comunicacao inter-servico, nenhum contrato de API entre servicos, nenhum estado distribuido.
3. **Testabilidade** — todos os quatro runtimes podem ser validados pela mesma suite de testes, ja que os testes miram a logica do core e nao codigo especifico de transporte.

O runtime e selecionado pelo entry point usado para iniciar o processo. Em producao no Railway, multiplas instancias do mesmo codebase rodam com entry points diferentes (API na porta 8000, MCP remoto na porta 8001, ARQ worker para jobs em background).

## Regra de Dependencia

O codebase aplica uma regra estrita de dependencia unidirecional entre camadas:

```
api/ → core/ → models/
```

Isso significa:

- **`api/`** pode importar de `core/` e `models/`, mas nunca de `stores/`.
- **`core/`** pode importar de `models/`, mas nunca de `stores/` ou `api/`.
- **`models/`** tem zero imports internos — e a camada folha.
- **`stores/`** implementa protocols definidos em `core/protocols.py` e e injetado em runtime via mecanismo `Depends()` do FastAPI, configurado em `api/deps.py`.

Essa separacao garante que `core/` contenha logica de negocio pura sem acoplamento a nenhum driver concreto de banco de dados. Um `PostgresDocStore` pode ser substituido por um mock nos testes (ou por uma implementacao completamente diferente) sem alterar uma unica linha no `core/`.

:::note
A camada `stores/` fica ao lado da cadeia de dependencia, nao dentro dela. Modulos do core recebem instancias de stores por injecao de dependencia, nunca por imports diretos. Se voce encontrar `from valter.stores import ...` dentro de um modulo do `core/`, isso e uma violacao.
:::

## Camadas

### Camada API (`src/valter/api/`)

A camada API e o limite mais externo da aplicacao. Ela lida com transporte HTTP, validacao de requests, autenticacao e serializacao de responses. Os route handlers sao intencionalmente finos — validam o input usando schemas Pydantic, chamam uma funcao do core e retornam o resultado.

Componentes-chave:

- **11 routers FastAPI** — `health`, `retrieve`, `verify`, `enrich`, `similar`, `graph`, `features`, `factual`, `ingest`, `memories`, `datasets`
- **Schemas Pydantic v2** — modelos de request e response em `api/schemas/`, separados dos modelos de dominio
- **Container de DI** — `api/deps.py` conecta stores concretos as funcoes do core usando `Depends()`
- **Stack de middleware** — requests passam por 5 camadas de middleware em ordem: CORS, Metrics IP Allowlist, Request Tracking (trace_id + Prometheus), Rate Limiter (Redis sliding window), Auth (API key + scopes)

:::caution
Route handlers nunca devem conter logica de negocio. Se um handler faz mais do que validar input, chamar o core e retornar uma response, a logica pertence ao `core/`.
:::

### Camada Core (`src/valter/core/`)

A camada core contem toda a logica de negocio. Possui aproximadamente 25 modulos organizados por capacidade de dominio:

| Grupo | Modulos | Proposito |
|-------|---------|-----------|
| Busca | `HybridRetriever`, `DualVectorRetriever`, `QueryExpander` | Busca hibrida com BM25 + semantica + KG boost, busca factual dual-vector, expansao multi-query |
| Analise | `DocumentEnricher`, `LegalVerifier`, `SimilarityFinder`, `FactualExtractor` | Analise IRAC, verificacao anti-alucinacao, similaridade de casos, extracao factual via Groq |
| Workflow | `WorkflowOrchestrator`, `ProjudiOrchestrator`, `PhaseAnalysis` (5 modulos) | Pipeline completo de ingestao, do upload de PDF ate artefatos revisados por humano |
| Infraestrutura | `Protocols` (interfaces runtime-checkable) | Contratos que stores devem implementar |

Todo modulo no `core/` depende apenas de protocols e models — nunca de implementacoes concretas de stores.

### Camada Store (`src/valter/stores/`)

A camada store fornece implementacoes concretas dos protocols definidos em `core/protocols.py`. Cada store e especializado para seu backend de dados:

| Store | Backend | Responsabilidade |
|-------|---------|-----------------|
| `PostgresDocStore` | PostgreSQL | CRUD de documentos, busca full-text (BM25) |
| `PostgresFeaturesStore` | PostgreSQL | Features extraidas por IA (21 campos por decisao) |
| `PostgresSTJStore` | PostgreSQL | Metadados do STJ (810K registros) |
| `PostgresIngestStore` | PostgreSQL | Jobs de ingestao, estado do workflow |
| `PostgresMemoryStore` | PostgreSQL | Memoria de sessao com TTL |
| `QdrantVectorStore` | Qdrant | Busca semantica (vetores 768-dim, similaridade por cosseno) |
| `Neo4jGraphStore` | Neo4j | Queries no knowledge graph (12+ metodos analiticos) |
| `RedisCacheStore` | Redis | Cache de queries (TTL 180s), contadores de rate limiting |
| `GroqLLMClient` | Groq API | Chamadas LLM para classificacao, extracao, expansao de query |
| `ArtifactStorage` | Cloudflare R2 / local | Armazenamento de artefatos PDF e JSON com canary rollout |

:::tip
O `GroqLLMClient` reside em `stores/` mesmo que o Groq nao seja um banco de dados tradicional. Na arquitetura do Valter, `stores/` significa "provedor externo de dados" — qualquer coisa que viva fora dos limites do processo e exija I/O.
:::

### Camada Model (`src/valter/models/`)

A camada model define entidades de dominio como modelos Pydantic v2. Esses modelos sao compartilhados entre todas as camadas e representam o formato canonico dos dados no sistema:

| Modulo | Modelos |
|--------|---------|
| `document.py` | `Document`, `DocumentMetadata` |
| `chunk.py` | `Chunk`, `ChunkMetadata` |
| `irac.py` | Estrutura da analise IRAC (Issue, Rule, Application, Conclusion) |
| `graph.py` | 30+ modelos de entidades do grafo (divergencias, perfis de ministros, PageRank, comunidades, etc.) |
| `frbr.py` | Modelos da ontologia FRBR (`Work`, `Expression`, `Manifestation`) |
| `phase.py` | Modelos de fases processuais |
| `features.py` | Features de documentos extraidas por IA (21 campos) |
| `factual.py` | Digest factual e tese juridica |
| `stj_metadata.py` | Metadados do tribunal STJ |
| `memory.py` | Pares chave-valor de memoria de sessao |

Todos os modelos usam `model_config = {"strict": False}` para permitir coercao a partir de resultados do banco enquanto mantem type safety no codigo da aplicacao.

## Entry Points

O Valter expoe quatro entry points de runtime, todos a partir do mesmo codebase:

| Entry Point | Arquivo | Comando | Porta | Consumidores |
|-------------|---------|---------|-------|-------------|
| REST API | `src/valter/main.py` | `make dev` | 8000 | Frontend Juca, clientes diretos da API |
| MCP stdio | `src/valter/mcp/__main__.py` | `python -m valter.mcp` | -- | Claude Desktop, Claude Code |
| MCP HTTP/SSE | `src/valter/mcp/remote_server.py` | `make mcp-remote` | 8001 | ChatGPT Apps via auth HMAC |
| ARQ Worker | `src/valter/workers/__main__.py` | `make worker-ingest` | -- | Jobs de ingestao em background |

Em producao (Railway), a REST API e o MCP HTTP/SSE rodam como servicos separados com URLs distintas, enquanto o ARQ Worker roda como um processo separado consumindo a fila de jobs do Redis.

## Fluxo de Dados

Em alto nivel, todo request segue o mesmo pipeline independentemente do entry point:

```
Consumidor (Juca / ChatGPT / Claude)
    │
    ▼
Entry Point (REST API / MCP stdio / MCP HTTP)
    │
    ▼
Stack de Middleware (CORS → Metrics → Tracking → RateLimit → Auth)
    │
    ▼
Route Handler (valida input, delega para o core)
    │
    ▼
Logica Core (retriever, enricher, verifier, etc.)
    │
    ▼
Stores (PostgreSQL, Qdrant, Neo4j, Redis, Groq, R2)
    │
    ▼
Response (serializada via schema Pydantic)
```

Tools MCP seguem o mesmo caminho: a implementacao de cada tool chama funcoes do core, que por sua vez chamam stores. A camada MCP nao adiciona logica de negocio — e um adaptador fino que traduz chamadas de tools MCP nas mesmas chamadas de funcao do core que os route handlers REST fazem.

Para diagramas visuais detalhados das relacoes entre componentes e do pipeline de busca, veja [Diagramas de Arquitetura](/pt-br/architecture/diagrams).
