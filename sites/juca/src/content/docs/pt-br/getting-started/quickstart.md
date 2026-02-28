---
title: "Quickstart"
description: "Coloque o Juca rodando localmente em menos de 5 minutos com configuração mínima."
lang: pt-BR
sidebar:
  order: 2
---

# Quickstart

Este guia coloca o Juca rodando na sua máquina com a configuração mínima necessária. Para uma configuração completa incluindo todos os serviços opcionais, veja [Instalação](/getting-started/installation).

## Pré-requisitos

- **Node.js 20+** — verifique com `node -v`
- **npm** — incluído no Node.js
- Pelo menos uma chave de API de LLM (Anthropic recomendado)

## 1. Clonar e Instalar

```bash
git clone https://github.com/sensdiego/juca.git
cd juca
npm install
```

:::caution
Se você ver erros sobre `better-sqlite3` durante a instalação, talvez precise de ferramentas de build C++. No macOS: `xcode-select --install`. No Linux: `apt-get install build-essential`.
:::

## 2. Configurar o Ambiente

Crie um arquivo `.env.local` com as variáveis mínimas necessárias:

```bash
# Obrigatório — pelo menos um provedor de LLM
ANTHROPIC_API_KEY=sk-ant-your-key-here
GROQ_API_KEY=gsk_your-key-here

# Ignorar autenticação no desenvolvimento local
ENABLE_DEV_AUTH=true
```

:::tip
Para funcionalidade completa com a integração do Valter, adicione também:
```bash
VALTER_API_URL=https://valter-api-production.up.railway.app
VALTER_API_KEY=your-valter-api-key
```
:::

## 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento com Turbopack inicia em [http://localhost:3000](http://localhost:3000).

:::danger
**Nunca rode `next build` localmente.** Esta é uma regra do projeto — builds consomem CPU excessiva. Suba seu código e deixe o CI (GitHub Actions) ou o Railway fazer os builds. Veja [CLAUDE.md](/development/contributing) para detalhes.
:::

## 4. Primeira Interação

1. Abra [http://localhost:3000](http://localhost:3000) no seu navegador
2. Você verá o WorkCanvas com o Composer na parte inferior
3. Digite uma consulta jurídica, por exemplo: *"Qual a jurisprudência do STJ sobre responsabilidade civil por dano moral?"*
4. Observe os blocks aparecendo em tempo real via streaming SSE — o sistema detecta sua intenção, encaminha para a ferramenta adequada e renderiza os resultados estruturados

## Scripts Disponíveis

| Script | Comando | Finalidade |
|--------|---------|------------|
| Servidor de dev | `npm run dev` | Inicia o servidor de desenvolvimento com Turbopack |
| Testes unitários | `npm test` | Roda os testes unitários com Vitest |
| Testes E2E | `npm run test:e2e` | Roda os testes E2E com Playwright |
| Lint | `npm run lint` | Verificação com ESLint |
| Cobertura | `npm run test:coverage` | Gera relatório de cobertura V8 |

## Próximos Passos

- **[Instalação Completa](/getting-started/installation)** — Configure todos os serviços opcionais (Neo4j, serviço de embeddings, provedores de autenticação)
- **[Variáveis de Ambiente](/configuration/environment)** — Referência completa para todas as 30+ variáveis de ambiente
- **[Visão Geral da Arquitetura](/architecture/overview)** — Entenda como o modelo de hub do Juca funciona
