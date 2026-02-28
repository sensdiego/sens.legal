---
title: Guia de Testes
description: Como executar e escrever testes no Valter — framework, estatísticas de cobertura, padrões de mocking e categorias de teste.
lang: pt-BR
sidebar:
  order: 3

---

# Guia de Testes

O Valter usa pytest com pytest-asyncio para suporte a testes assíncronos. A suíte de testes abrange 64 arquivos com aproximadamente 12.200 linhas de código de teste, cobrindo testes unitários, de integração, regressão e MCP.

## Executando Testes

Todos os comandos de teste usam targets do Make:

```bash
make test             # Executa a suíte completa (660+ testes)
make test-cov         # Executa com relatório de cobertura (formato term-missing)
make test-neo4j-live  # Executa testes de integração Neo4j (requer credenciais Aura)
make lint             # Verifica estilo de código (ruff check + verificação de formatação)
make quality          # Executa lint + mypy (com escopo) + testes em sequência
```

Para executar um arquivo de teste ou função específica:

```bash
pytest tests/unit/test_graph_routes.py -v
pytest tests/unit/test_features_search.py::test_empty_results -v
```

:::tip
Use `make quality` antes de enviar código. Ele executa as mesmas verificações que o CI: linting, verificação de tipos (em arquivos com escopo) e a suíte completa de testes.
:::

## Configuração de Testes

A configuração dos testes está no `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

Configurações principais:

- **`testpaths`**: o pytest descobre testes apenas dentro de `tests/`
- **`asyncio_mode = "auto"`**: todas as funções `async def test_*` rodam como testes assíncronos automaticamente, sem necessidade do decorator `@pytest.mark.asyncio`
- **Fixtures globais**: definidas em `tests/conftest.py`, incluindo `settings` (instância de `Settings` segura para testes) e `live_graph_store` (conexão Neo4j Aura, ignorada se credenciais não estiverem presentes)

## Categorias de Teste

### Testes Unitários (57 arquivos, ~10.000 linhas)

Testes unitários cobrem lógica central, handlers de rotas, stores (mockados), autenticação e modelos. Rodam sem dependências de serviços externos.

Arquivos de teste principais:

| Arquivo | Testes | Cobertura |
|---|---|---|
| `test_graph_routes.py` | ~162 | Endpoints da API de grafo (divergências, argumento ótimo, etc.) |
| `test_features_search.py` | ~40 | Busca híbrida, filtragem, ranking |
| `test_retriever.py` | ~27 | Lógica do retriever, KG boost, expansão de queries |
| `test_mcp_tools.py` | ~28 | Registro e validação de ferramentas MCP |

**Padrão:** todas as dependências externas (stores, Redis, Neo4j, Qdrant) são mockadas usando `unittest.mock.AsyncMock` ou `MagicMock`. Nenhuma conexão com serviço ao vivo nos testes unitários.

### Testes de Integração (3 arquivos, ~350 linhas)

Testes de integração rodam contra uma instância Neo4j Aura ao vivo e verificam o comportamento de queries de grafo de ponta a ponta.

| Arquivo | Propósito |
|---|---|
| `test_kg_live_graph.py` | Corretude de queries do knowledge graph |
| `test_retriever_kg_live.py` | Retriever com KG boost real |
| `test_graph_store_live.py` | Métodos do graph store contra dados reais |

Esses testes **são ignorados automaticamente** se as variáveis de ambiente do Neo4j (`VALTER_NEO4J_URI`, `VALTER_NEO4J_USERNAME`, `VALTER_NEO4J_PASSWORD`) não estiverem definidas. Para executá-los:

```bash
export VALTER_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
export VALTER_NEO4J_USERNAME=neo4j
export VALTER_NEO4J_PASSWORD=your_password
make test-neo4j-live
```

### Testes de Regressão (3 arquivos, ~130 linhas)

Testes de regressão protegem contra regressões de qualidade em resultados de busca e grafo:

- **Golden questions**: queries de busca reconhecidamente boas com características esperadas nos resultados
- **KG quality CI**: verificações de consistência do knowledge graph (contagens de nós/relacionamentos, padrões esperados)
- **Testes de paridade**: verificam compatibilidade entre respostas da API do Valter e as expectativas do frontend Juca

### Testes MCP (1 arquivo, ~1.700 linhas)

Testes MCP cobrem todas as 28 ferramentas MCP, verificando:

- Registro e metadados das ferramentas
- Validação de parâmetros (campos obrigatórios, tipos, restrições)
- Conformidade do formato de resposta com o protocolo MCP
- Tratamento de erros para inputs inválidos

## Escrevendo Testes

### Estrutura dos testes

Siga o padrão Arrange-Act-Assert:

```python
async def test_divergences_returns_empty_for_unknown_ministro():
    # Arrange
    mock_store = AsyncMock()
    mock_store.find_divergences.return_value = []

    # Act
    result = await get_divergences(
        request=DivergenceRequest(ministro="Unknown", tema="civil"),
        graph_store=mock_store,
    )

    # Assert
    assert result == []
    mock_store.find_divergences.assert_called_once_with("Unknown", "civil")
```

### O que testar

Testes devem verificar **comportamento**, não apenas estrutura de schema:

- Teste a lógica real e o pós-processamento, não apenas que a resposta tem os campos corretos
- Teste edge cases: resultados vazios, filtros que excluem tudo, valores limítrofes
- Teste caminhos de erro: o que acontece com inputs inválidos, dados ausentes, falhas de serviço
- Teste inputs com acentos, case misto e caracteres especiais (relevante para dados jurídicos brasileiros)

### Padrões de mocking

**AsyncMock para métodos assíncronos de stores:**

```python
from unittest.mock import AsyncMock, MagicMock

# Mockar um store inteiro
mock_doc_store = AsyncMock()
mock_doc_store.get_by_id.return_value = sample_document

# Mockar um método específico com side effects
mock_graph_store = AsyncMock()
mock_graph_store.find_divergences.side_effect = ConnectionError("Neo4j unavailable")
```

**Override de injeção de dependência em testes de rota:**

```python
from fastapi.testclient import TestClient
from valter.api.deps import get_graph_store

app.dependency_overrides[get_graph_store] = lambda: mock_graph_store
client = TestClient(app)
response = client.post("/v1/graph/divergences", json={"ministro": "Test"})
```

**Fixture de Settings do conftest.py:**

```python
@pytest.fixture
def settings():
    return Settings(
        _env_file=None,
        ENV="test",
        DATABASE_URL="postgresql+asyncpg://test:test@localhost:5432/valter_test",
        NEO4J_URI="bolt://localhost:7687",
        NEO4J_USERNAME="neo4j",
        NEO4J_PASSWORD="test",
        REDIS_URL="redis://localhost:6379/1",
    )
```

O parâmetro `_env_file=None` impede que o `Settings` de teste carregue valores do `.env`, garantindo isolamento dos testes.

### Nomenclatura de arquivos

- Arquivos de teste: `test_<nome_do_modulo>.py`
- Funções de teste: `test_<descricao_do_comportamento>`
- Coloque testes unitários em `tests/unit/`, testes de integração em `tests/integration/`, testes de regressão em `tests/regression/`

## Cobertura

Cobertura atual de testes por categoria:

| Categoria | Arquivos | Linhas | Escopo |
|---|---|---|---|
| Unitário | 57 | ~10.000 | Lógica central, rotas, stores (mockados), auth, modelos |
| Integração | 3 | ~350 | Queries ao vivo no Neo4j Aura |
| Regressão | 3 | ~130 | Golden set, qualidade KG, paridade Juca |
| MCP | 1 | ~1.700 | 28 ferramentas + handlers + validação |
| Carga | 0 | 0 | Placeholder (Locust disponível nas dependências dev) |
| **Total** | **64** | **~12.200** | |

Gere um relatório de cobertura:

```bash
make test-cov
```

Isso produz um relatório no terminal com `--cov-report=term-missing`, mostrando quais linhas não possuem cobertura de teste.

## Lacunas de Cobertura

Os seguintes módulos possuem cobertura de teste limitada ou inexistente:

| Módulo | Status | Observações |
|---|---|---|
| `stores/document.py` (PostgresDocStore) | Sem teste direto | Testado indiretamente via testes de rota |
| `stores/vector.py` (QdrantVectorStore) | Sem teste direto | Testado indiretamente via testes do retriever |
| `stores/cache.py` (RedisCacheStore) | Sem teste direto | Testado indiretamente via testes de rota |
| `stores/artifact_storage.py` | Sem teste | Armazenamento de artefatos R2/local |
| `api/middleware.py` | Sem teste direto | Middleware de auth, rate limiting, CORS |
| `tests/load/` | Vazio | Placeholder para testes de carga com Locust |

Essas lacunas são conhecidas. Os módulos de store são exercitados indiretamente pelos testes de rota e retriever que os mockam, mas testes unitários dedicados para cada store melhorariam a confiança no tratamento de edge cases.
