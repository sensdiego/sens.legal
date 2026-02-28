---
title: Convenções de Código
description: Padrões de código, convenções de nomenclatura, regras de arquitetura e checklist de revisão pré-commit aplicados no Valter.
lang: pt-BR
sidebar:
  order: 2

---

# Convenções de Código

Estas convenções são aplicadas em todo o codebase do Valter. São derivadas das regras de governança do projeto e estabelecidas pela prática. Todos os contribuidores -- humanos e agentes de IA -- devem segui-las.

## Linguagem e Tipagem

O Valter é um projeto Python 3.12+. Todo código deve incluir type hints em funções públicas e usar recursos modernos do Python.

**Regras fundamentais:**

- **Type hints** são obrigatórios em todas as assinaturas de funções públicas (parâmetros e tipos de retorno)
- **Pydantic v2** é o único framework de modelos para objetos de domínio. Não use `dataclasses` ou dicts puros para dados que cruzam fronteiras de API.
- **`async/await`** é obrigatório para todas as operações de I/O (queries de banco, chamadas HTTP, leitura de arquivos). Nenhum I/O síncrono no hot path.

```python
# Correto: tipado, async, modelo Pydantic
async def get_decisao(decisao_id: str) -> DecisaoDetail:
    ...

# Errado: sem tipos, I/O síncrono
def get_decisao(id):
    result = db.query(...)  # chamada bloqueante
```

## Regras de Arquitetura

A regra de dependência é rigorosamente aplicada: `api/` depende de `core/`, que depende de `models/`. Nenhuma importação reversa.

```
api/ ---> core/ ---> models/
            ^
            |
stores/ implementa protocols de core/protocols.py
```

**Restrições principais:**

- **`core/` nunca importa `stores/` diretamente.** Implementações de stores são injetadas via `Depends()` do FastAPI. Isso mantém a lógica de negócio desacoplada da infraestrutura.
- **`stores/` implementa protocols** definidos em `core/protocols.py`. Cada store (PostgreSQL, Neo4j, Qdrant, Redis) se conforma a uma interface abstrata.
- **Antes de criar um endpoint, leia o método inteiro do store** -- não apenas sua assinatura. Identifique limites hardcoded, comportamento de case-sensitivity, formatos de dados e erros possíveis. Documente quaisquer limitações no schema OpenAPI do endpoint.

```python
# Em api/routes/graph.py -- store injetado via Depends()
@router.post("/divergences")
async def get_divergences(
    request: DivergenceRequest,
    graph_store: Neo4jGraphStore = Depends(get_graph_store),
):
    return await graph_store.find_divergences(request.ministro, request.tema)
```

## Logging

O Valter usa `structlog` para logging estruturado em JSON. Cada requisição HTTP recebe um `trace_id` para correlação.

**Diretrizes:**

- Use campos estruturados chave-valor, não interpolação de strings
- Logue no nível apropriado: `debug` para detalhes de desenvolvimento, `info` para operações normais, `warning` para problemas recuperáveis, `error` para falhas
- O nível de log é configurado via `VALTER_LOG_LEVEL` (padrão: `INFO`)

```python
import structlog

logger = structlog.get_logger()

# Correto: campos estruturados
logger.info("document_indexed", doc_id=doc.id, chunks=len(chunks))

# Errado: interpolação de string
logger.info(f"Indexed document {doc.id} with {len(chunks)} chunks")
```

## Tratamento de Erros

O tratamento de erros deve ser preciso. O objetivo é capturar falhas esperadas e deixar bugs de programação surgirem como erros 500 para que sejam visíveis e corrigíveis.

**Regras:**

- **Nenhum catch-all `except Exception`.** Capture apenas erros específicos e esperados (timeouts de conexão, falhas de rede, erros de validação conhecidos).
- **Bugs de programação devem aparecer como 500s.** `KeyError`, `TypeError`, `AttributeError` e similares nunca devem ser capturados silenciosamente. Eles indicam um defeito no código que precisa ser corrigido.
- **Verifique se blocos catch não engolem erros internos.** Um `except` amplo em uma chamada externa pode acidentalmente ocultar bugs no código que prepara ou processa a chamada.

```python
# Correto: captura apenas erros esperados
try:
    result = await neo4j_driver.execute_query(cypher, params)
except neo4j.exceptions.ServiceUnavailable:
    logger.warning("neo4j_unavailable", uri=settings.NEO4J_URI)
    raise HTTPException(status_code=503, detail="Graph database unavailable")

# Errado: catch-all esconde bugs
try:
    result = await neo4j_driver.execute_query(cypher, params)
except Exception:
    return {"results": []}  # Retorna vazio silenciosamente em QUALQUER erro
```

## Convenções de Nomenclatura

| Contexto | Convenção | Exemplo |
|---|---|---|
| Endpoints REST | kebab-case | `/v1/graph/optimal-argument` |
| Funções/variáveis Python | snake_case | `find_divergences` |
| Classes Python | PascalCase | `Neo4jGraphStore` |
| Arquivos | snake_case | `graph_store.py` |
| Variáveis de ambiente | UPPER_SNAKE_CASE com prefixo `VALTER_` | `VALTER_NEO4J_URI` |

:::note
O endpoint `/similar_cases` usa underscores em vez de kebab-case. Isso é uma nomenclatura legada cuja renomeação seria uma breaking change. Novos endpoints devem usar kebab-case.
:::

## Git e Fluxo de PR

### Mensagens de commit

Todos os commits devem seguir a especificação [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add divergence detection endpoint
fix: handle empty result set in phase analysis
chore: update Neo4j driver to 5.28
docs: add MCP configuration guide
refactor: extract query builder from retriever
test: add edge case tests for graph routes
```

### Nomenclatura de branches

```
feat/[issue-id]-[description]
fix/[issue-id]-[description]
chore/[issue-id]-[description]
docs/[issue-id]-[description]
refactor/[issue-id]-[description]
test/[issue-id]-[description]
codex/[issue-id]-[description]
```

Exemplo: `feat/SEN-267-mcp-auth-claude`

Branches do Claude Code usam o sufixo `-claude`. Branches do Codex usam o prefixo `codex/`. Consulte o [Guia de Contribuição](./contributing.md#coordenacao-multi-agente) para regras de multi-agente.

## Checklist de Revisão Pré-Commit

Antes de commitar, verifique cada mudança contra estas cinco verificações. O objetivo é commitar código que **funciona**, não código que apenas compila.

### 1. Honestidade dos parâmetros

Todo parâmetro exposto na API deve fazer exatamente o que sua `description` diz. Se houver limites hardcoded internos (cláusulas `LIMIT`, filtros `WHERE >= N`), devem ser documentados no schema OpenAPI. Se um parâmetro não pode cumprir o que promete, corrija a implementação ou documente a limitação.

### 2. Precisão no tratamento de erros

Verifique que:
- Nenhum catch-all `except Exception` existe
- Apenas erros esperados são capturados (falhas de conexão, timeouts)
- Bugs de programação (`KeyError`, `TypeError`) podem surgir como 500s
- Blocos catch não engolem acidentalmente erros internos do sistema

### 3. Edge cases de dados

Teste o comportamento para:
- Input que não existe no backend (ministro inexistente, categoria inválida)
- Conjuntos de resultados vazios -- o cliente consegue distinguir "não encontrado" de "não existe"?
- Inputs com acentos, case misto e caracteres especiais
- Combinações incompatíveis de filtros

### 4. Testes testam comportamento

Testes devem verificar comportamento real, não apenas estrutura de schema:
- Teste lógica de pós-processamento, não apenas que a resposta tem os campos corretos
- Teste edge cases: resultados vazios, filtros que excluem tudo, valores limítrofes
- Use stores mockados (não dependa de serviços ao vivo para testes unitários)

### 5. Leia o store primeiro

Antes de escrever um endpoint, leia o método inteiro do store que ele chama:
- Identifique limites hardcoded e seus efeitos nos resultados
- Entenda o comportamento de case-sensitivity nas queries
- Observe formatos de dados e quaisquer transformações aplicadas
- Documente qualquer limitação que o cliente precise saber

## Ordem de Prioridade

Quando convenções ou princípios conflitam, resolva nesta ordem:

1. **Corretude** -- especialmente para dados jurídicos, billing e integridade de dados
2. **Simplicidade e clareza** -- código que outro agente ou desenvolvedor entende sem contexto adicional
3. **Manutenibilidade** -- fácil de modificar sem quebrar funcionalidades não relacionadas
4. **Reversibilidade** -- preferir decisões que possam ser desfeitas
5. **Performance** -- otimize apenas quando houver evidência de problema

## Non-Goals

As seguintes ações são proibidas sem autorização explícita:

- Introduzir abstrações sem necessidade clara e imediata
- Adicionar dependências para problemas já resolvidos no codebase
- Refatorar código funcionando sem uma issue específica motivando a mudança
- Otimizar código sem evidência de problema de performance
- Expandir escopo além da issue sendo trabalhada
