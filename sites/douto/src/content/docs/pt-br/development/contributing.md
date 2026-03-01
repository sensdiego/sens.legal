---
title: Guia de Contribuicao
description: Como contribuir com o Douto — de reportar issues a enviar pull requests.
lang: pt-BR
sidebar:
  order: 4
---

# Contribuindo com o Douto

Diretrizes para contribuir com codigo, conteudo de knowledge base ou documentacao ao Douto.

## Antes de Comecar

1. **Leia a introducao** -- entenda o que o Douto faz e sua posicao no ecossistema sens.legal. Veja a [visao geral do projeto](/docs/getting-started/introduction/).
2. **Configure seu ambiente** -- siga o guia de [Configuracao do Ambiente](/docs/development/setup/).
3. **Revise as convencoes** -- leia a pagina de [Convencoes de Codigo](/docs/development/conventions/).
4. **Consulte o roadmap** -- veja as [prioridades atuais](/docs/roadmap/) para encontrar trabalho de alto impacto.

## Tipos de Contribuicao

### 1. Melhorias no Pipeline

Bug fixes, otimizacoes e novas funcionalidades para os 5 scripts do pipeline. E aqui que a maior parte do trabalho de engenharia acontece.

**Areas de alto impacto neste momento:**
- Padronizar o uso de variaveis de ambiente em todos os scripts (F22, P0)
- Extrair funcoes compartilhadas para `pipeline/utils.py` (F23, P1)
- Fixar versoes de dependencias no `requirements.txt` (F24, P1)

### 2. Testes (Maior Impacto)

:::tip[Melhor forma de contribuir agora]
Adicionar cobertura de testes e a contribuicao de maior impacto possivel. O Douto tem **0% de cobertura**. Mesmo um unico teste para `rechunk_v3.py` ja e uma melhoria significativa. Veja a pagina de [Testes](/docs/development/testing/) para a estrategia planejada e funcoes prioritarias.
:::

### 3. Conteudo da Knowledge Base

- Popular MOCs vazios (MOC_CONSUMIDOR, MOC_TRIBUTARIO, MOC_CONSTITUCIONAL, MOC_COMPLIANCE, MOC_SUCESSOES)
- Catalogar novos livros em MOCs existentes
- Criar notas atomicas (quando o sistema `nodes/` estiver implementado)

### 4. Documentacao

- Melhorar esta documentacao
- Adicionar comentarios inline no codigo
- Atualizar secoes do README

### 5. Reportar Bugs

Abra issues com passos claros de reproducao. Inclua:
- Qual script e comando voce executou
- A mensagem de erro ou comportamento inesperado
- Seu ambiente (SO, versao do Python, versoes das dependencias)
- Os valores das variaveis de ambiente relevantes (redija API keys)

## Workflow de Contribuicao

### Passo 1: Encontrar ou Criar uma Issue

Verifique as issues existentes e o roadmap para encontrar trabalho disponivel. Se voce esta corrigindo um bug novo ou propondo uma feature, abra uma issue primeiro para discutir a abordagem.

<!-- NEEDS_INPUT: Clarify whether GitHub Issues or Linear (SEN-XXX) is the primary tracker. Decision D04 is pending. -->

### Passo 2: Criar uma Branch

```bash
git fetch origin
git checkout main
git pull origin main

# Feature branch
git checkout -b feat/SEN-XXX-short-description

# Bug fix branch
git checkout -b fix/SEN-XXX-short-description

# Documentation branch
git checkout -b docs/short-description
```

### Passo 3: Fazer as Alteracoes

Siga as [Convencoes de Codigo](/docs/development/conventions/). Checkpoints principais:

- [ ] Nenhum caminho absoluto hardcoded
- [ ] Type hints em funcoes publicas
- [ ] Suporte a `--dry-run` se o script modifica dados
- [ ] Tratamento de excecoes especificas (sem `except Exception` generico)
- [ ] Logging estruturado para eventos importantes

### Passo 4: Testar as Alteracoes

Como ainda nao ha testes automatizados, verifique manualmente:

```bash
# For pipeline changes: test with a small subset
python3 pipeline/rechunk_v3.py --dry-run --limit 5

# For search changes: run a known query and check results
python3 pipeline/search_doutrina_v2.py "boa-fe objetiva" --area contratos
```

Quando os testes existirem (v0.3+):

```bash
make test
make lint
```

### Passo 5: Fazer Commit

Use o formato [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add pipeline/rechunk_v3.py
git commit -m "feat: add bibliography detection to rechunker -- SEN-XXX"
```

| Prefixo | Quando usar |
|---------|-------------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correcao de bug |
| `docs:` | Alteracoes de documentacao |
| `refactor:` | Reestruturacao de codigo sem mudanca de comportamento |
| `test:` | Adicionar ou atualizar testes |
| `chore:` | Build, dependencias, tooling |

### Passo 6: Push e Abrir PR

```bash
git push -u origin feat/SEN-XXX-short-description
```

Em seguida, abra um pull request no GitHub apontando para `main`.

## Diretrizes de Pull Request

### Checklist do PR

- [ ] **Escopo focado** -- uma feature ou fix por PR. Nao misturar alteracoes nao relacionadas.
- [ ] **Descricao clara** -- explicar *o que* mudou e *por que*. Vincular a issue ou feature do roadmap.
- [ ] **Sem breaking changes** -- a menos que discutido e aprovado na issue.
- [ ] **Testes** -- adicionar testes para nova funcionalidade (quando o framework de testes existir).
- [ ] **Documentacao** -- atualizar docs se o comportamento visivel ao usuario mudar.
- [ ] **Sem segredos** -- verificar duas vezes que arquivos `.env`, API keys ou arquivos de dados grandes nao estao incluidos.
- [ ] **Sem ruido de formatacao** -- nao incluir alteracoes de whitespace ou estilo nao relacionadas.

### Formato do Titulo do PR

```
feat: short description of what this PR does
fix: what was broken and how it's fixed
docs: what documentation was updated
```

### Template do Body do PR

```markdown
## What

Brief description of the change.

## Why

Link to issue, roadmap feature, or explain the motivation.

## How

Key implementation decisions. What alternatives were considered.

## Testing

How you verified the change works (manual steps or test commands).
```

## Contribuicoes para a Knowledge Base

Diretrizes especiais para alteracoes no diretorio `knowledge/`:

### Adicionando um Novo Livro a um MOC

1. Abra o arquivo MOC relevante (ex.: `knowledge/mocs/MOC_CIVIL.md`)
2. Adicione a entrada do livro com todos os metadados obrigatorios:

```markdown
### Titulo do Livro
- **Autor:** Nome do Autor
- **Editora:** Editora
- **Edicao:** Xa edicao, ANO
- **Chunks:** (pending processing)
- **Status:** catalogado
```

3. Verifique que o dominio juridico do livro corresponde ao MOC
4. **Nao** atualize o `INDEX_DOUTO.md` a menos que esteja adicionando um novo dominio

### Adicionando um Novo Dominio/MOC

1. Crie `knowledge/mocs/MOC_{DOMINIO}.md` com o frontmatter obrigatorio
2. Adicione o dominio ao `knowledge/INDEX_DOUTO.md` com um wikilink
3. Atualize a documentacao

### Regras

- Usar **wikilinks** (`[[alvo]]`) para todas as referencias internas
- Seguir o **schema de frontmatter** definido em [Convencoes](/docs/development/conventions/#knowledge-base-conventions)
- Definir `status_enriquecimento` corretamente -- nunca deixar como `"pendente"` apos enriquecimento
- Incluir metadados do livro: titulo, autor, edicao, editora
- Verificar que os links resolvem corretamente (abrir no Obsidian para conferir)

## Rastreamento de Issues

:::note[Decisao pendente -- D04]
A fonte de verdade para rastreamento de issues ainda nao esta clara. Commits referenciam issues do Linear (SEN-XXX), mas o GitHub Issues esta vazio (0 abertas, 0 fechadas). A decisao D04 definira se Linear, GitHub Issues ou uma abordagem hibrida sera utilizada.
:::

**Por enquanto:**
- Abra issues no GitHub com labels descritivos
- Referencie numeros de tickets Linear em commits e PRs quando aplicavel

**Labels sugeridos:**

| Label | Cor | Usar para |
|-------|-----|-----------|
| `tech-debt` | vermelho | Caminhos hardcoded, testes ausentes, codigo duplicado |
| `pipeline` | azul | Alteracoes em scripts do pipeline |
| `knowledge-base` | verde | Atualizacoes de MOCs, novos livros, notas atomicas |
| `integration` | roxo | Integracao com o ecossistema sens.legal |
| `testing` | amarelo | Infraestrutura e cobertura de testes |
| `documentation` | cinza | Melhorias na documentacao |

## Propriedade e Atribuicao

O Douto e propriedade exclusiva de Diego Sens (@sensdiego). Todas as contribuicoes sao feitas sob os termos de licenca do projeto.

Quando commits envolvem assistencia de IA, usar o formato obrigatorio:

```
Co-Authored-By (execucao): Claude Opus 4.6 <noreply@anthropic.com>
```

O termo **(execucao)** indica que a IA auxiliou na implementacao. Concepcao, arquitetura, decisoes de produto e propriedade intelectual permanecem com o autor.
