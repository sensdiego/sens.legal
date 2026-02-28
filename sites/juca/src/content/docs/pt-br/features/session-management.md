---
title: "Gerenciamento de Sessão"
description: "Como o Juca gerencia sessões de usuário, persiste blocos no SQLite e lida com a sidebar de sessões."
lang: pt-BR
sidebar:
  order: 9
---

# Gerenciamento de Sessão

Toda conversa no Juca é uma **sessão** — um contêiner persistente de blocos ordenados. As sessões são armazenadas no SQLite, listadas na SessionSidebar e carregadas no WorkCanvas.

## Estrutura da Sessão

Uma sessão é composta por:

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `id` | TEXT (PK) | Identificador único da sessão |
| `user_id` | TEXT | Dono da sessão |
| `title` | TEXT | Título de exibição (gerado automaticamente ou definido pelo usuário) |
| `status` | TEXT | Estado da sessão |
| `created_at` | TEXT | Timestamp de criação |
| `updated_at` | TEXT | Timestamp da última modificação |
| `message_count` | INTEGER | Número de mensagens/blocos |
| `metadata` | TEXT (JSON) | Estado de fase, preferências, etc. |

As sessões contêm **mensagens** (blocos) em uma tabela filha:

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `id` | TEXT (PK) | Identificador do bloco |
| `session_id` | TEXT (FK) | Sessão pai (deleção em CASCADE) |
| `role` | TEXT | Papel do bloco (user, assistant, system) |
| `content` | TEXT | Conteúdo do bloco (JSON) |
| `timestamp` | TEXT | Hora de criação |
| `metadata` | TEXT (JSON) | Tipo do bloco, fase, etc. |

## Camada de Persistência

As operações de sessão são centralizadas em `src/lib/db/sessions.ts` (classe `SessionsDB`):

```typescript
// Configuração do banco de dados
const db = new Database(process.env.SQLITE_PATH || './data/juca.db');
db.pragma('journal_mode = WAL');      // Write-Ahead Logging para concorrência
db.pragma('foreign_keys = ON');        // Impõe integridade referencial
```

Todo acesso a sessões de outras partes do código passa por este módulo — acesso direto ao SQLite a partir de componentes ou rotas de API não é permitido.

## SessionSidebar

O componente `SessionSidebar` (`src/components/shell/SessionSidebar.tsx`) exibe o histórico de sessões do usuário:

- Lista sessões ordenadas por `updated_at DESC`
- Exibe título, data e status de fase para cada sessão
- Clicar carrega os blocos da sessão no WorkCanvas
- Suporta a criação de novas sessões

## Server Actions

As mutações de sessão acontecem por meio de Server Actions em `src/actions/`:

| Arquivo de Action | Funções Principais | Propósito |
|-------------------|--------------------|-----------|
| `session.ts` | Criar, carregar, deletar sessões | Operações CRUD |
| `briefing.ts` | Transições de fase, avaliações | Estado específico do Briefing |
| `message.ts` | Adicionar mensagens/blocos | Criação de conteúdo |

Todas as actions usam `requireActionAuth()` de `src/actions/utils.ts`:

```typescript
// Toda server action começa com autenticação
const user = await requireActionAuth();
// Em modo dev (ENABLE_DEV_AUTH=true), retorna:
// { id: 'dev-user', email: 'dev@localhost', name: 'Dev User', role: 'admin' }
```

## Limitações Conhecidas

:::caution
**Vulnerabilidade BOLA ([#227](https://github.com/sensdiego/juca/issues/227)):** Os endpoints da API de sessão aceitam qualquer `sessionId` sem verificar se o usuário solicitante é dono da sessão. Essa é uma vulnerabilidade OWASP #1. Atualmente aceitável porque apenas o dev usa o sistema. A correção está planejada para v0.6+ quando o suporte a múltiplos usuários for adicionado.
:::

:::caution
**Escalabilidade do SQLite ([#231](https://github.com/sensdiego/juca/issues/231)):** O `better-sqlite3` usa operações síncronas que bloqueiam o event loop do Node.js. Com aproximadamente 50 usuários simultâneos, o servidor fica sem resposta. A migração para PostgreSQL está planejada para v0.6+.
:::
