---
title: Variáveis de Ambiente
description: Referência completa de mais de 50 variáveis de ambiente organizadas por categoria, com valores padrão e requisitos.
lang: pt-BR
sidebar:
  order: 1

---

# Variáveis de Ambiente

Toda configuração do Valter é orientada por variáveis de ambiente com prefixo `VALTER_`. As variáveis são carregadas nesta ordem de precedência: ambiente do shell, arquivo `.env`, valores padrão internos. A classe `Settings` em `src/valter/config.py` usa `pydantic-settings` com `env_prefix="VALTER_"`.

## Core

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_ENV` | Nome do ambiente. Defina como `production` ou `prod` para ativar as proteções de produção. | `development` | Não |
| `VALTER_RUNTIME` | Modo de execução que determina qual processo é iniciado. Veja [Modos de Runtime](./settings.md#modos-de-runtime). | `api` | Não |

:::caution
Definir `VALTER_ENV=production` ativa validação rigorosa: autenticação deve estar habilitada, wildcard no CORS é bloqueado, Neo4j deve ser remoto e credenciais de banco de dados não podem ser valores padrão. Veja [Proteções de Produção](#protecoes-de-producao) abaixo.
:::

## Bancos de Dados

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_DATABASE_URL` | String de conexão PostgreSQL usando o driver `asyncpg`. | `postgresql+asyncpg://valter:valter_dev@localhost:5432/valter` | Não |
| `VALTER_QDRANT_URL` | URL do banco de dados vetorial Qdrant. | `http://localhost:6333` | Não |
| `VALTER_QDRANT_COLLECTION` | Nome da collection do Qdrant para chunks de documentos jurídicos. | `legal_chunks_v1` | Não |
| `VALTER_NEO4J_URI` | URI de conexão do Neo4j. Use `bolt://` para local, `neo4j+s://` para Aura. | `bolt://localhost:7687` | Não |
| `VALTER_NEO4J_USERNAME` | Usuário de autenticação do Neo4j. | `neo4j` | Não |
| `VALTER_NEO4J_PASSWORD` | Senha de autenticação do Neo4j. | `neo4j_dev` | Não |
| `VALTER_REDIS_URL` | URL de conexão do Redis com número do banco. | `redis://localhost:6379/0` | Não |
| `VALTER_ARQ_REDIS_DB` | Número do banco Redis para o background worker ARQ. Mantido separado do Redis principal para evitar colisão de chaves. | `1` | Não |

:::tip
Em produção, `VALTER_DATABASE_URL` não pode conter `valter_dev`, `VALTER_NEO4J_URI` deve apontar para um host remoto (não localhost) e `VALTER_NEO4J_PASSWORD` não pode ser um valor fraco como `neo4j_dev` ou `password`. A aplicação se recusa a iniciar caso contrário.
:::

## Embeddings & LLM

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_EMBEDDING_MODEL` | Identificador do modelo HuggingFace para embeddings semânticos. Baixado via `make download-model`. | `rufimelo/Legal-BERTimbau-sts-base` | Não |
| `VALTER_EMBEDDING_DIMENSION` | Dimensão do vetor produzido pelo modelo de embedding. Deve corresponder à saída do modelo. | `768` | Não |
| `VALTER_EMBEDDING_SERVICE_URL` | URL de um serviço remoto de embedding (hospedado no Railway). Quando definida, o modelo local é ignorado. | None | Não |
| `VALTER_RERANKER_SERVICE_URL` | URL de um serviço remoto de reranking (hospedado no Railway). Quando definida, o cross-encoder local é ignorado. | None | Não |
| `VALTER_GROQ_API_KEY` | API key para o Groq LLM. Habilita recursos de extração factual e expansão de queries. | None | Não |
| `VALTER_GROQ_MODEL` | Identificador do modelo usado com a API do Groq. | `qwen/qwen3-32b` | Não |
| `VALTER_GROQ_ENABLED` | Feature flag para habilitar recursos do Groq. Requer que `VALTER_GROQ_API_KEY` esteja definida. | `false` | Não |

:::note
Sem `VALTER_GROQ_API_KEY` e `VALTER_GROQ_ENABLED=true`, o sistema funciona normalmente, mas endpoints de extração factual e expansão de queries na busca híbrida ficam desabilitados. Definir `VALTER_EMBEDDING_SERVICE_URL` evita a necessidade de baixar o modelo de embedding de ~500 MB localmente.
:::

## API Server

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_API_HOST` | Endereço de host onde o servidor da API faz bind. | `0.0.0.0` | Não |
| `VALTER_API_PORT` | Porta em que o servidor da API escuta. | `8000` | Não |
| `VALTER_AUTH_ENABLED` | Habilita autenticação por API key nos endpoints REST. | `false` | **Sim (prod)** |
| `VALTER_RATE_LIMIT_READ` | Máximo de requisições de leitura por API key por minuto. | `100` | Não |
| `VALTER_RATE_LIMIT_WRITE` | Máximo de requisições de escrita por API key por minuto. | `10` | Não |
| `VALTER_CORS_ORIGINS` | Array JSON de origens CORS permitidas. | `["*"]` | Não |
| `VALTER_LOG_LEVEL` | Nível de log da aplicação (`DEBUG`, `INFO`, `WARNING`, `ERROR`). | `INFO` | Não |
| `VALTER_METRICS_IP_ALLOWLIST` | Lista de endereços IP separados por vírgula com permissão para acessar `/metrics`. | Vazio | **Sim (prod)** |

:::danger
Em produção, `VALTER_AUTH_ENABLED` deve ser `true`, `VALTER_CORS_ORIGINS` não pode conter `"*"` e `VALTER_METRICS_IP_ALLOWLIST` deve estar definida. A aplicação levanta um `ValueError` na inicialização se qualquer uma dessas restrições for violada.
:::

## Upload & Ingestão

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_UPLOAD_STORAGE_PATH` | Caminho no sistema de arquivos local onde uploads são armazenados antes do processamento. | `data/datasets/uploads/raw` | Não |
| `VALTER_MAX_UPLOAD_MB` | Tamanho máximo de upload em megabytes. Convertido para bytes internamente via a propriedade `max_upload_bytes`. | `100` | Não |
| `VALTER_INGEST_JOB_TIMEOUT_SECONDS` | Duração máxima (segundos) que um job de ingestão ARQ pode rodar antes de ser encerrado. | `1800` | Não |
| `VALTER_INGEST_WORKER_CONCURRENCY` | Número de jobs concorrentes que o worker ARQ processa. | `2` | Não |

## Cloudflare R2

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_R2_ACCOUNT_ID` | ID da conta Cloudflare. Usado para construir a URL do endpoint quando `VALTER_R2_ENDPOINT_URL` não está definida. | None | Não |
| `VALTER_R2_ACCESS_KEY_ID` | Access key compatível com S3 para o R2. | None | Não |
| `VALTER_R2_SECRET_ACCESS_KEY` | Secret key compatível com S3 para o R2. | None | Não |
| `VALTER_R2_BUCKET_NAME` | Nome do bucket R2 para armazenar artefatos de workflows. | `valter-artifacts` | Não |
| `VALTER_R2_ENDPOINT_URL` | Sobrescreve a URL do endpoint R2 construída automaticamente. | None | Não |
| `VALTER_R2_PRESIGN_TTL_SECONDS` | Tempo de vida (segundos) para URLs pré-assinadas de download. | `600` | Não |
| `VALTER_R2_CANARY_PERCENT` | Porcentagem (0-100) de uploads de artefatos roteados para o R2 em vez de armazenamento local. Use para rollout gradual. | `0` | Não |

:::note
As três credenciais (`VALTER_R2_ACCOUNT_ID`, `VALTER_R2_ACCESS_KEY_ID`, `VALTER_R2_SECRET_ACCESS_KEY`) devem ser definidas juntas para o R2 funcionar. Quando `VALTER_R2_CANARY_PERCENT` é `0` (padrão), todos os artefatos são armazenados localmente. Aumente gradualmente durante a migração para o R2.
:::

## Workflow Engine

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_WORKFLOW_TIMEOUT_SECONDS` | Timeout global para a execução completa de um workflow. | `2400` | Não |
| `VALTER_WORKFLOW_MAX_RETRIES` | Número máximo de tentativas por etapa do workflow antes de marcá-la como falha. | `3` | Não |
| `VALTER_WORKFLOW_POLL_RECOMMENDED_SECONDS` | Intervalo recomendado (segundos) para clientes consultarem o status de workflows. Retornado nas respostas da API. | `3` | Não |
| `VALTER_WORKFLOW_STRICT_INFRA_REQUIRED` | Quando `true`, workflows falham imediatamente se a infraestrutura necessária (Qdrant, Redis) estiver indisponível. Quando `false`, degradam graciosamente. | `true` | Não |

## MCP Server

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_MCP_SERVER_TRANSPORT` | Protocolo de transporte para o servidor MCP (`streamable-http` ou `stdio`). | Derivado de `VALTER_RUNTIME` | Não |
| `VALTER_MCP_SERVER_HOST` | Endereço de host onde o servidor MCP remoto faz bind. | `0.0.0.0` | Não |
| `VALTER_MCP_SERVER_PORT` | Porta em que o servidor MCP remoto escuta. Usa `$PORT` como fallback se definido (compatibilidade com Railway). | `8001` | Não |
| `VALTER_MCP_SERVER_PATH` | Caminho da URL para o endpoint HTTP do MCP. | `/mcp` | Não |
| `VALTER_MCP_SERVER_AUTH_MODE` | Modo de autenticação para requisições MCP recebidas. | `api_key` | Não |
| `VALTER_MCP_SERVER_API_KEYS` | Lista de API keys válidas para autenticação MCP, separadas por vírgula. | None | Não |
| `VALTER_MCP_API_BASE_URL` | URL base da API REST para a qual o servidor MCP delega internamente. | `http://localhost:8000` | Não |
| `VALTER_MCP_API_KEY` | API key que o servidor MCP usa ao chamar a API REST. | None | Não |
| `VALTER_MCP_RATE_LIMIT_PER_MINUTE` | Máximo de requisições MCP por minuto por cliente. | `60` | Não |

:::tip
O servidor MCP funciona como uma ponte: recebe chamadas de ferramentas de clientes LLM (ChatGPT, Claude) e as traduz em chamadas à API REST em `VALTER_MCP_API_BASE_URL`. Se a API REST tiver autenticação habilitada, defina `VALTER_MCP_API_KEY` de acordo.
:::

## Phase Analysis

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_PHASE_RULES_VERSION` | Versão das regras de classificação de fases usadas na análise processual. | `phase-rules-v1.1` | Não |
| `VALTER_PHASE_MIN_PRECEDENT_SCORE` | Score mínimo de similaridade (0-100) para que um precedente seja considerado relevante no matching de fases. | `55.0` | Não |
| `VALTER_PHASE_MAX_MATCHES_PER_PHASE` | Número máximo de matches de precedentes retornados por fase processual. | `5` | Não |

## Knowledge Graph

| Variável | Propósito | Padrão | Obrigatória? |
|---|---|---|---|
| `VALTER_KG_BOOST_BATCH_ENABLED` | Habilita o boost em lote do knowledge graph no retriever híbrido. Enriquece resultados de busca com contexto do grafo em paralelo. | `true` | Não |
| `VALTER_KG_BOOST_MAX_CONCURRENCY` | Número máximo de queries Neo4j concorrentes durante o KG boost. Ajuste conforme a capacidade do Neo4j. | `12` | Não |
| `VALTER_QUERY_EXPANSION_MAX_VARIANTS` | Número máximo de variantes de query geradas durante a expansão de busca (requer Groq). | `3` | Não |

## Proteções de Produção

A classe `Settings` aplica as seguintes restrições quando `VALTER_ENV` é definido como `production` ou `prod`. Essas validações são executadas na inicialização da aplicação e causam uma falha imediata com um `ValueError` descritivo se violadas.

**Proteções do runtime API** (ignoradas para runtimes somente MCP, que possuem autenticação própria):

- `VALTER_AUTH_ENABLED` deve ser `true`
- `VALTER_CORS_ORIGINS` não pode conter `"*"`
- `VALTER_METRICS_IP_ALLOWLIST` deve ser não vazio

**Proteções de infraestrutura** (sempre aplicadas em produção):

- `VALTER_NEO4J_URI` deve apontar para um host remoto (não `localhost` ou `127.0.0.1`)
- `VALTER_NEO4J_PASSWORD` não pode ser um valor fraco (`neo4j_dev`, `password`, `changeme`, etc.)
- `VALTER_DATABASE_URL` não pode conter `valter_dev`
- `VALTER_REDIS_URL` não pode apontar para `localhost` ou `127.0.0.1`
