---
title: Guia de Contribuição
description: Como contribuir com o Valter — fluxo de git, processo de PR, pipeline de CI/CD e coordenação multi-agente.
lang: pt-BR
sidebar:
  order: 4

---

# Guia de Contribuição

Este guia cobre o fluxo de contribuição para o Valter, incluindo nomenclatura de branches, convenções de commit, processo de PR, validação de CI e o modelo de coordenação multi-agente usado neste projeto.

## Fluxo de Git

### Nomenclatura de branches

Todas as branches seguem um padrão de nomenclatura consistente:

```
<type>/[issue-id]-[description]
```

Tipos suportados:

| Prefixo | Uso |
|---|---|
| `feat/` | Novas funcionalidades |
| `fix/` | Correções de bugs |
| `chore/` | Tarefas de manutenção (atualização de dependências, limpeza) |
| `docs/` | Alterações na documentação |
| `refactor/` | Reestruturação de código sem mudança de comportamento |
| `test/` | Adições ou modificações de testes |
| `codex/` | Alterações feitas pelo agente Codex |

Exemplos:

```
feat/SEN-267-mcp-auth-claude
fix/SEN-301-empty-divergence-response
chore/update-neo4j-driver
docs/configuration-reference
```

### Mensagens de commit

Todos os commits devem seguir a especificação [Conventional Commits](https://www.conventionalcommits.org/). O formato é:

```
<type>: <description>
```

Tipos válidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

Exemplos:

```
feat: add divergence detection endpoint
fix: handle empty result set in phase analysis
chore: update Neo4j driver to 5.28
docs: add MCP configuration guide
refactor: extract query builder from retriever
test: add edge case tests for graph routes
```

### Iniciando trabalho em uma nova tarefa

Antes de iniciar qualquer trabalho, verifique se nenhum outro agente está trabalhando em branches conflitantes:

```bash
git branch -a
git branch -a | grep codex   # Verificar branches Codex ativas
```

Crie sua branch a partir da `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/SEN-XXX-description-claude
```

## Processo de Pull Request

### 1. Implementar e validar localmente

Faça suas alterações e execute a suíte completa de validação:

```bash
make quality   # Executa lint + mypy (com escopo) + testes
```

Se suas alterações envolvem código relacionado a grafos:

```bash
make validate-aura   # Obrigatório para alterações em Neo4j/grafo
```

### 2. Abrir um pull request

Envie sua branch e abra um PR contra `main`. O PR deve usar o template de `.github/pull_request_template.md`, que inclui:

- **Resumo**: descrição do problema, alteração e impacto esperado
- **Tipo de alteração**: checkboxes para API/Core/Stores, Graph, Migrations, Scripts, Docs
- **Matriz de validação**: verificações aplicáveis concluídas
- **Governança**: conformidade com nomenclatura de branch e convenção de commits

### 3. Matriz de validação

O template do PR inclui uma matriz de validação. Marque apenas os itens aplicáveis à sua alteração:

| Tipo de Alteração | Validação Obrigatória |
|---|---|
| API/Core/Stores | `make lint` + `make test` + testes de regressão relevantes |
| Graph (Neo4j/Aura) | Todos acima + `make validate-aura` + testes unitários específicos de grafo |
| Migrações (Alembic) | `alembic upgrade head` em ambiente seguro. Testar `downgrade()` se a migração for reversível. Se irreversível, declarar no PR e incluir plano de contingência. |
| Scripts (`scripts/`) | Execução local ou staging permitida. Execução em produção requer aprovação explícita, `--dry-run` prévio e plano de rollback documentado. |

### 4. Impacto em consumidores externos

Se sua alteração afeta o contrato da API (formato de request/response, status codes, semântica de endpoints):

- Avalie o impacto em consumidores externos (frontend Juca, clientes MCP)
- Evite breaking changes em endpoints `/v1`, ou forneça um plano de versionamento/deprecação
- Atualize a documentação de integração quando contratos mudarem
- Adicione ou atualize testes de contrato para endpoints críticos

## Pipeline de CI/CD

O pipeline de CI roda em todo pull request:

| Estágio | O que verifica |
|---|---|
| Lint | `ruff check` e `ruff format --check` em `src/` e `tests/` |
| Verificação de tipos | `mypy` em arquivos com escopo (deps, rotas de ingestão, ferramentas MCP) |
| Teste | `pytest` com saída verbose e tracebacks curtos |
| Validação Aura | Para PRs que alteram código de grafo: `make validate-aura` com threshold de latência de 15 segundos |

O deploy no Railway acontece automaticamente quando alterações são mergeadas na `main`. Cada serviço Railway (API, Worker, MCP Remote) é reconstruído a partir do mesmo codebase, diferenciado pela variável de ambiente `VALTER_RUNTIME`.

## Coordenação Multi-Agente

O Valter é desenvolvido por dois agentes de codificação IA trabalhando em paralelo:

| Agente | Ambiente | Convenção de branch |
|---|---|---|
| Claude Code | Execução local | Sufixo: `-claude` (ex.: `feat/SEN-267-mcp-auth-claude`) |
| Codex (OpenAI) | Execução em cloud | Prefixo: `codex/` (ex.: `codex/sen-217-missing-integras`) |

### Regra fundamental

**Nunca trabalhe na mesma branch que o outro agente.** Antes de iniciar qualquer tarefa:

```bash
# Verificar branches Codex ativas
git branch -a | grep codex

# Se uma branch codex/ existir tocando os mesmos arquivos, coordenar antes de prosseguir
```

### Evitando conflitos

- Cada agente trabalha em issues separadas e em arquivos separados quando possível
- Se ambos os agentes precisam modificar o mesmo arquivo, coordenar via PRs separados mergeados sequencialmente
- Sempre faça pull da `main` mais recente antes de criar uma nova branch

## Autoria

O Valter é propriedade exclusiva de Diego Sens (@sensdiego). Toda concepção, arquitetura, decisões de produto e propriedade intelectual pertencem ao autor.

Quando agentes de IA contribuem para a implementação, commits usam este formato:

```
Co-Authored-By (execucao): Claude Opus 4.6 <noreply@anthropic.com>
```

O termo **(execucao)** indica que o agente de IA auxilia na implementação do código. Não implica autoria do design ou da arquitetura.

## Ordem de Prioridade

Ao tomar decisões de implementação, resolva conflitos nesta ordem:

1. **Corretude** -- especialmente para dados jurídicos, billing e integridade de dados
2. **Simplicidade e clareza** -- código que outro agente ou desenvolvedor entende sem contexto adicional
3. **Manutenibilidade** -- fácil de modificar sem quebrar funcionalidades não relacionadas
4. **Reversibilidade** -- preferir decisões que possam ser desfeitas
5. **Performance** -- otimize apenas com evidência de problema
