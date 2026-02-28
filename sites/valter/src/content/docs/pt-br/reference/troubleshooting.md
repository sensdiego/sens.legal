---
title: Solucao de Problemas
description: Problemas comuns e solucoes ao rodar o Valter localmente ou em producao.
lang: pt-BR
sidebar:
  order: 3

---

# Solucao de Problemas

Problemas comuns encontrados durante desenvolvimento e operacao em producao, com passos de diagnostico e solucoes.

## Conectividade com Bancos de Dados

### Neo4j retorna 503 nos endpoints de grafo

**Sintoma:** Endpoints de analitico de grafo (`/v1/graph/*`) retornam `503 Service Unavailable`.

**Causa:** O Neo4j nao esta incluido no `docker-compose.yml` por design. Ele deve ser configurado separadamente.

**Solucao:**

Opcao A -- Neo4j local:

```bash
# Instalar e iniciar Neo4j localmente
brew install neo4j  # macOS
neo4j start
```

Opcao B -- Neo4j Aura (cloud):

```bash
# Defina estes valores no seu arquivo .env
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
```

:::note
Endpoints que nao dependem de grafo (busca, verificacao, enriquecimento) funcionam sem o Neo4j. Features de grafo degradam graciosamente -- resultados de busca simplesmente nao recebem scores de KG boost.
:::

### Conexao recusada do Redis

**Sintoma:** `ConnectionRefusedError` ao iniciar ou `redis.exceptions.ConnectionError` durante requests.

**Causa:** O container do Redis nao esta rodando.

**Solucao:**

```bash
# Iniciar containers de infraestrutura (PostgreSQL, Redis, Qdrant)
make docker-up

# Verificar se o Redis esta rodando
docker compose ps redis
```

**Impacto se o Redis estiver fora:**
- Cache desabilitado (requests consultam o banco diretamente)
- Rate limiting falha **fechado** -- todas as requests sao bloqueadas (v1.0 corrigira para fail-open)
- Workers ARQ em background nao conseguem processar jobs

### Falhas de migracao do PostgreSQL

**Sintoma:** `alembic upgrade head` falha com conflitos de schema ou erros de conexao.

**Causa:** Banco nao esta rodando, ou historico de migracoes esta fora de sincronia.

**Solucao:**

```bash
# Garantir que o PostgreSQL esta rodando
make docker-up

# Rodar migracoes
make migrate

# Se houver conflitos, verificar o historico de migracoes
alembic -c migrations/alembic.ini history

# Para ver a revisao atual do banco
alembic -c migrations/alembic.ini current
```

Se uma migracao falhar no meio:

1. Verifique em qual revisao o banco esta com `alembic current`
2. Revise a migracao que falhou em `migrations/versions/`
3. Se a migracao tem uma funcao `downgrade()`, voce pode reverter: `alembic -c migrations/alembic.ini downgrade -1`
4. Se a migracao e marcada como irreversivel, consulte o PR que a introduziu para um plano de contingencia

:::danger
Nunca execute `alembic downgrade` em producao sem um plano de rollback explicito. Migracoes irreversiveis (aquelas sem `downgrade()`) requerem intervencao manual no banco.
:::

---

## Modelo de Embedding

### Download do modelo falha ou esta lento

**Sintoma:** `make download-model` trava, atinge timeout ou falha com erro de rede.

**Causa:** Downloads de modelos do Hugging Face podem ser grandes (~500MB para Legal-BERTimbau) e sao afetados por condicoes de rede.

**Solucao:**

```bash
# Tentar novamente o download
make download-model

# Se o download continua falhando, verifique sua rede e o status do HuggingFace
curl -I https://huggingface.co

# Alternativa: usar um servico de embedding remoto em vez do modelo local
# Defina no .env:
VALTER_EMBEDDING_SERVICE_URL=https://your-embedding-service/encode
```

O modelo e cacheado em `~/.cache/huggingface/` apos o primeiro download bem-sucedido. Inicializacoes subsequentes usarao o cache.

:::tip
Se voce esta atras de um proxy corporativo, defina `HTTP_PROXY` e `HTTPS_PROXY` antes de executar `make download-model`.
:::

### Incompatibilidade de dimensao no Qdrant

**Sintoma:** A busca retorna um erro sobre dimensoes de vetor nao coincidindo com a configuracao da collection.

**Causa:** A collection do Qdrant foi criada com uma dimensao de embedding diferente da que o modelo atual produz. Isso acontece ao trocar modelos de embedding (ex: de um modelo 384d para o Legal-BERTimbau 768d).

**Solucao:**

1. Verificar a dimensao do modelo atual:

```bash
python -c "from sentence_transformers import SentenceTransformer; m = SentenceTransformer('rufimelo/Legal-BERTimbau-sts-base'); print(m.get_sentence_embedding_dimension())"
# Saida esperada: 768
```

2. Verificar se a variavel de ambiente `VALTER_EMBEDDING_DIMENSION` corresponde:

```bash
# No .env
VALTER_EMBEDDING_DIMENSION=768
```

3. Se a collection foi criada com a dimensao errada, ela deve ser recriada:

```bash
# ATENCAO: Isso deleta todos os vetores indexados. Voce precisara re-indexar.
python -c "from qdrant_client import QdrantClient; c = QdrantClient('localhost', port=6333); c.delete_collection('valter_documents')"
```

Apos deletar a collection, reinicie a aplicacao -- ela recriara a collection com a dimensao correta ao iniciar.

---

## Problemas de OCR

### OCR falha com ImportError

**Sintoma:** `ImportError: No module named 'pytesseract'` ou `FileNotFoundError: tesseract is not installed`.

**Causa:** OCR tem duas dependencias -- o pacote Python e o binario do sistema. Ambos devem estar instalados.

**Solucao:**

```bash
# Instalar os extras de OCR do Python
pip install -e ".[ocr]"

# Instalar o binario Tesseract do sistema
# macOS:
brew install tesseract tesseract-lang

# Ubuntu/Debian:
sudo apt-get install tesseract-ocr tesseract-ocr-por

# Verificar instalacao
tesseract --version
```

:::note
OCR e opcional. Se nao instalado, a extracao de texto faz fallback para `pdfplumber`, que funciona bem para PDFs gerados digitalmente mas nao consegue extrair texto de documentos escaneados.
:::

---

## Servidor MCP

### MCP stdio nao conecta ao Claude Desktop

**Sintoma:** O Claude Desktop nao lista as tools do Valter, ou mostra um erro de conexao.

**Causa:** Configuracao incorreta do `claude_desktop_config.json`.

**Solucao:**

1. Verifique seu arquivo de configuracao do Claude Desktop (localizacao depende do SO):

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp.stdio_server"],
      "env": {
        "PYTHONPATH": "/path/to/Valter/src"
      }
    }
  }
}
```

2. Problemas comuns a verificar:
   - O `command` deve apontar para o binario Python correto (use o caminho completo se estiver usando um ambiente virtual: `/path/to/Valter/.venv/bin/python`)
   - `PYTHONPATH` deve incluir o diretorio `src/`
   - Variaveis de ambiente necessarias pelo Valter (URLs de banco, API keys) devem estar presentes no bloco `env` ou serem herdadas do shell

3. Reinicie o Claude Desktop apos alterar a configuracao.

### MCP remote retorna 401 Unauthorized

**Sintoma:** Cliente MCP remoto recebe `401 Unauthorized` ao chamar tools.

**Causa:** API key invalida ou ausente na request.

**Solucao:**

1. Verifique se as API keys estao configuradas no servidor:

```bash
# No .env — lista separada por virgula de keys validas
VALTER_MCP_SERVER_API_KEYS=key1,key2
```

2. Verifique se o cliente esta enviando a key corretamente (como Bearer token ou no header configurado).

3. Inicie o servidor MCP remote e verifique os logs para erros de autenticacao:

```bash
make mcp-remote
# Observe entradas 401 na saida de log estruturado
```

:::caution
API keys sao validadas via HMAC. Certifique-se de que nao ha caracteres de espaco em branco no final dos valores de key no seu arquivo `.env`.
:::

---

## Desenvolvimento

### ruff nao encontrado

**Sintoma:** `make lint` falha com `ruff: command not found`.

**Causa:** O ambiente virtual nao esta ativado, ou `ruff` nao esta instalado.

**Solucao:**

```bash
# Ativar o ambiente virtual
source .venv/bin/activate

# Se ruff nao esta instalado
pip install ruff

# Entao execute o lint
make lint
```

### Testes falham com erros de async

**Sintoma:** Testes falham com `RuntimeError: no current event loop` ou `PytestUnraisableExceptionWarning` relacionado a asyncio.

**Causa:** O modo do `pytest-asyncio` nao esta configurado corretamente.

**Solucao:**

Verifique se o `pyproject.toml` tem o modo asyncio correto:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

Se a configuracao esta correta mas os testes ainda falham, verifique se `pytest-asyncio` esta instalado:

```bash
pip install pytest-asyncio
```

### Erros de verificacao de tipo com mypy

**Sintoma:** `make quality` falha na etapa do mypy com erros de tipo.

**Causa:** Type stubs faltando ou violacoes de tipagem estrita.

**Solucao:**

O target `quality` executa mypy apenas em um subconjunto de arquivos definido (definido em `MYPY_QUALITY_SCOPE` no Makefile). Se voce esta adicionando novos arquivos ao escopo, garanta que eles tenham anotacoes de tipo completas em todas as funcoes publicas.

```bash
# Executar mypy apenas nos arquivos no escopo
mypy --follow-imports=silent src/valter/api/deps.py src/valter/api/routes/ingest.py src/valter/mcp/tools.py
```

---

## Producao

### Rate limiting bloqueia todas as requests

**Sintoma:** Todas as requests de API retornam `429 Too Many Requests` ou `503 Service Unavailable`, mesmo com trafego baixo.

**Causa:** Redis esta fora e o rate limiter esta configurado para **fail-closed**. Quando o Redis esta inacessivel, nenhuma verificacao de rate limit pode passar, entao todas as requests sao rejeitadas.

**Solucao (imediata):**

```bash
# Reiniciar Redis
docker compose restart redis

# Verificar se o Redis esta respondendo
docker compose exec redis redis-cli ping
# Esperado: PONG
```

**Solucao (permanente):** Isto esta rastreado como a correcao de maior prioridade para v1.0 -- mudar o rate limiter para fail-open para API keys validas quando o Redis estiver indisponivel.

:::danger
Ate que a v1.0 entregue a correcao fail-open, uma queda do Redis em producao significa que **100% do trafego e bloqueado**. Garanta que monitoramento de saude do Redis e automacao de reinicio estejam em vigor.
:::

### Alta latencia nos endpoints de grafo

**Sintoma:** Endpoints de analitico de grafo levam > 10s para responder ou atingem timeout.

**Causa:** Travessias complexas de grafo em subgrafos grandes, ou o Neo4j esta sob pressao de memoria.

**Solucao:**

1. Verifique a alocacao de memoria do Neo4j -- o padrao pode ser insuficiente para o grafo de ~28.000 nos / ~207.000 relacionamentos
2. Verifique se indices de grafo existem para propriedades frequentemente consultadas (numero da decisao, nome do ministro, dispositivo legal)
3. Para Neo4j Aura: verifique o tier da instancia e se voce esta atingindo limites de query

> **Feature Planejada** -- v1.1 adicionara um circuit breaker que abre apos o Neo4j travar por > 5s, permitindo que requests prossigam sem features de grafo em vez de bloquear indefinidamente.
