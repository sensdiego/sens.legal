---
title: "Architecture Decision Records"
description: "Decisões arquiteturais chave do Juca com contexto, justificativas e consequências."
lang: pt-BR
sidebar:
  order: 3
---

# Architecture Decision Records

Toda escolha arquitetural significativa do Juca está documentada aqui com contexto, alternativas consideradas e consequências. Os ADRs são numerados cronologicamente e nunca são excluídos — decisões superadas são marcadas como tal.

## ADR-001: Home Unificada em vez de Navegação por Abas

| | |
|---|---|
| **Status** | Aceito — implementado no rewrite (Waves 0-5) |
| **Data** | 2026-02 |
| **Issue** | [#162](https://github.com/sensdiego/juca/issues/162) |

**Contexto:** O Juca original tinha 6 abas separadas (Chat, Juris, Ratio, Compare, Insights, Semantic), cada uma com seu próprio gerenciamento de estado, conexão SSE e lógica de renderização. Adicionar uma funcionalidade em uma aba não tinha efeito nas outras. O custo de manutenção era O(n) por funcionalidade por aba.

**Decisão:** Unificar em uma única view Home com um Block System. Estender o orquestrador da Home (tool registry, artifacts) em vez de manter codebases paralelas por aba.

**Consequências:**
- 11 tipos de block substituíram 6 painéis separados
- Um único WorkCanvas renderiza todos os tipos de conteúdo
- Gerenciamento de estado simplificado: de 11 stores Zustand para React `useState` + Server Actions
- O padrão Tool Registry permite adicionar novas capacidades sem alterar a UI

---

## ADR-002: SQLite para Persistência de Sessão

| | |
|---|---|
| **Status** | Aceito — será revisitado na v0.6+ |
| **Data** | 2026-01 |
| **Issue** | [#169](https://github.com/sensdiego/juca/issues/169) |

**Contexto:** O Juca precisava de persistência para sessões e blocks. Opções: arquivos JSON, SQLite, PostgreSQL.

**Decisão:** SQLite via `better-sqlite3` com modo WAL e cascata de chaves estrangeiras.

**Justificativa:** Arquivos JSON com 100K documentos consumiriam ~2,6GB de RAM. O SQLite é zero-config, baseado em arquivo, suporta FTS5 para busca full-text e `sqlite-vec` para operações vetoriais. PostgreSQL era excessivo para um projeto com desenvolvedor solo.

**Consequências:**
- Zero infraestrutura adicional para persistência
- API síncrona bloqueia o event loop do Node.js sob carga (~50 usuários simultâneos)
- Migração para PostgreSQL planejada para v0.6+ ([#231](https://github.com/sensdiego/juca/issues/231))

**Schema:**

```sql
-- Tabela de sessões
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  status TEXT,
  created_at TEXT,
  updated_at TEXT,
  message_count INTEGER,
  metadata TEXT
);

-- Tabela de mensagens/blocks
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT,
  content TEXT,
  timestamp TEXT,
  metadata TEXT
);
```

---

## ADR-003: Grafo de Conhecimento com Adapter Pattern

| | |
|---|---|
| **Status** | Aceito — em transição para Valter exclusivo |
| **Data** | 2026-02 |
| **Issue** | [#253](https://github.com/sensdiego/juca/issues/253) |

**Contexto:** Os dados do grafo de conhecimento precisavam de dois caminhos de acesso: desenvolvimento local (arquivos JSON, ~1M arestas) e produção (Neo4j Aura, 6K+ nós, 104K+ relacionamentos).

**Decisão:** Feature flag `KG_PROVIDER=json|neo4j` com adapter pattern. Mesma interface (`KGAdapter`), backend trocável via variável de ambiente.

**Consequências:**
- Possibilitou migração incremental de JSON para Neo4j sem alterar o código
- Agora em transição para a API Valter (`/v1/graph/*`) para todas as consultas ao KG — ambos os adapters locais serão descontinuados

---

## ADR-004: Decomposição do Orquestrador

| | |
|---|---|
| **Status** | Aceito — implementado |
| **Data** | 2026-02 |
| **Issue** | [#252](https://github.com/sensdiego/juca/issues/252) |

**Contexto:** O `orchestrator.ts` havia crescido para 1.225 linhas, tratando detecção de intenção, seleção de tool, construção de evidências, coleta de críticas, revisão e construção de prompts.

**Decisão:** Decompor em módulos focados: `intent-detector`, `tool-registry`, `clarification-policy`, `slot-filling` e implementações individuais de tools (`juris.tool.ts`, `ratio.tool.ts`, `analyzer.tool.ts`, etc.).

**Consequências:**
- Cada tool é uma classe autocontida que estende `BaseTool` com capacidades declaradas e tipos de artifact
- A seleção de tool é baseada em prioridade: AnalyzerTool (9) > JurisTool (8) > RatioTool (7) > CompareTool (5) > InsightsTool (4)
- Novas tools podem ser adicionadas implementando a interface `BaseTool` e registrando em `src/lib/unified/tools/index.ts`

---

## ADR-005: Design do Briefing Progressivo

| | |
|---|---|
| **Status** | Em andamento |
| **Data** | 2026-02 |
| **Issue** | [#283](https://github.com/sensdiego/juca/issues/283) |

**Contexto:** O fluxo de análise original despejava todos os resultados de uma vez — os usuários recebiam um muro de texto com precedentes, riscos e recomendações misturados. O feedback indicou que isso era avassalador e difícil de agir.

**Decisão:** Sistema de divulgação progressiva em quatro fases (Briefing Progressivo):
1. **Fase 1 — Diagnóstico:** Captura situação, área, tema, tese
2. **Fase 2 — Precedentes:** Cards de precedentes interativos com avaliação do usuário
3. **Fase 3 — Riscos:** Balanço visual de riscos e oportunidades
4. **Fase 4 — Entrega:** Quatro modos adaptativos (Síntese, Parecer, Estratégia, Mapa)

**Princípio chave:** Nenhuma interação obrigatória. Cada fase produz valor de forma autônoma. Implementar uma fase por vez — testar até estabilizar, depois avançar para a próxima.

**Consequências:**
- Cada fase mapeia para tipos específicos de block e endpoints da API Valter
- A seleção de situação na Fase 1 determina o modo de entrega na Fase 4 (pesquisando→síntese, avaliando→parecer, atuando→estratégia, estudando→mapa)
- Transições de fase gerenciadas por server actions em `src/actions/briefing.ts`

---

## ADR-006: Pivô para Hub Frontend

| | |
|---|---|
| **Status** | Aceito — v0.3 em andamento |
| **Data** | 2026-02 |

**Contexto:** O Juca era um monolito fullstack: motor de busca, pipeline de LLM (5 provedores), grafo de conhecimento, validação — tudo embutido na aplicação Next.js. Enquanto isso, o Valter foi construído como um backend especializado para o STJ com as mesmas capacidades, só que melhor: 23,4K decisões (vs 1,5K do Juca), 28 ferramentas MCP, Neo4j Aura + Qdrant + Redis, deployado no Railway. Manter lógica de backend idêntica nos dois projetos era desperdício.

**Decisão:** Transformar o Juca em um hub frontend leve. Delegar toda a inteligência de backend ao Valter (e futuros agentes como o Leci). O Juca mantém: UI, gerenciamento de sessão, orquestração leve, SSE streaming, autenticação.

**Consequências:**
- ~55 rotas de API a serem descontinuadas gradualmente (substituídas por chamadas à API Valter via adapter)
- ~60 scripts de ingestão/pipeline tornam-se obsoletos
- Diretório `data/` (~270MB de dados jurídicos locais) torna-se redundante
- `src/lib/backend/` (busca, LLM, KG, raciocínio, chat-pipeline) será removido após a migração
- Dependência da disponibilidade da API Valter — necessidade de health checks e estratégia de fallback

---

## ADR-007: Linguagem de Design de UI ("Liquid Legal")

| | |
|---|---|
| **Status** | Aceito — implementação v0.3 pendente |
| **Data** | 2026-02 |

**Contexto:** A UI existente foi considerada inadequada pelo dono do projeto. Um reset visual completo era necessário. O dono forneceu um componente React de referência (`docs/ui-reference.tsx`) estabelecendo a linguagem de design alvo.

**Decisão:** Sistema de design customizado chamado "Liquid Legal" com estes tokens:

| Token | Valor |
|-------|-------|
| `--bg-paper` | `#F0F0EE` |
| `--ink-primary` | `#1A161F` |
| `--ink-secondary` | `#4A4452` |
| `--surface-white` | `#FFFFFF` |
| `--radius-xl` | `32px` |
| `--radius-l` | `24px` |

**Layout:** NavIsland (trilho vertical escuro de 80px) + ChatIsland (conteúdo principal, flex 1.2) + ContextIsland (painel de documentos, flex 1).

**Consequências:**
- Nenhuma biblioteca de componentes de terceiros (sem shadcn, sem Radix) — implementação customizada em Tailwind v4
- Estilos de mensagem: IA = branco arredondado com sombra, Usuário = escuro arredondado, Citação = borda com itálico
- Composer: formato pílula com botão de envio circular
- Reescrita completa da UI necessária para v0.3
