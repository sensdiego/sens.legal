---
title: FAQ
description: Perguntas frequentes sobre o Juca, sua arquitetura e desenvolvimento.
lang: pt-BR
sidebar:
  order: 2
---

# Perguntas Frequentes

> Perguntas comuns sobre o Juca, sua arquitetura, fluxo de trabalho de desenvolvimento e o ecossistema sens.legal.

## Geral

### O que é o Juca?

O Juca é um **hub frontend** para o ecossistema de IA jurídica sens.legal. Ele oferece uma interface conversacional (no estilo Fintool/Perplexity) que orquestra agentes de backend especializados para ajudar profissionais do direito a pesquisar jurisprudência, analisar casos e produzir documentos jurídicos estruturados. Veja [Introdução](/getting-started/introduction) para a visão completa.

### Como o Juca se relaciona com o Valter e o Leci?

O Juca é o **hub frontend** — ele cuida da UI, do gerenciamento de sessões e da orquestração. O **Valter** é o agente de backend para jurisprudência do STJ (busca, verificação, grafo de conhecimento, análise de LLM). O **Leci** é um agente de backend planejado para legislação federal. O Juca chama as APIs deles e renderiza os resultados. Veja [Ecossistema](/architecture/ecosystem) para mais detalhes.

### O Juca é open source?

O Juca é atualmente um projeto privado em desenvolvimento ativo. O licenciamento e o status de open source ainda não foram definidos.

## Arquitetura

### Por que o Juca é um "hub" em vez de uma aplicação completa?

O Juca originalmente era um monólito fullstack com busca embutida, pipeline de LLM e grafo de conhecimento. Isso duplicava lógica já existente no Valter. A mudança para o modelo hub elimina essa duplicação — o Juca se foca no que faz melhor (UI/UX, orquestração, revelação progressiva) enquanto o Valter cuida da inteligência de backend. Veja [ADR-006](/architecture/decisions#adr-006-hub-pivot).

### Por que não usar o Valter diretamente?

O Valter é um serviço de API de backend — ele não tem interface de usuário. O Juca adiciona:
- **Revelação progressiva** — o Briefing Progressivo de 4 fases
- **Gerenciamento de sessão** — sessões persistentes com histórico de blocos
- **Orquestração multi-agente** — roteia queries para o agente de backend correto
- **UI rica** — blocos interativos, visualizações, exportação PDF
- **Autenticação** — contas de usuário, controle de acesso

### O que acontece com o código de backend local?

O backend local (`src/lib/backend/`) está sendo descontinuado no v0.3-v0.4. Busca, pipeline de LLM e consultas ao GC serão migrados para chamadas à API Valter. As ~55 rotas de API internas serão gradualmente removidas conforme cada capacidade migrar. Veja [Roadmap](/roadmap/milestones#v04--briefing-progressivo).

### Por que SQLite em vez de PostgreSQL?

O SQLite foi escolhido pela simplicidade durante o desenvolvimento com um único desenvolvedor. Não requer um servidor de banco de dados externo, funciona bem para o volume atual de usuários e usa o modo WAL para leituras concorrentes. A migração para PostgreSQL está planejada para o v0.6+ (Issue #231) para alinhar com o ecossistema (Valter e Leci ambos usam Postgres). Veja [ADR-002](/architecture/decisions#adr-002-sqlite-for-sessions).

## Desenvolvimento

### Por que não posso rodar `next build` localmente?

As regras do projeto (do `CLAUDE.md`) proíbem rodar builds, bundlers ou qualquer processo que consuma mais de 50% de CPU localmente. Isso preserva os recursos da máquina de desenvolvimento e delega a validação do build ao CI (GitHub Actions) e ao deployment (Railway). Faça push da sua branch e deixe o CI verificar o build.

### Como adiciono um novo tipo de bloco?

Veja o guia passo a passo em [Sistema de Blocos — Adicionando um Novo Tipo de Bloco](/features/block-system#adding-a-new-block-type). Em resumo: defina o tipo em `BlockType`, crie uma função factory, construa um componente renderer e registre-o no `BlockRenderer`.

### Como rodo os testes?

```bash
npm test              # Testes unitários (execução única)
npm run test:watch    # Modo watch
npm run test:coverage # Relatório de cobertura
npm run test:e2e      # Testes E2E (Playwright)
```

Veja o [Guia de Testes](/development/testing) para detalhes completos.

### Qual é a convenção de nomenclatura para branches?

`feature/[issue]-[description]-claude` para branches do Claude Code, `feature/[issue]-[description]-codex` para branches do Codex. Sempre inclua o número da issue do GitHub. Veja o [Guia de Contribuição](/development/contributing).

## Solução de Problemas

### Os testes estão falhando — o que fazer?

72 arquivos de teste são conhecidos por falhar atualmente (Issue #270). Muitos testam código de backend que está sendo migrado para o Valter. Consulte [Solução de Problemas](/reference/troubleshooting) para soluções específicas, e note que a reavaliação de quais testes ainda são relevantes está planejada para o v0.3.

### Estou recebendo erros de autenticação em desenvolvimento

Defina `ENABLE_DEV_AUTH=true` no seu arquivo `.env.local` para ignorar a autenticação com um usuário de dev. Veja [Variáveis de Ambiente](/configuration/environment) para todas as variáveis relacionadas à autenticação.

### A aplicação está lenta ou travando

Causas comuns:
1. **API Valter inacessível** — verifique com `curl -H "X-API-Key: $VALTER_API_KEY" $VALTER_API_URL/health`
2. **Chaves de API de LLM ausentes** — no mínimo, configure `ANTHROPIC_API_KEY` e `GROQ_API_KEY`
3. **Lock do SQLite** — garanta que apenas um servidor de dev esteja rodando; verifique processos Node órfãos

Veja [Solução de Problemas](/reference/troubleshooting) para soluções detalhadas.
