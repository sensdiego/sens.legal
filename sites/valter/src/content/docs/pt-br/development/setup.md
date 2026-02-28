---
title: Configuração do Ambiente de Desenvolvimento
description: Guia completo para configurar um ambiente de desenvolvimento local para o Valter.
lang: pt-BR
sidebar:
  order: 1

---

# Configuração do Ambiente de Desenvolvimento

Este guia percorre a configuração completa de um ambiente de desenvolvimento local para o Valter, desde a instalação dos pré-requisitos até a verificação de que todos os serviços estão rodando.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados:

| Ferramenta | Versão | Propósito |
|---|---|---|
| Python | >= 3.12 | Linguagem de runtime |
| Docker + Docker Compose | Estável recente | Serviços de banco de dados (PostgreSQL, Qdrant, Redis) |
| make | Qualquer | Interface canônica de comandos |
| Git | Qualquer | Controle de versão |
| uv (recomendado) | Recente | Gerenciador de pacotes Python rápido. Usa `pip` como fallback se indisponível. |

**Requisitos de recursos:** aproximadamente 4 GB de RAM e 3 GB de espaço em disco (incluindo o modelo de embedding).

## Passo 1: Clonar e Instalar Dependências

Clone o repositório e crie um ambiente virtual Python:

```bash
git clone <repo-url>
cd Valter
python -m venv .venv
source .venv/bin/activate
```

Instale todas as dependências incluindo ferramentas de desenvolvimento:

```bash
# Preferido: usando uv (mais rápido)
uv pip install -e ".[dev]"

# Alternativa: usando pip
pip install -e ".[dev]"
```

Isso instala FastAPI, SQLAlchemy, cliente Qdrant, driver Neo4j, sentence-transformers e todas as ferramentas de desenvolvimento (pytest, ruff, mypy).

## Passo 2: Iniciar os Serviços de Banco de Dados

O arquivo `docker-compose.yml` define três serviços de banco de dados para desenvolvimento local:

```bash
make docker-up
```

Isso inicia os seguintes containers:

| Serviço | Imagem | Porta | Propósito |
|---|---|---|---|
| PostgreSQL | `postgres:16-alpine` | 5432 | Metadados de documentos, migrações |
| Qdrant | `qdrant/qdrant:latest` | 6333 | Busca por similaridade vetorial |
| Redis | `redis:7-alpine` | 6379 | Cache, rate limiting, fila de jobs ARQ |

Verifique se os serviços estão rodando:

```bash
docker compose ps
```

Os três containers devem mostrar status `running`.

:::note
O Neo4j não está incluído no `docker-compose.yml`. Para recursos de grafo, rode o Neo4j localmente via Docker (veja [configuração do Neo4j](../configuration/integrations.md#desenvolvimento-local-community-edition)) ou conecte-se a uma instância Neo4j Aura. Recursos de grafo são opcionais para desenvolvimento básico.
:::

## Passo 3: Configurar o Ambiente

A maioria das variáveis de ambiente possui valores padrão que funcionam com a stack do `docker-compose.yml`. Para desenvolvimento básico, nenhum arquivo `.env` é necessário.

Para habilitar recursos opcionais, crie um arquivo `.env` na raiz do projeto:

```bash
# .env (opcional — apenas para recursos que você precisa)

# Groq LLM (habilita extração factual, expansão de queries)
# VALTER_GROQ_API_KEY=gsk_your_key_here
# VALTER_GROQ_ENABLED=true

# Neo4j (habilita recursos de grafo)
# VALTER_NEO4J_URI=bolt://localhost:7687

# Embedding remoto (pula download do modelo local)
# VALTER_EMBEDDING_SERVICE_URL=https://your-service.up.railway.app
```

Consulte a referência de [Variáveis de Ambiente](../configuration/environment.md) para todas as opções disponíveis.

## Passo 4: Executar Migrações do Banco de Dados

Aplique as migrações Alembic para configurar o schema do PostgreSQL:

```bash
make migrate
```

Isso executa `alembic upgrade head` usando a configuração em `migrations/alembic.ini`. A migração conecta ao banco de dados definido por `VALTER_DATABASE_URL` (por padrão, o PostgreSQL local do docker-compose).

:::caution
Se as migrações falharem com erro de conexão, verifique se o container PostgreSQL está rodando com `docker compose ps` e se a porta 5432 está acessível.
:::

## Passo 5: Baixar o Modelo de Embedding

O recurso de busca semântica requer um modelo de embedding pré-treinado:

```bash
make download-model
```

Isso baixa `rufimelo/Legal-BERTimbau-sts-base` (~500 MB) do HuggingFace Hub e faz cache em `~/.cache/huggingface/`. O download precisa ser feito apenas uma vez.

Para usar um modelo diferente:

```bash
VALTER_EMBEDDING_MODEL=my-org/my-model make download-model
```

:::tip
Se você definir `VALTER_EMBEDDING_SERVICE_URL` no seu `.env` para apontar a um serviço de encoding remoto, pode pular este passo inteiramente. O serviço remoto cuida da geração de embeddings.
:::

## Passo 6: Verificar a Configuração

### Iniciar o servidor de desenvolvimento

```bash
make dev
```

A API inicia em `http://localhost:8000`. Verifique com:

```bash
curl http://localhost:8000/v1/health
```

Uma resposta bem-sucedida confirma que a API está rodando e as conexões com os bancos de dados estão saudáveis.

### Executar a suíte de testes

```bash
make test
```

Isso executa mais de 660 testes entre suítes unitárias, de regressão e MCP. Todos os testes devem passar sem dependências de serviços externos (stores são mockados nos testes unitários).

### Executar linting

```bash
make lint
```

Isso executa `ruff check` e `ruff format --check` em `src/` e `tests/`.

## Targets do Make

O `Makefile` é a interface canônica de comandos. Use `make <target>` para todas as operações rotineiras.

| Target | Descrição |
|---|---|
| `make dev` | Inicia servidor de desenvolvimento com hot reload (porta 8000) |
| `make test` | Executa a suíte completa do pytest |
| `make test-cov` | Executa testes com relatório de cobertura |
| `make test-neo4j-live` | Executa testes de integração Neo4j (requer credenciais Aura) |
| `make lint` | Verifica estilo de código com ruff (check + verificação de formatação) |
| `make fmt` | Corrige automaticamente problemas de estilo e formata o código |
| `make quality` | Executa lint, mypy (com escopo) e testes juntos |
| `make migrate` | Aplica migrações de banco de dados Alembic |
| `make worker-ingest` | Inicia o background worker ARQ para jobs de ingestão |
| `make mcp-remote` | Inicia o servidor MCP HTTP (porta 8001) |
| `make docker-up` | Inicia containers de banco de dados (PostgreSQL, Qdrant, Redis) |
| `make docker-down` | Para e remove containers de banco de dados |
| `make download-model` | Baixa o modelo de embedding do HuggingFace |
| `make validate-aura` | Valida queries de grafo contra uma instância Neo4j Aura ao vivo |

:::tip
Use `make quality` antes de enviar código. Ele executa linting, verificação de tipos e a suíte completa de testes em sequência, correspondendo ao pipeline de validação do CI.
:::

## Solução de Problemas

### Erros de conexão com banco de dados

Se `make migrate` ou `make dev` falhar ao conectar ao PostgreSQL:

```bash
# Verifique se os containers estão rodando
docker compose ps

# Verifique os logs do PostgreSQL
docker compose logs postgres

# Reinicie a stack
make docker-down && make docker-up
```

### Conflitos de porta

Se a porta 5432, 6333 ou 6379 já estiver em uso, pare o serviço conflitante ou modifique os mapeamentos de porta no `docker-compose.yml`.

### Falhas no download do modelo

Se `make download-model` falhar por problemas de rede, tente novamente ou defina `VALTER_EMBEDDING_SERVICE_URL` para usar um serviço de encoding remoto.
