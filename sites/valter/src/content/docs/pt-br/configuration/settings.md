---
title: Configurações e Arquivos de Configuração
description: Arquivos de configuração, modos de runtime e feature flags no Valter.
lang: pt-BR
sidebar:
  order: 2

---

# Configurações e Arquivos de Configuração

O Valter centraliza toda configuração em uma única classe Pydantic Settings que carrega valores de variáveis de ambiente e arquivos `.env`. Esta página explica a arquitetura de configuração, os modos de runtime, feature flags e os arquivos de configuração do projeto.

## Sistema de Configuração

A classe `Settings` em `src/valter/config.py` estende `pydantic_settings.BaseSettings` e serve como fonte única da verdade para toda a configuração da aplicação. Utiliza o prefixo `VALTER_` para resolução de variáveis de ambiente.

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "development"
    DATABASE_URL: str = "postgresql+asyncpg://valter:valter_dev@localhost:5432/valter"
    # ... 50+ campos com valores padrão sensatos

    model_config = {
        "env_prefix": "VALTER_",
        "env_file": ".env",
    }
```

### Ordem de Carregamento

Os valores são resolvidos nesta ordem (primeira correspondência prevalece):

1. **Variáveis de ambiente do shell** -- maior prioridade, sempre sobrescrevem
2. **Arquivo `.env`** -- conveniente para desenvolvimento local
3. **Valores padrão dos campos** -- definidos na própria classe `Settings`

Uma instância singleton é criada no nível do módulo:

```python
settings = Settings()
```

Essa instância é importada onde a configuração é necessária e injetada via `Depends()` do FastAPI quando apropriado.

### Validação de Produção

A classe `Settings` inclui um `@model_validator` que executa após todos os campos serem carregados. Quando `VALTER_ENV` é `production` ou `prod`, valida restrições críticas de segurança e levanta um `ValueError` na inicialização se alguma for violada. Veja [Variáveis de Ambiente > Proteções de Produção](./environment.md#protecoes-de-producao) para a lista completa.

### Propriedades Computadas

Vários valores de configuração são derivados das configurações brutas via métodos `@property`:

| Propriedade | Computação |
|---|---|
| `max_upload_bytes` | `MAX_UPLOAD_MB * 1024 * 1024` |
| `is_production` | `ENV.strip().lower() in {"production", "prod"}` |
| `r2_endpoint_url` | Usa `R2_ENDPOINT_URL` se definida, caso contrário constrói a partir de `R2_ACCOUNT_ID` |
| `r2_canary_percent` | Limita `R2_CANARY_PERCENT` ao intervalo 0-100 |
| `arq_redis_url` | Substitui o número do DB em `REDIS_URL` por `ARQ_REDIS_DB` |
| `metrics_ip_allowlist` | Faz parsing de string separada por vírgulas em `list[str]` |

## Modos de Runtime

A variável `VALTER_RUNTIME` determina qual processo é iniciado. A lógica de roteamento vive em `scripts/start-command.sh`, que é o entrypoint do container.

| Modo | Valor | Processo | Porta |
|---|---|---|---|
| REST API | `api` | `uvicorn valter.main:app` | 8000 |
| Background worker | `worker` | `python -m valter.workers` | N/A |
| MCP remote server | `mcp-remote` | `python -m valter.mcp.remote_server` | 8001 |
| MCP stdio server | `mcp-stdio` | `python -m valter.mcp.remote_server` (transporte stdio) | N/A |

Cada modo inicializa componentes diferentes. O modo API inicia o FastAPI com middleware, rotas e conexões com bancos de dados. O modo worker inicia o processador de jobs ARQ para tarefas de ingestão em background. Os modos MCP iniciam um servidor Model Context Protocol que faz a ponte entre chamadas de ferramentas de LLMs e a API REST.

:::note
Os modos `mcp-remote` e `mcp-stdio` usam o mesmo módulo Python (`valter.mcp.remote_server`), diferindo apenas no transporte. O script de inicialização define `VALTER_MCP_SERVER_TRANSPORT` de acordo.
:::

Para desenvolvimento local, você geralmente inicia cada modo separadamente:

```bash
make dev            # Inicia modo API na porta 8000
make worker-ingest  # Inicia worker ARQ
make mcp-remote     # Inicia servidor MCP HTTP na porta 8001
```

Em deploys no Railway, cada modo roda como um serviço separado com `VALTER_RUNTIME` definido no ambiente do serviço.

## Feature Flags

Diversas variáveis booleanas ou numéricas funcionam como feature flags, habilitando funcionalidades que estão desligadas por padrão:

| Flag | Padrão | O que habilita |
|---|---|---|
| `VALTER_GROQ_ENABLED` | `false` | Recursos do Groq LLM: extração factual (`POST /v1/factual/extract`), expansão de queries na busca híbrida. Requer `VALTER_GROQ_API_KEY`. |
| `VALTER_AUTH_ENABLED` | `false` | Autenticação por API key nos endpoints REST. Deve ser `true` em produção. |
| `VALTER_KG_BOOST_BATCH_ENABLED` | `true` | Boost em lote do knowledge graph no retriever híbrido. Enriquece resultados da busca vetorial com contexto de grafo do Neo4j. |
| `VALTER_R2_CANARY_PERCENT` | `0` | Porcentagem de uploads de artefatos roteados para o Cloudflare R2. Em `0`, todos os artefatos são armazenados localmente. Aumente para migração gradual ao R2. |
| `VALTER_WORKFLOW_STRICT_INFRA_REQUIRED` | `true` | Quando `true`, workflows falham imediatamente se a infraestrutura necessária estiver indisponível. Quando `false`, degradam graciosamente. |

## Arquivos de Configuração

Além de variáveis de ambiente, o Valter utiliza diversos arquivos de configuração:

| Arquivo | Propósito |
|---|---|
| `pyproject.toml` | Metadados do projeto, dependências e configuração de ferramentas (ruff, pytest, mypy, hatch) |
| `docker-compose.yml` | Stack de bancos de dados para desenvolvimento local (PostgreSQL 16, Qdrant, Redis 7) |
| `Dockerfile` | Imagem de container para produção |
| `railway.json` | Configuração de deploy no Railway.app |
| `Makefile` | Interface canônica de comandos para todas as tarefas de desenvolvimento e operação |
| `.env` | Sobrescrita local de variáveis de ambiente (ignorado pelo git) |
| `migrations/alembic.ini` | Configuração de migrações de banco de dados com Alembic |

## Arquivo .env

Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto. A maioria das variáveis possui valores padrão sensatos que funcionam com a stack do `docker-compose.yml`, então apenas um `.env` mínimo é necessário:

```bash
# .env (desenvolvimento local)
# Esses padrões funcionam com docker-compose.yml — sobrescreva apenas o que precisar.

# Opcional: habilitar recursos do Groq LLM
# VALTER_GROQ_API_KEY=gsk_your_key_here
# VALTER_GROQ_ENABLED=true

# Opcional: Neo4j Aura para recursos de grafo
# VALTER_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
# VALTER_NEO4J_USERNAME=neo4j
# VALTER_NEO4J_PASSWORD=your_aura_password

# Opcional: serviço remoto de embedding (pula download do modelo local)
# VALTER_EMBEDDING_SERVICE_URL=https://your-railway-service.up.railway.app
```

:::caution
Nunca faça commit do arquivo `.env` no controle de versão. Ele está listado no `.gitignore`. Para a lista completa de variáveis disponíveis, consulte a referência de [Variáveis de Ambiente](./environment.md).
:::
