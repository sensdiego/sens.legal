---
title: "Configuração do Ambiente de Desenvolvimento"
description: "Como configurar um ambiente de desenvolvimento local e o fluxo de trabalho diário para contribuir com o Juca."
lang: pt-BR
sidebar:
  order: 1
---

# Configuração do Ambiente de Desenvolvimento

Esta página cobre o fluxo de trabalho de desenvolvimento diário após a instalação inicial. Para a configuração pela primeira vez, consulte [Instalação](/getting-started/installation).

## Fluxo de Trabalho de Desenvolvimento

O ciclo de desenvolvimento padrão:

1. **Atualize** a partir de `main`
2. **Crie uma feature branch:** `git checkout -b feature/[issue]-description-claude`
3. **Inicie o servidor de dev:** `npm run dev` (Turbopack)
4. **Faça alterações** seguindo as [convenções de código](/development/conventions)
5. **Rode os testes localmente:** `npm test` (ou deixe o hook pre-push cuidar disso)
6. **Faça push** — o hook pre-push roda os testes; o CI roda lint + build + testes
7. **Crie um PR** apontando para `main`

## Scripts Disponíveis

| Script | Comando | Finalidade |
|--------|---------|-----------|
| `npm run dev` | `next dev` | Inicia o servidor de dev com Turbopack em localhost:3000 |
| `npm test` | `vitest run` | Executa todos os testes unitários do Vitest |
| `npm run test:watch` | `vitest` | Modo watch — reexecuta ao alterar arquivos |
| `npm run test:coverage` | `vitest run --coverage` | Gera relatório de cobertura com V8 |
| `npm run test:e2e` | `playwright test` | Executa os testes E2E com Playwright |
| `npm run test:e2e:ui` | `playwright test --ui` | Modo UI do Playwright (depuração visual) |
| `npm run test:e2e:headed` | `playwright test --headed` | E2E com browser visível |
| `npm run lint` | `eslint` | Verificação do ESLint |
| `npm run analyze` | `ANALYZE=true next build` | Análise do tamanho do bundle |
| `npm run prepare` | `git config core.hooksPath .githooks` | Configura os git hooks |

## Desenvolvimento Multi-Agente

Este projeto usa dois agentes de código de IA trabalhando em paralelo:

| Agente | Ambiente | Sufixo de Branch |
|--------|---------|-----------------|
| **Claude Code** | Execução local | `-claude` |
| **Codex** (OpenAI) | Execução na nuvem | `-codex` |

:::danger
**Nunca trabalhe em uma branch do Codex.** Antes de começar, sempre verifique:
```bash
git branch -a | grep codex
```
Se existir uma branch `-codex` para a sua feature, não mexa nos mesmos arquivos.
:::

## Regras Importantes

Estas regras vêm do `CLAUDE.md` e se aplicam a todos os contribuidores (humanos e IAs):

1. **Nunca rode `next build`, `webpack`, `docker build` ou qualquer build que consuma mais de 50% de CPU localmente.** Faça push para sua branch e deixe o CI cuidar disso.
2. **Prefira editar o código existente** em vez de criar novas abstrações.
3. **Quando tiver dúvidas:** pergunte, proponha a abordagem mínima, opte pela solução reversível mais simples.
4. **Ordem de prioridade:** Correção > Simplicidade > Manutenibilidade > Reversibilidade > Desempenho.
5. **Nunca pule os git hooks** (`--no-verify`) a menos que seja explicitamente instruído.
