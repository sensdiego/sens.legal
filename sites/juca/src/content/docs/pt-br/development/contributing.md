---
title: "Guia de Contribuição"
description: "Como contribuir com o Juca — estratégia de branches, processo de PR e diretrizes para contribuidores humanos e IAs."
lang: pt-BR
sidebar:
  order: 4
---

# Guia de Contribuição

O Juca aceita contribuições tanto de desenvolvedores humanos quanto de agentes de código de IA. Esta página cobre a estratégia de branches, o processo de PR e as regras que se aplicam a todos os contribuidores.

## Antes de Começar

1. Siga o [guia de Instalação](/getting-started/installation) para a configuração completa
2. Leia as [Convenções de Código](/development/conventions) para os padrões
3. Leia o [Guia de Testes](/development/testing) para os requisitos de teste
4. Leia o `CLAUDE.md` na raiz do projeto para as instruções do agente de IA

## Estratégia de Branches

| Branch | Finalidade | Proteção |
|--------|-----------|---------|
| `main` | Branch estável, todos os PRs apontam para cá | CI deve passar |
| `feature/[issue]-[description]-claude` | Branches de feature do Claude Code | — |
| `feature/[issue]-[description]-codex` | Branches de feature do Codex | — |

**Regras:**
- Sempre crie branches a partir de `main`
- Inclua o número da issue do GitHub no nome da branch
- Adicione o sufixo `-claude` ou `-codex` para identificar o agente
- Nunca trabalhe em uma branch de propriedade do outro agente

```bash
# Exemplo: criando uma branch para a issue #285
git checkout main
git pull
git checkout -b feature/285-briefing-phase1-claude
```

## Fazendo Alterações

1. Crie sua feature branch a partir de `main`
2. Faça alterações seguindo as [convenções](/development/conventions)
3. Escreva testes para novas funcionalidades
4. O hook `pre-push` roda os testes automaticamente no push
5. O CI roda lint + build + testes unitários no remoto

## Diretrizes para Pull Requests

Ao criar um PR:

- **Título:** Curto e descritivo (< 70 caracteres)
- **Corpo:** Resumo das alterações, link para a(s) issue(s) relacionada(s)
- **Testes:** Todos os testes devem passar no CI
- **Sem novos erros de lint**
- **Siga os padrões existentes** — não introduza novas abstrações sem justificativa

## Regras para Contribuidores de IA

Estas regras do `CLAUDE.md` são obrigatórias:

| Regra | Justificativa |
|-------|--------------|
| Nunca rode builds/bundlers localmente | Economiza CPU, usa o CI em vez disso |
| Prefira editar o código existente | Evita inchaço de abstrações |
| Não adicione funcionalidades além do solicitado | Mantém as alterações focadas |
| Não adicione comentários, docstrings ou tipos a código não modificado | Reduz ruído no diff |
| Opte pela solução reversível mais simples | Maximiza a flexibilidade |
| Nunca pule os git hooks | Garante a qualidade do código |

**Ordem de prioridade quando os princípios conflitam:**

1. Correção (especialmente segurança, integridade de dados)
2. Simplicidade e clareza
3. Manutenibilidade ao longo do tempo
4. Reversibilidade das decisões
5. Desempenho e otimização

## O Que NÃO Fazer

- Não crie abstrações para operações pontuais
- Não adicione tratamento de erros para cenários que não podem acontecer
- Não projete para requisitos futuros hipotéticos
- Não adicione shims de retrocompatibilidade — simplesmente mude o código
- Não crie arquivos de documentação a menos que seja explicitamente solicitado
