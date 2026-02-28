---
title: "Architecture Decision Records"
description: "Key architectural decisions in Juca with context, rationale, and consequences."
lang: en
sidebar:
  order: 3
---

# Architecture Decision Records

Every significant architectural choice in Juca is documented here with context, alternatives considered, and consequences. ADRs are numbered chronologically and never deleted — superseded decisions are marked as such.

## ADR-001: Unified Home over Tab-Based Navigation

| | |
|---|---|
| **Status** | Accepted — implemented in rewrite (Waves 0-5) |
| **Date** | 2026-02 |
| **Issue** | [#162](https://github.com/sensdiego/juca/issues/162) |

**Context:** Original Juca had 6 separate tabs (Chat, Juris, Ratio, Compare, Insights, Semantic), each with its own state management, SSE connection, and rendering logic. Adding a feature to one tab had no effect on others. Maintenance cost was O(n) per feature per tab.

**Decision:** Unify into a single Home view with a Block System. Extend the Home orchestrator (tool registry, artifacts) instead of maintaining parallel tab codebases.

**Consequences:**
- 11 block types replaced 6 separate panels
- Single WorkCanvas renders all content types
- State management simplified from 11 Zustand stores to React `useState` + Server Actions
- Tool Registry pattern enables adding new capabilities without UI changes

---

## ADR-002: SQLite for Session Persistence

| | |
|---|---|
| **Status** | Accepted — will be revisited at v0.6+ |
| **Date** | 2026-01 |
| **Issue** | [#169](https://github.com/sensdiego/juca/issues/169) |

**Context:** Juca needed session and block persistence. Options: JSON files, SQLite, PostgreSQL.

**Decision:** SQLite via `better-sqlite3` with WAL mode and foreign key cascading.

**Rationale:** JSON files at 100K documents would consume ~2.6GB RAM. SQLite is zero-config, file-based, supports FTS5 for full-text search, and `sqlite-vec` for vector operations. PostgreSQL was overkill for a single-developer project.

**Consequences:**
- Zero additional infrastructure for persistence
- Synchronous API blocks the Node.js event loop under load (~50 concurrent users)
- Migration to PostgreSQL planned for v0.6+ ([#231](https://github.com/sensdiego/juca/issues/231))

**Schema:**

```sql
-- Sessions table
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

-- Messages/blocks table
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

## ADR-003: Knowledge Graph with Adapter Pattern

| | |
|---|---|
| **Status** | Accepted — transitioning to Valter-only |
| **Date** | 2026-02 |
| **Issue** | [#253](https://github.com/sensdiego/juca/issues/253) |

**Context:** Knowledge graph data needed both local dev (JSON files, ~1M edges) and production (Neo4j Aura, 6K+ nodes, 104K+ relationships) access paths.

**Decision:** Feature flag `KG_PROVIDER=json|neo4j` with adapter pattern. Same interface (`KGAdapter`), swappable backend via environment variable.

**Consequences:**
- Enabled incremental migration from JSON to Neo4j without code changes
- Now transitioning to Valter API (`/v1/graph/*`) for all KG queries — both local adapters will be deprecated

---

## ADR-004: Orchestrator Decomposition

| | |
|---|---|
| **Status** | Accepted — implemented |
| **Date** | 2026-02 |
| **Issue** | [#252](https://github.com/sensdiego/juca/issues/252) |

**Context:** `orchestrator.ts` had grown to 1,225 lines handling intent detection, tool selection, evidence building, critique collection, revision, and prompt construction.

**Decision:** Decompose into focused modules: `intent-detector`, `tool-registry`, `clarification-policy`, `slot-filling`, and individual tool implementations (`juris.tool.ts`, `ratio.tool.ts`, `analyzer.tool.ts`, etc.).

**Consequences:**
- Each tool is a self-contained class extending `BaseTool` with declared capabilities and artifact types
- Tool selection is priority-based: AnalyzerTool (9) > JurisTool (8) > RatioTool (7) > CompareTool (5) > InsightsTool (4)
- New tools can be added by implementing the `BaseTool` interface and registering in `src/lib/unified/tools/index.ts`

---

## ADR-005: Briefing Progressivo Design

| | |
|---|---|
| **Status** | In progress |
| **Date** | 2026-02 |
| **Issue** | [#283](https://github.com/sensdiego/juca/issues/283) |

**Context:** The original analysis flow dumped all results at once — users received a wall of text with precedents, risks, and recommendations mixed together. Feedback indicated this was overwhelming and difficult to act on.

**Decision:** Four-phase progressive disclosure system (Briefing Progressivo):
1. **Phase 1 — Diagnosis:** Capture situation, area, theme, thesis
2. **Phase 2 — Precedents:** Interactive precedent cards with user evaluation
3. **Phase 3 — Risks:** Visual risk-opportunity balance
4. **Phase 4 — Delivery:** Four adaptive modes (Síntese, Parecer, Estratégia, Mapa)

**Key principle:** No mandatory interaction. Each phase produces standalone value. Implement one phase at a time — test until stable, then proceed to next.

**Consequences:**
- Each phase maps to specific block types and Valter API endpoints
- Situation selection in Phase 1 determines the delivery mode in Phase 4 (pesquisando→síntese, avaliando→parecer, atuando→estratégia, estudando→mapa)
- Phase transitions managed by server actions in `src/actions/briefing.ts`

---

## ADR-006: Pivot to Frontend Hub

| | |
|---|---|
| **Status** | Accepted — v0.3 in progress |
| **Date** | 2026-02 |

**Context:** Juca was a fullstack monolith: search engine, LLM pipeline (5 providers), knowledge graph, validation — all embedded in the Next.js app. Meanwhile, Valter was built as a specialized STJ backend with the same capabilities but better: 23.4K decisions (vs Juca's 1.5K), 28 MCP tools, Neo4j Aura + Qdrant + Redis, deployed on Railway. Maintaining identical backend logic in both projects was wasteful.

**Decision:** Transform Juca into a lightweight frontend hub. Delegate all backend intelligence to Valter (and future agents like Leci). Juca keeps: UI, session management, lightweight orchestration, SSE streaming, authentication.

**Consequences:**
- ~55 API routes to gradually deprecate (replaced by Valter API calls via adapter)
- ~60 ingest/pipeline scripts become obsolete
- `data/` directory (~270MB of local legal data) becomes redundant
- `src/lib/backend/` (search, LLM, KG, reasoning, chat-pipeline) will be removed after migration
- Dependency on Valter API availability — need health checks and fallback strategy

---

## ADR-007: UI Design Language ("Liquid Legal")

| | |
|---|---|
| **Status** | Accepted — v0.3 implementation pending |
| **Date** | 2026-02 |

**Context:** The existing UI was deemed inadequate by the project owner. A complete visual reset was needed. The owner provided a React reference component (`docs/ui-reference.tsx`) establishing the target design language.

**Decision:** Custom design system called "Liquid Legal" with these tokens:

| Token | Value |
|-------|-------|
| `--bg-paper` | `#F0F0EE` |
| `--ink-primary` | `#1A161F` |
| `--ink-secondary` | `#4A4452` |
| `--surface-white` | `#FFFFFF` |
| `--radius-xl` | `32px` |
| `--radius-l` | `24px` |

**Layout:** NavIsland (80px dark vertical rail) + ChatIsland (main content, flex 1.2) + ContextIsland (document panel, flex 1).

**Consequences:**
- No third-party component library (no shadcn, no Radix) — custom Tailwind v4 implementation
- Message styles: AI = white rounded with shadow, User = dark rounded, Citation = bordered italic
- Composer: pill-shaped with circular send button
- Full UI rewrite required for v0.3
