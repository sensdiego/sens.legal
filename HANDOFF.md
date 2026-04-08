# Handoff — 2026-04-08 (post content pass — partial)

## How to resume in the next session

**Next session will run via Codex (OpenAI Codex CLI), not Claude Code.**

Ask explicitly:

`Read /Users/sensdiego/Dev/sens.legal/HANDOFF.md and resume the content pass. 13 slots remain across 4 files.`

---

## Current state

**Project:** sens.legal — single Astro portal at sens.legal hosting Silo's public landing and gated technical data room.
**Branch:** `main` (content pass draft merged via PR #9, squash commit `4467852`).
**Stack:** Astro 5 (output: server) + Vercel + Supabase Auth (Google + GitHub) + Resend.
**Live in production at https://sens.legal** with chapters 01-05 published.
**Portal tracking issue:** sensdiego/sens.legal#8 (content pass, ~24/37 slots closed, 13 pending).

### Content pass status

| # | Surface | Slots closed | Status |
|---|---|---|---|
| 01 | `/inside/thesis` | 5/5 | ✓ live |
| 02 | `/inside/system` | 6/6 | ✓ live (architecture diagram rendered) |
| 03 | `/inside/proof` | 5/5 | ✓ live (verified live numbers with source provenance) |
| 04 | `/inside/depth` | 7/7 | ✓ live |
| 05 | `/inside/decisions` | 5+1/5 | ✓ live (includes a new MCP-first distribution ADR added during the session) |
| 06 | `/inside/roadmap` | 0/3 | pending |
| 07 | `/inside/team` | 0/4 | pending |
| — | `/about` | 0/3 | pending |
| — | `/` (landing) | 1/4 | partial (proofPoints `source` field shipped; lede, principles voice, and about hook still pending) |

All pending `<TodoBlock>` markers are invisible in production by default — `portal/src/components/silo/TodoBlock.astro` now defaults to `hideInProd=true`. Local `astro dev` still shows the markers for review; nothing orange leaks onto the live public surface.

### Last session (2026-04-08 — content pass draft via Claude Code)

The session ran interactively in slot-by-slot hybrid mode with Claude drafting from project corpus and Diego validating.

**Shipped and merged (PR #9):**

- **Chapter 01 Thesis** — 5 slots: headline (*"Legal reasoning is structural."*), lede, the problem (3 paragraphs on Brazilian litigator fragmentation), what Silo bets on (three bets on structural reasoning, traceability, end-to-end pipeline), and a concrete walkthrough of why the bet beats vector retrieval (overrule example).
- **Chapter 02 System** — 6 slots including the rendered Mermaid architecture diagram (stored at `portal/public/diagrams/silo-system.svg` with `#2B579A` accent, wired via the `<Diagram>` component). Notably the "Main interface" subsection was corrected mid-session to reflect manual MCP connector install rather than pre-built marketplace integration. The "hard problem" slot was rewritten around the hierarchical tribunal coverage insight (STJ → state court → first instance) after Diego provided the narrative.
- **Chapter 03 Proof** — 5 slots including verified live numbers (`86,522` nodes, `133,404` relationships, `2.2M` LLM-classified decisions, `45` MCP tools, `57` REST endpoints, `3` tribunals — all with `source` field provenance strings), five capabilities in production, a recorded trace of a real multi-PDF case analysis run (837 pages, 964k chars, 54 chunks, 1.73M input tokens, `US$5.58`, 32m51s), and five honest gaps.
- **Chapter 04 Depth** — 7 slots: syllogism node (Subsuncao with its real properties), cross-tribunal entity resolution (two-stage pipeline, 0.92 threshold, Sonnet adjudication, ~6,294 SAME_AS edges), hybrid search (implementation-agnostic to stay durable across the in-progress Elasticsearch migration), MCP tool surface (45 tools with OAuth 2.0 and tier enforcement), and the ingestion pipeline walkthrough (v2.3, F0→F6, `groq/openai/gpt-oss-120b`, Legal-BERTimbau, real re-extraction example with `run_label` `gpt_oss_120b_full`).
- **Chapter 05 Decisions** — 5 ADRs: graph not vectors, single product not codenames, **MCP-first distribution** (this ADR was not in the original slot list; added during the session), premortems (frontier-model capability, sales motion, unit economics — 3 of 6 candidates), plus the scope-out bullets. The "EN-first editorial discipline" candidate ADR was drafted, applied, then removed at Diego's call — it is not an engineering decision in the same league as the others.
- **Landing** — proofPoints in `constants.ts` updated with `source` field; both `index.astro` and `proof.astro` now pass it through to `ProofRow`.

**Assets added during the session:**

- `portal/public/diagrams/silo-system.svg` — rendered architecture diagram
- `portal/public/diagrams/silo-system.mmd` — Mermaid source for the diagram
- `docs/superpowers/specs/2026-04-08-silo-portal-content-pass-session.md` — session protocol spec (ordered chapter list, per-slot protocol, editorial guardrails, stop criteria)

**Factual corrections captured during the session (do not re-introduce):**

1. **Pipeline version** — the canonical ingestion pipeline is `v2.3` (active since 2026-04-01), not `v2.1`. `docs/pipeline_versions.md` in the Valter repo is the source of truth. Don't infer from filenames (`v21_*.py` is a module name, not a version label).
2. **Embedding model** — the current embedding model is `rufimelo/Legal-BERTimbau-sts-base`, not BGE-M3. BGE-M3 1024-dim is from the in-progress Elasticsearch migration and belongs to the future state, not the current state.
3. **MCP-first is manual install today** — claims that Silo is "pre-built inside Claude" are too strong. The server runs, app directory applications are in review, users today must install the remote MCP endpoint as a custom tool. Chapter 02 Main Interface and Chapter 03 Proof both reflect this correctly; keep it that way.
4. **TJSC specifically is not mentioned in the recorded trace** — the reference case is framed as "a Brazilian appellate case" without naming the tribunal. This avoids contradicting the "3 tribunals in graph: STJ, TJPR, TJSP" claim in the live numbers above it.
5. **Graph-led in production** — means the agent primarily uses graph-traversal MCP tools rather than going through `search_jurisprudence`. It does not mean the `HybridRetriever.graph_led_enabled` feature flag is `True` in production wiring — it isn't. The Chapter 05 "Graph not vectors" ADR frames the decision at the interface level.

### Pending work (13 slots, needs Diego's voice)

These are explicitly the slots Diego said need his own voice — all are personal, narrative, or strategic. Do not attempt to draft them from corpus alone.

1. **`portal/src/pages/inside/roadmap.astro`** — 3 slots:
   - Lede (2 sentences orienting the reader: the next 4-6 months + kill criteria)
   - Risks (3-5 risks with one-line description and mitigation — note Diego already approved the Premortem framing in Chapter 05 but roadmap risks are a different cut)
   - Kill criteria (2-3 explicit conditions under which Silo would stop)
   - Also: the `phases` list already renders from `constants.ts` milestones; refine the descriptions for DD voice if they still feel like marketing.

2. **`portal/src/pages/inside/team.astro`** — 4 slots:
   - Lede (2 sentences naming the team shape and operating model)
   - Team (2 paragraphs — who Diego is, who else if any, the practitioner-as-builder bet)
   - Operating model (2 paragraphs on decision-making cadence, how AI is integrated into the build loop, why a small team can ship at this velocity)
   - Cadence (concrete numbers — commits/week, releases/month, decisions/sprint)
   - "What this document does not cover" bullet list (hiring plans, comp, equity)

3. **`portal/src/pages/about.astro`** — 3 slots:
   - Background (2-3 paragraphs on Diego's bar background, the moment he decided to build Silo, why a practicing lawyer is the right person)
   - Practitioner advantage (1-2 paragraphs on insight asymmetry vs generalist tech founder)
   - Current concrete focus (short paragraph naming a recent milestone)

4. **`portal/src/pages/index.astro`** — 3 slots:
   - Landing lede polish (~2 lines in Diego's voice replacing the current working copy)
   - Voice confirmation on the 4 principles (they already read well — may only need light editing)
   - About hook (1-2 more sentences in Diego's voice ending with an invitation to `/about`)

### Session protocol for the follow-up

The protocol Claude used this session is documented in `docs/superpowers/specs/2026-04-08-silo-portal-content-pass-session.md`. Codex can follow the same shape or a simpler one — the protocol is flexible. Key guardrails that should carry over:

- **EN-only.** No PT-BR anywhere in the output.
- **Restraint over marketing.** No empty adjectives.
- **Functional names only.** Never Valter, BAU, Juca, Leci, Douto in public copy.
- **No emoji.**
- **Don't re-introduce factually wrong claims.** See the "factual corrections captured" list above.
- **Read `docs/versions.md` or `docs/pipeline_versions.md` before describing any versioned system.** The lesson persisted in `~/.claude/projects/-Users-sensdiego-Dev-sens-legal/memory/feedback_read_versions_doc_first.md`.

### Runbook follow-ups (unchanged from last HANDOFF, still open)

- **Phase 5:** Vercel teardown of the 4 docs subdomain projects (`sens-legal-{douto,juca,leci,valter}` — currently failing CI on every push because their source paths were deleted in PR #7).
- **Phase 6:** DNS cleanup of the 4 codename subdomains.
- **Phase 7:** Archive `~/Dev/silo-site` repo on GitHub.
- **Phase 8:** Optional comms about the new sens.legal/sign-in link.
- **Supabase Pro upgrade** ($25/mo) — still recommended before adding any external reviewers (see previous HANDOFF).

### Locked decisions (still in force)

- **EN-only.** No PT-BR anywhere in portal.
- **Site is gated.** OAuth via Google + GitHub, manual approval.
- **silo-site is dead.** Content lives in `docs/legacy/silo-site/` permanently.
- **Single host: sens.legal.** No more subdomain docs sites.
- **Editorial discipline.** Restraint > marketing, functional names not codenames, no emoji, "what this document does not cover" where it helps.
- **Mockup aesthetic is canonical.** InsideLayout sidebar + accent `#2B579A` + Instrument Sans + JetBrains Mono.
- **TodoBlock hides in production by default** (new in this session). Opt out per-instance with `hideInProd={false}` if needed.
