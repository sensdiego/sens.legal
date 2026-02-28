---
title: Integrações Externas
description: Como configurar conexões com Groq, Cloudflare R2, Railway, Neo4j Aura e HuggingFace.
lang: pt-BR
sidebar:
  order: 3

---

# Integrações Externas

O Valter se integra com diversos serviços externos. Cada integração é opcional para desenvolvimento local, mas pode ser obrigatória em staging ou produção. Esta página fornece o passo a passo de configuração para cada serviço.

## Groq API

O Groq oferece inferência LLM de alta velocidade, usada para classificação de documentos, extração factual e expansão de queries na busca híbrida.

### O que habilita

- `POST /v1/factual/extract` -- extrai dados factuais estruturados de documentos jurídicos
- Expansão de queries na busca híbrida -- gera variantes semânticas das consultas do usuário para maior cobertura

### Configuração

1. Crie uma conta em [console.groq.com](https://console.groq.com) e gere uma API key.

2. Defina as seguintes variáveis de ambiente:

```bash
VALTER_GROQ_API_KEY=gsk_your_key_here
VALTER_GROQ_ENABLED=true
# Opcional: sobrescrever o modelo padrão
# VALTER_GROQ_MODEL=qwen/qwen3-32b
```

3. Verifique iniciando a API e confirmando que os endpoints factuais respondem sem erros.

### Sem Groq

Quando o Groq não está configurado, o sistema opera normalmente com estas diferenças:

- Endpoints de extração factual retornam um erro indicando que o recurso está desabilitado
- A busca híbrida funciona sem expansão de queries (query única apenas)
- Nenhum custo de LLM é incorrido

## Cloudflare R2

O Cloudflare R2 oferece armazenamento de objetos compatível com S3 para artefatos de workflows (PDFs gerados, relatórios JSON). Substitui o armazenamento em sistema de arquivos local para deploys de produção.

### Configuração

1. No painel da Cloudflare, crie um bucket R2 e gere credenciais de API compatíveis com S3.

2. Defina as seguintes variáveis de ambiente:

```bash
VALTER_R2_ACCOUNT_ID=your_cloudflare_account_id
VALTER_R2_ACCESS_KEY_ID=your_access_key
VALTER_R2_SECRET_ACCESS_KEY=your_secret_key
# Opcional: sobrescrever padrões
# VALTER_R2_BUCKET_NAME=valter-artifacts
# VALTER_R2_PRESIGN_TTL_SECONDS=600
```

3. A URL do endpoint R2 é construída automaticamente a partir do account ID (`https://{account_id}.r2.cloudflarestorage.com`). Sobrescreva com `VALTER_R2_ENDPOINT_URL` se necessário.

### Rollout canário

Use `VALTER_R2_CANARY_PERCENT` para migrar gradualmente o armazenamento de artefatos do disco local para o R2:

```bash
# Começar com 10% dos uploads indo para o R2
VALTER_R2_CANARY_PERCENT=10

# Após validação, aumentar para 50%
VALTER_R2_CANARY_PERCENT=50

# Migração completa
VALTER_R2_CANARY_PERCENT=100
```

O valor é limitado ao intervalo 0-100 internamente.

### Sem R2

Quando as credenciais do R2 não estão definidas, todos os artefatos são armazenados localmente em `VALTER_UPLOAD_STORAGE_PATH` (padrão: `data/datasets/uploads/raw`). Este é o comportamento padrão e é adequado para desenvolvimento.

## Neo4j Aura

O Neo4j Aura é um serviço gerenciado de banco de dados de grafos. É o backend de grafo obrigatório para ambientes de staging e produção. O desenvolvimento local pode usar tanto o Neo4j Community Edition quanto o Aura.

### Desenvolvimento local (Community Edition)

1. Execute o Neo4j localmente via Docker (não incluído no `docker-compose.yml` por padrão):

```bash
docker run -d \
  --name neo4j-dev \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/neo4j_dev \
  neo4j:5-community
```

2. Use as configurações de conexão padrão (nenhuma alteração no `.env` necessária):

```bash
VALTER_NEO4J_URI=bolt://localhost:7687
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=neo4j_dev
```

### Configuração do Aura (staging/produção)

1. Crie uma instância Aura em [console.neo4j.io](https://console.neo4j.io). Salve a URI de conexão, o usuário e a senha da tela de criação da instância.

2. Defina as variáveis de ambiente:

```bash
VALTER_NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
VALTER_NEO4J_USERNAME=neo4j
VALTER_NEO4J_PASSWORD=your_aura_password
```

3. Valide a conexão:

```bash
make validate-aura
```

:::caution
Qualquer PR que modifique código relacionado a grafos (arquivos em `stores/graph.py`, queries Cypher, endpoints de grafo) deve passar `make validate-aura` antes do merge. Isso executa `scripts/validate_aura.py` com um threshold de latência de 15 segundos para garantir compatibilidade com o serviço gerenciado.
:::

### Restrições de produção

Em produção (`VALTER_ENV=production`), a aplicação aplica:

- `VALTER_NEO4J_URI` não pode apontar para `localhost` ou `127.0.0.1`
- `VALTER_NEO4J_PASSWORD` não pode ser um valor fraco (`neo4j_dev`, `password`, `changeme`, etc.)

## Railway.app

O Railway hospeda os ambientes de produção e staging do Valter. Cada modo de runtime roda como um serviço Railway separado compartilhando o mesmo codebase.

### Arquitetura de serviços

| Serviço Railway | `VALTER_RUNTIME` | Propósito |
|---|---|---|
| API | `api` | Servidor da API REST |
| Worker | `worker` | Processador de jobs de ingestão em background |
| MCP Remote | `mcp-remote` | Servidor MCP HTTP para ChatGPT/Claude |

### Configuração de deploy

O deploy é configurado por dois arquivos:

- `railway.json` -- configurações de build e deploy específicas do Railway
- `Dockerfile` -- definição da imagem de container

O entrypoint do container é `scripts/start-command.sh`, que lê `VALTER_RUNTIME` e inicia o processo apropriado. A variável `$PORT` do Railway é respeitada automaticamente.

### Configurando um novo serviço Railway

1. Conecte o repositório GitHub ao Railway.
2. Crie três serviços a partir do mesmo repositório, cada um com um `VALTER_RUNTIME` diferente.
3. Defina todas as variáveis de ambiente `VALTER_*` necessárias no painel do Railway para cada serviço. Consulte [Variáveis de Ambiente](./environment.md) para a referência completa.
4. Garanta que `VALTER_ENV=production` para serviços de produção.

:::note
O serviço MCP remoto usa `$PORT` do Railway como fallback para `VALTER_MCP_SERVER_PORT`. O script de inicialização lida com isso automaticamente.
:::

### Serviços remotos

Para deploys de produção, você pode descarregar embedding e reranking para serviços Railway dedicados:

```bash
VALTER_EMBEDDING_SERVICE_URL=https://your-embedding-service.up.railway.app
VALTER_RERANKER_SERVICE_URL=https://your-reranker-service.up.railway.app
```

Isso evita embutir o modelo de embedding de ~500 MB no container principal.

## HuggingFace

O Valter usa um modelo HuggingFace para gerar embeddings semânticos de documentos jurídicos. O modelo padrão é `rufimelo/Legal-BERTimbau-sts-base`, um modelo de domínio jurídico em português que produz vetores de 768 dimensões.

### Baixando o modelo

```bash
make download-model
```

Isso baixa o modelo do HuggingFace Hub e faz cache em `~/.cache/huggingface/`. O download é de aproximadamente 500 MB e precisa ser feito apenas uma vez.

### Sobrescrevendo o modelo

Para usar um modelo de embedding diferente, defina a variável de ambiente antes de baixar:

```bash
VALTER_EMBEDDING_MODEL=my-org/my-model make download-model
```

:::caution
Mudar o modelo de embedding altera as dimensões dos vetores e invalida todos os vetores existentes no Qdrant. Todos os documentos devem ser re-ingeridos após trocar de modelo. Atualize `VALTER_EMBEDDING_DIMENSION` para corresponder à dimensão de saída do novo modelo.
:::

### Alternativa de encoding remoto

Se preferir não rodar o modelo localmente (ex.: em CI ou containers leves), defina `VALTER_EMBEDDING_SERVICE_URL` para apontar a um serviço de encoding remoto:

```bash
VALTER_EMBEDDING_SERVICE_URL=https://your-embedding-service.up.railway.app
```

Quando esta variável está definida, o modelo local não é carregado e `make download-model` não é necessário. O mesmo se aplica ao reranker via `VALTER_RERANKER_SERVICE_URL`.
