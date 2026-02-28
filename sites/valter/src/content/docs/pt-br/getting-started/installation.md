---
title: "Instalação"
description: "Guia completo de setup para todos os componentes do Valter: bancos de dados, modelos de embedding, Neo4j, Groq, servidores MCP e configuração de produção."
lang: pt-BR
sidebar:
  order: 3
---

# Instalação

Este guia cobre o setup completo de cada componente do Valter. Se você só quer começar rápido, comece pelo [Quickstart](/pt-br/getting-started/quickstart/) e volte aqui quando precisar de Neo4j, Groq ou configuração de produção.

## Requisitos do sistema

| Requisito | Mínimo | Observações |
|-----------|--------|-------------|
| Python | 3.12+ | Usa syntax `X \| None`, `type` statements |
| Docker | 20.10+ | Para containers PostgreSQL, Qdrant, Redis |
| Docker Compose | v2+ | `docker compose` (não `docker-compose`) |
| make | qualquer | Interface canônica de comandos |
| RAM | ~4 GB | Modelo de embedding (~1,5 GB) + bancos (~2 GB) |
| Disco | ~3 GB | Cache do modelo + volumes dos containers |

## Ambiente Python

O Valter usa [uv](https://github.com/astral-sh/uv) como gerenciador de pacotes preferido, com pip como fallback:

```bash
# Crie e ative o ambiente virtual
python -m venv .venv
source .venv/bin/activate

# Instale com dependências de dev
uv pip install -e ".[dev]"

# Ou com pip:
pip install -e ".[dev]"
```

### Extras opcionais

```bash
# Suporte a OCR (pytesseract + pdf2image)
uv pip install -e ".[dev,ocr]"
```

:::caution
OCR requer o pacote de sistema `tesseract-ocr` instalado separadamente. No macOS: `brew install tesseract`. No Ubuntu: `apt install tesseract-ocr`. Sem o pacote de sistema, os pacotes Python instalam mas chamadas OCR falham com erro em runtime.
:::

## Setup dos bancos de dados

### PostgreSQL (dados relacionais)

PostgreSQL armazena documentos, features extraídas por IA, metadados do STJ, jobs de ingestão, workflows, API keys e audit logs.

**Via Docker Compose (recomendado):**

```bash
make docker-up  # Inicia PostgreSQL 16 Alpine na porta 5432
```

Parâmetros de conexão padrão (pré-configurados no `.env.example`):

```
Host:     localhost:5432
Database: valter
User:     valter
Password: valter_dev
```

**Via PostgreSQL existente:**

Defina sua string de conexão no `.env`:

```bash
VALTER_DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
```

**Rode as migrações** após o PostgreSQL estar disponível:

```bash
make migrate  # alembic upgrade head
```

Isso cria todas as tabelas necessárias através de 8 arquivos de migração. Cada migração suporta `downgrade()` para rollback.

### Qdrant (busca vetorial)

Qdrant armazena embeddings semânticos para busca por similaridade. O Valter usa vetores de 768 dimensões com distância coseno.

**Via Docker Compose:**

```bash
make docker-up  # Também inicia Qdrant na porta 6333
```

A collection é criada automaticamente no primeiro startup. A função `init_stores` em `api/deps.py` chama `ensure_collection()` e valida que a dimensão configurada bate com a collection existente.

```bash
VALTER_QDRANT_URL=http://localhost:6333
VALTER_QDRANT_COLLECTION=legal_chunks_v1  # default
```

### Redis (cache, rate limiting, fila de jobs)

Redis serve três propósitos: cache de respostas com TTL de 180 segundos, rate limiting por sliding-window por API key, e fila de jobs ARQ para processamento em background.

**Via Docker Compose:**

```bash
make docker-up  # Também inicia Redis 7 Alpine na porta 6379
```

```bash
VALTER_REDIS_URL=redis://localhost:6379/0  # Cache + rate limiting
VALTER_ARQ_REDIS_DB=1                       # DB separado para fila de jobs
```

:::danger
Redis é atualmente um ponto único de falha para o rate limiter. Se o Redis cair, **todas as requisições da API são bloqueadas** — mesmo com API keys válidas. Esse comportamento fail-closed está sendo alterado para fail-open no milestone v1.0 (issue #150).
:::

### Neo4j (grafo de conhecimento)

Neo4j armazena o grafo de conhecimento: ~28.500 nós (decisões, critérios, dispositivos, precedentes) conectados por ~207.000 arestas. Ele alimenta os 12 endpoints `/v1/graph/*`, o boost de KG na busca híbrida e a similaridade estrutural.

**Sem Neo4j**, o Valter ainda funciona — busca, verificação, enriquecimento e ingestão operam normalmente. Apenas features específicas de grafo retornam 503.

#### Opção A: Neo4j Local

Instale o [Neo4j Community Edition](https://neo4j.com/download/) 5.x e configure:

```bash
VALTER_NEO4J_URI=bolt://localhost:7687
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=sua_senha
```

Rode as migrações de schema Cypher manualmente:

```bash
# Aplique as migrações no diretório neo4j_migrations/
cypher-shell -u neo4j -p sua_senha < neo4j_migrations/001_initial_schema.cypher
cypher-shell -u neo4j -p sua_senha < neo4j_migrations/002_indexes.cypher
```

#### Opção B: Neo4j Aura (gerenciado)

[Neo4j Aura](https://neo4j.com/cloud/aura/) é obrigatório para ambientes de staging e produção.

```bash
VALTER_NEO4J_URI=neo4j+s://abc123.databases.neo4j.io
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=sua_senha_aura
```

Valide a conexão:

```bash
make validate-aura  # Executa scripts/validate_aura.py --max-latency-ms 15000
```

:::caution
Qualquer PR que modifique código relacionado a grafo deve passar `make validate-aura` antes do merge. Isso é enforçado pelo CI e documentado nas regras de governança do projeto.
:::

## Modelo de embedding

O Valter usa [Legal-BERTimbau-sts-base](https://huggingface.co/rufimelo/Legal-BERTimbau-sts-base) — um modelo de domínio jurídico em português que produz embeddings de 768 dimensões.

### Pré-download (recomendado)

```bash
make download-model
```

Isso baixa ~500 MB para `~/.cache/huggingface/`. O nome do modelo é resolvido com prioridade em três níveis:

1. Variável de ambiente do shell `VALTER_EMBEDDING_MODEL`
2. Valor no arquivo `.env`
3. Fallback hardcoded: `rufimelo/Legal-BERTimbau-sts-base`

### Download automático

Se você pular `make download-model`, o modelo é baixado automaticamente na primeira requisição de busca. Isso adiciona 30–60 segundos à primeira requisição.

### Encoding remoto

Para produção ou ambientes com recursos limitados, o Valter suporta encoding remoto via um serviço GPU dedicado:

```bash
VALTER_EMBEDDING_SERVICE_URL=https://seu-encoder-service.railway.app
```

Quando definido, o Valter usa `RailwayEncoder` em vez de carregar o modelo localmente. O serviço remoto deve retornar vetores de 768 dimensões.

De forma similar para reranking:

```bash
VALTER_RERANKER_SERVICE_URL=https://seu-reranker-service.railway.app
```

## Modos de runtime

O Valter roda em quatro modos a partir do mesmo codebase, selecionados por `VALTER_RUNTIME`:

### Servidor API (padrão)

```bash
make dev  # Desenvolvimento com hot reload
# ou em produção:
VALTER_RUNTIME=api uvicorn valter.main:app --host 0.0.0.0 --port 8000
```

O servidor API inicia a aplicação FastAPI completa com stack de middlewares, 11 routers e métricas Prometheus.

### ARQ worker

```bash
make worker-ingest
```

O worker processa jobs em background: ingestão de PDFs, extração PROJUDI, análise de fases e matching de jurisprudência. Ele conecta ao Redis (DB 1) como sua fila de jobs.

Configuração:

```bash
VALTER_INGEST_JOB_TIMEOUT_SECONDS=1800    # 30 min max por job
VALTER_INGEST_WORKER_CONCURRENCY=2         # Slots de jobs paralelos
```

### Servidor MCP stdio (Claude Desktop/Code)

```bash
python -m valter.mcp
```

Isso inicia o servidor MCP em modo stdio para conexões locais de LLMs. Configure no `claude_desktop_config.json` do Claude Desktop:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "cwd": "/caminho/absoluto/para/Valter",
      "env": {
        "VALTER_DATABASE_URL": "postgresql+asyncpg://valter:valter_dev@localhost:5432/valter",
        "VALTER_QDRANT_URL": "http://localhost:6333",
        "VALTER_REDIS_URL": "redis://localhost:6379/0",
        "VALTER_MCP_API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

:::tip
O servidor MCP stdio faz bridge para a API REST via httpx. Certifique-se de que `VALTER_MCP_API_BASE_URL` aponta para um servidor API rodando — as tools MCP chamam os endpoints REST internamente.
:::

### Servidor MCP HTTP/SSE (ChatGPT)

```bash
make mcp-remote  # Inicia na porta 8001
```

Isso inicia um servidor MCP streamable-HTTP para consumidores remotos como o ChatGPT. Requer autenticação:

```bash
VALTER_MCP_SERVER_AUTH_MODE=api_key
VALTER_MCP_SERVER_API_KEYS=sua_key_1,sua_key_2  # separadas por vírgula para rotação
VALTER_MCP_SERVER_PORT=8001
```

### Seleção de runtime em container

Em Docker/Railway, o script `scripts/start-command.sh` seleciona o runtime:

```bash
VALTER_RUNTIME=api           # → uvicorn valter.main:app
VALTER_RUNTIME=worker        # → python -m valter.workers
VALTER_RUNTIME=mcp-remote    # → python -m valter.mcp.remote_server
VALTER_RUNTIME=mcp-stdio     # → python -m valter.mcp.remote_server (transporte stdio)
```

## Integrações opcionais

### Groq LLM

Groq alimenta três features: classificação de documentos (21 campos extraídos por IA), extração factual do texto de decisões e expansão de queries (até 3 variantes de busca).

```bash
VALTER_GROQ_API_KEY=gsk_sua_key_aqui  # Obtenha em https://console.groq.com/keys
VALTER_GROQ_ENABLED=true
VALTER_GROQ_MODEL=qwen/qwen3-32b       # default
```

Sem Groq, todas as outras features funcionam normalmente — endpoints de extração factual retornam erro, e expansão de queries é silenciosamente pulada.

### Cloudflare R2

R2 fornece object storage compatível com S3 para artefatos de workflow (PDFs, JSONs de análise). Um mecanismo de canary rollout determinístico controla qual porcentagem de artefatos vai para R2 vs storage local.

```bash
VALTER_R2_ACCOUNT_ID=seu_account_id
VALTER_R2_ACCESS_KEY_ID=sua_access_key
VALTER_R2_SECRET_ACCESS_KEY=sua_secret_key
VALTER_R2_BUCKET_NAME=valter-artifacts        # default
VALTER_R2_CANARY_PERCENT=0                     # 0 = tudo local, 100 = tudo R2
VALTER_R2_PRESIGN_TTL_SECONDS=600              # Validade de URLs assinadas
```

Sem credenciais R2, artefatos são armazenados localmente em `VALTER_UPLOAD_STORAGE_PATH` (default: `data/datasets/uploads/raw`).

## Configuração de produção

Quando `VALTER_ENV=production`, o Valter enforça várias verificações de segurança no startup. O servidor **não inicia** se qualquer uma delas for violada:

| Requisito | Por quê |
|-----------|---------|
| `VALTER_AUTH_ENABLED=true` | API deve exigir autenticação |
| Origens CORS explícitas (sem `["*"]`) | CORS wildcard é inseguro |
| `VALTER_METRICS_IP_ALLOWLIST` definido | `/metrics` deve ter restrição por IP |
| URI Neo4j remota (`neo4j+s://`) | Conexões bolt locais são apenas para dev |
| Senhas não-fracas | Rejeita `neo4j_dev`, `password`, `changeme`, etc. |
| Credenciais de DB não-padrão | Rejeita a conexão padrão `valter:valter_dev` |
| Redis remoto | Rejeita Redis `localhost` em produção |

Essas verificações são implementadas no validator de produção do `config.py` (linhas 95–121).

## Verificação

Após o setup, rode a suite completa de verificação:

```bash
# Rode os 660+ testes
make test

# Verificação de lint (ruff + verificação de formatação)
make lint

# Quality gate completo (lint + mypy + testes)
make quality

# Health check
curl -s http://localhost:8000/health | python -m json.tool
```

Todos os stores devem mostrar `"status": "up"` exceto Neo4j (se não configurado) e `worker_ingest` (se o worker não está rodando).

## Referência completa de targets do make

| Target | Comando | Descrição |
|--------|---------|-----------|
| `make dev` | `uvicorn ... --reload` | Servidor de desenvolvimento com hot reload (porta 8000) |
| `make test` | `pytest tests/ -v` | Rodar todos os testes |
| `make test-cov` | `pytest ... --cov=valter` | Testes com relatório de cobertura |
| `make test-neo4j-live` | `pytest tests/integration/...` | Testes de integração Neo4j (requer Aura) |
| `make lint` | `ruff check + format --check` | Verificação de lint e formatação |
| `make fmt` | `ruff check --fix + format` | Auto-fix de lint e formatação |
| `make quality` | `lint + mypy + test` | Quality gate completo |
| `make migrate` | `alembic upgrade head` | Rodar migrações do banco |
| `make docker-up` | `docker compose up -d` | Iniciar containers dos bancos |
| `make docker-down` | `docker compose down` | Parar containers dos bancos |
| `make download-model` | Python snippet | Baixar modelo de embedding para cache |
| `make validate-aura` | `python scripts/validate_aura.py` | Validar conexão Neo4j Aura |
| `make worker-ingest` | `python -m valter.workers` | Iniciar worker de jobs em background |
| `make mcp-remote` | `python -m valter.mcp.remote_server` | Iniciar servidor MCP HTTP/SSE (porta 8001) |

## Próximos passos

- **[Visão Geral da Arquitetura](/architecture/overview/)** — Como as camadas e data stores se conectam
- **[Variáveis de Ambiente](/configuration/environment/)** — Referência completa das 50+ variáveis de ambiente
- **[Referência da API](/api/)** — Todos os endpoints com schemas
- **[Convenções de Código](/development/conventions/)** — Padrões enforçados no codebase
