# sens.legal — Progress

## 2026-03-29

### Silo Unification — site redesign completo

Consolidacao radical do site de 4 projetos separados (Valter, Juca, Leci, Douto) para 1 produto unificado (Silo). Net -1.939 linhas.

**Estrutura:**
- 32 rotas → 16 rotas (8 EN + 8 PT-BR)
- Nova pagina /silo (hub do produto com 7 capabilities, mini-nav, numeros honestos)
- Home reescrita: sens.legal como infra, Silo como produto
- 20 redirects 301 no vercel.json para URLs antigas
- Codenames (Valter/Juca/Leci/Douto) substituidos por nomes funcionais em todas as paginas

**Data layer:**
- `projects.ts` (678 linhas) substituido por `constants.ts` (~80 linhas)
- Novos componentes: ProofPoints, CapabilityCard, MilestoneStatus

**Design system (DESIGN.md):**
- Estetica editorial warm: off-white #FAFAF8, neutrals warm
- Tipografia: Silo font Bold (nome do produto) + Instrument Sans (tudo mais) + JetBrains Mono (code)
- Accent: Word blue #2B579A
- Fonte Silo Bold self-hosted em portal/public/fonts/

**Documentacao:**
- Spec: `docs/superpowers/specs/2026-03-29-silo-unification-redesign.md`
- Plano: `docs/superpowers/plans/2026-03-29-silo-unification.md`
- Reviews: CEO + Eng + Codex outside voice (todos passaram)

**PR:** sensdiego/sens.legal#2 (squash merged)

---

## 2026-03-27

### Retro-driven site update — Valter v0.6.0, Juca stage 3, KG numbers refresh

Atualizacao completa do snapshot editorial a partir de `/retro` (semana 2026-03-20 a 2026-03-27).

**Dados atualizados:**

- **Valter stage:** 8 → 9 (Scale + public presence). Graph reconstruction concluida.
- **Valter KG:** 53.870/194.496 → **77.828 nodes / 128.021 edges** (multi-tribunal, schema v2.1). 5.310 decisoes totalmente processadas no grafo.
- **Valter versao:** v0.6.0 (5 bumps nesta semana: v0.2.0→v0.6.0)
- **Valter testes:** 925+ → **1.900+** (1.917 funcoes de teste)
- **Valter features:** 37 → **50+** (judge profile catalog, ER provenance, similar cases expansion, TJPR sentencas, STJ importer)
- **Valter now:** similar cases expansion, ER cross-tribunal, AWS/NuageIT, OAuth App Directory
- **Scale-up target:** 800K decisoes pelo pipeline; longo prazo 35M
- **Juca stage:** 2 → 3 (Polish and expand). Briefing progressivo ENTREGUE (4 fases, block system, PDF export). Migracao encerrada. 42 issues legadas canceladas, 2 projetos fechados.
- **Juca now:** QA Perfil Decisorio end-to-end, auth de producao, expansao de UX catalogo
- **Leci:** +1 update (design spec acervo legislativo + handoff Valter)
- **Proof points:** 925+ → 1.900+ testes (home EN/PT-BR, about EN/PT-BR)
- **KG numbers atualizados em:** about (EN/PT-BR), llms.txt, llms-full.txt (Valter/Juca), architecture diagrams (EN/PT-BR), decisions.md (EN/PT-BR)

**Arquivos alterados:** `projects.ts`, `README.md`, `index.astro` (EN/PT-BR), `about.astro` (EN/PT-BR), `llms.txt`, `llms-full.txt` (Valter/Juca), `diagrams.md` (EN/PT-BR), `decisions.md` (EN/PT-BR), `progress.md`

---

## 2026-03-19

### Valter snapshot sync — Autoresearch lab, cross-stage validation, Perfil Decisorio

Atualizacao do snapshot editorial do Valter em `projects.ts` para refletir o progresso desde 2026-03-17.

**Dados atualizados:**

- **MCP tools:** 31 (era 30 — adicionou `get_perfil_decisorio` para perfilamento de juiz por materia)
- **REST endpoints:** 50+
- **Neo4j:** 53,870 nodes, 194,496 edges (STJ production)
- **Pipeline v2.1:** F0-F6 concluidos, cross-stage validation operacional (check_1 a check_4)
- **Corpus:** 2,2M decisoes classificadas (TJPR 748K + TRF4 1,43M + TJSP 13,5K), 4 scrapers ativos (TJPR, TRF4, TJSP, TJSP-eSAJ)
- **Autoresearch lab criado:** infraestrutura de experimentacao para otimizacao de prompts via Groq API
  - Stage B polarity: baseline 40% → 96,7% (regra 36 consolidada, verificacao final, custo $1,06)
  - Stage B check_2: baseline 63% → 83% (repair_context e a solucao, nao mudanca de prompt)
  - Total do lab: ~$3,70, ~3,5M tokens, 30 experimentos
  - Aprendizado: consolidacao de regras > fragmentacao; inline patterns > exemplos separados
- **Unico bloqueio restante:** check_2 (norm coverage) — mecanismo de repair_context resolve
- **summary/now/next/blockers:** atualizados para refletir cross-stage validation como frente ativa e Perfil Decisorio como proximo produto

**Arquivos alterados:** `portal/src/data/projects.ts`, `progress.md`

---

## 2026-03-16

### Valter snapshot sync

Atualizacao do snapshot editorial do Valter em `projects.ts` e `README.md` para refletir o progresso desde 2026-03-11.

**Dados atualizados:**
- **summary**: agora reflete v1.0 live (50+ REST endpoints, 30 MCP tools, 660+ testes), HTTPS/OAuth/App Directory Phase 1 concluidos
- **now**: foco atual em App Directory Fases 2-4 + politicas publicas
- **next**: Pipeline de Peticoes (5 tiers) + expansao multi-tribunal (TRF4, TJSP)
- **blockers**: removido HTTPS (concluido), adicionados politicas publicas e token guardrails/OAuth consent UI
- **Stage 9**: contagem de decisoes atualizada de 3.673 para 23.400+
- **updates**: 4 novos marcos adicionados (Pipeline de Peticoes, OAuth 2.0, App Directory Phase 1, scrapers multi-tribunal)

**Arquivos alterados:** `portal/src/data/projects.ts`, `README.md`

---

## 2026-03-03

### Issues resolvidas (7/7)

#### SEN-374 — Corrigir números do KG no portal (bug, XS)
Os números do Knowledge Graph do Valter estavam desatualizados em todo o portal.

**Antes → Depois:**
- Decisões: 28.000 → **12.091**
- Nós: 28.000 → **53.870**
- Edges: 207.000+ → **194.496**

**Arquivos alterados (12):**
- `index.astro` (EN + PT-BR)
- `architecture.astro` (EN + PT-BR)
- `about.astro` (EN + PT-BR)
- `use-cases/argument.astro` (EN + PT-BR)
- `use-cases/search.astro` (EN + PT-BR)
- `projects/valter.astro` (EN + PT-BR)

---

#### SEN-375 — Trocar Gmail por email profissional (feature, XS)
**Cancelada.** Decisão: manter o email Gmail atual.

---

#### SEN-376 — Bio: advogado, não só engenheiro (feature, XS)
Bloco "Who/Quem" do About reescrito para destacar perfil advogado + dev.

**Antes:** "a software engineer building tools..."
**Depois:** "a lawyer (OAB/PR 96.036) and software engineer building the tools he wished he had as a legal professional..."

**Arquivos alterados:** `about.astro` (EN + PT-BR)

---

#### SEN-377 — Corrigir stack do Leci em projects.ts (bug, XS)
O Leci estava com a stack da documentação ao invés da stack real do projeto.

**Antes:** `['Astro', 'Starlight', 'TypeScript']`
**Depois:** `['Next.js', 'PostgreSQL', 'pgvector', 'Railway', 'TypeScript']`

**Arquivo alterado:** `portal/src/data/projects.ts`

---

#### SEN-378 — Adicionar Douto ao Contributing (bug, XS)
O Douto estava ausente das páginas Contributing, gerando inconsistência com o resto do portal.

**Adicionado em:**
- Seção "Getting Started" / "Como Começar"
- Seção "Repositories" / "Repositórios"
- Seção "Areas Where We Need Help" / "Áreas Onde Precisamos de Ajuda"

A página PT-BR também ganhou a seção "Repositórios" que estava faltando, trazendo paridade com a versão EN.

**Arquivos alterados:** `contributing.astro` (EN + PT-BR)

---

#### SEN-379 — CTA real no portal com waitlist (feature, M)
Waitlist implementada com Resend Audiences.

**O que foi feito:**
- Adapter `@astrojs/vercel` instalado (SSR sob demanda)
- API route `POST /api/waitlist` usando Resend SDK
- Form de email acima da dobra nas homepages EN e PT-BR
- Client-side submit com feedback visual
- Fix de compatibilidade Astro 5 (removido `output: hybrid` deprecado)
- Fix CSRF: Vercel bloqueia POST com FormData — migrado para JSON
- Fix env vars: `process.env` ao invés de `import.meta.env` (runtime vs build time)
- Email de boas-vindas automático via Resend (fire-and-forget)

**Infra configurada:**
- Audience "sens.legal waitlist" criada no Resend
- `RESEND_API_KEY` e `RESEND_AUDIENCE_ID` configuradas no Vercel (production)
- Email sai de `onboarding@resend.dev` até configurar domínio (ver SEN-402)

**Arquivos alterados/criados:**
- `portal/astro.config.mjs`
- `portal/package.json`
- `portal/src/pages/api/waitlist.ts` (novo)
- `portal/src/pages/index.astro` (EN)
- `portal/src/pages/pt-br/index.astro` (PT-BR)

---

#### SEN-380 — Sync CI-safe (bug, M)
Script de sync dependia de paths locais hardcoded (`~/Dev/`).

**O que foi feito:**
- `BASE_DIR` agora usa env var `DOCS_ROOT` (fallback `~/Dev`)
- Repos ausentes geram warning e são pulados (não aborta mais)
- `DEPLOY.md` atualizado com documentação da env var

**Arquivos alterados:**
- `scripts/sync-docs.sh`
- `DEPLOY.md`

---

### Backlog (issues criadas para o futuro)

Todas as issues do backlog inicial foram resolvidas em 2026-03-10.

---

## 2026-03-10

### Issues resolvidas (5/5)

#### SEN-400 — SEO / Open Graph meta tags no portal (feature, S)
- `@astrojs/sitemap` instalado e configurado — gera `sitemap-index.xml` automaticamente
- hreflang alternate links adicionados ao `DocsLayout.astro` (EN, PT-BR, x-default)
- `og-image.png` (1200x630) criado, substituindo a logo quadrada 2000x2000
- Canonical links adicionados

**Arquivos alterados:** `portal/astro.config.mjs`, `portal/src/layouts/DocsLayout.astro`, `portal/public/og-image.png` (novo)

---

#### SEN-401 — Dashboard admin para waitlist (feature, M)
- Schema `portal` criado no Supabase (isolado para o portal)
- Tabela `portal.waitlist` com RLS, funções RPC (`portal_waitlist_insert`, `portal_waitlist_list`, `portal_waitlist_count`)
- Endpoint `POST /api/waitlist` agora persiste no Supabase antes de enviar ao Resend
- Endpoint `GET /api/admin/waitlist?token=...` retorna JSON dos inscritos
- Página `/admin/waitlist?token=...` com dashboard visual (dark theme, tabela de inscritos)
- `@supabase/supabase-js` instalado, `lib/supabase.ts` criado
- Env vars no Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN`

**Arquivos criados:** `portal/src/lib/supabase.ts`, `portal/src/pages/admin/waitlist.astro`, `portal/src/pages/api/admin/waitlist.ts`
**Arquivos alterados:** `portal/src/pages/api/waitlist.ts`, `portal/package.json`

---

#### SEN-402 — Configurar domínio sens.legal no Resend (infra, S)
- Domínio `sens.legal` adicionado ao Resend (região São Paulo, sa-east-1)
- 3 registros DNS configurados no Hostinger: DKIM (TXT), MX, SPF
- Verificação concluída — status **Verified**
- Env var `RESEND_FROM_EMAIL` configurada no Vercel
- Emails de waitlist agora saem de `@sens.legal`

---

#### SEN-403 — Douto docs site (feature, S)
- `SITE_MANIFEST.json` criado no repo Douto (formato Juca — file-based, 30 docs EN + PT-BR)
- `.gitignore` atualizado para permitir tracking do manifesto
- `sync-docs.sh` agora sincroniza o Douto automaticamente (antes era pulado)
- Build validado: 61 páginas geradas (30 EN + 30 PT-BR + 404)

**Arquivos criados:** `/Douto/SITE_MANIFEST.json`
**Arquivos alterados:** `/Douto/.gitignore`

---

#### SEN-404 — CI pipeline com GitHub Actions (feature, S)
- Workflow `.github/workflows/ci.yml` criado (roda em push/PR para main)
- Etapas: typecheck do portal (`astro check`) + build dos 5 workspaces
- `@astrojs/check` adicionado ao portal como dev dependency
- 32 erros de tipo corrigidos no portal (null checks DOM, CDN imports, element casts)
- Typecheck passa com 0 erros

**Arquivos criados:** `.github/workflows/ci.yml`
**Arquivos alterados:** `portal/package.json`, `portal/src/pages/index.astro`, `portal/src/pages/pt-br/index.astro`, `portal/src/pages/architecture.astro`, `portal/src/pages/pt-br/architecture.astro`

---

## 2026-04-07 — Silo gated portal redesign

- Spec: `docs/superpowers/specs/2026-04-07-silo-portal-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-07-silo-portal-redesign.md`
- PR: `feat/silo-gated-portal` (link after merge)

What this rebuild ships:

- The 4 codename docs sites (`sites/{valter,juca,leci,douto}/`) deleted; their content was autosynced from external repos and is no longer needed.
- silo-site repo (`~/Dev/silo-site`) archived; its 6 EN markdown files preserved under `docs/legacy/silo-site/` as corpus.
- The portal becomes a single Astro app gated behind Supabase OAuth (Google + GitHub) with manual approval.
- Public surface reduced to 5 pages (`/`, `/about`, `/sign-in`, `/pending`, `/contact`) plus legal pages; everything else lives behind the gate at `/inside/*`.
- The data room is structured as 7 chapters meant to be read in order: thesis, system, proof, depth, decisions, roadmap, team.
- PT-BR mirror deleted entirely under EN-only discipline.
- Editorial design from the brainstorm session mockups (`docs/design-mockups/`) is canonical: warm off-white, accent #2B579A, Instrument Sans + JetBrains Mono.
- Admin dashboard rebuilt from the ground up: overview, access requests with approve/reject, view tracking.

### 2026-04-07 (continued) — code review, launch, and live smoke test

Pre-merge code review on the in-flight branch surfaced 14 critical findings across 4 reviewer sources (security specialist, data-migration specialist, Claude adversarial, Codex adversarial). Highlights and what shipped:

- **RLS migration was broken in two independent ways.** `profiles_admin_read_all` did `EXISTS (SELECT 1 FROM profiles ...)` from inside a SELECT policy on profiles → `42P17 infinite recursion detected`. Separately, `profiles_self_update` had `USING (id = auth.uid())` with no `WITH CHECK` → any reviewer could `update({ role: 'admin' })` from the browser via the anon key. Plus `handle_new_user` was SECURITY DEFINER without `SET search_path` (CVE-2018-1058 vector). Plus the migration wasn't idempotent. Rewrote the entire migration: dropped recursive admin policies (admin reads go through service role), removed `profiles_self_update` (welcome.ts already uses service role), added `SET search_path = public, pg_temp` to both functions, wrapped every `CREATE POLICY` with `DROP POLICY IF EXISTS`. Added `idx_dd_views_user_page_viewed_at` composite index for the new dedupe + `idx_access_requests_approved_by` partial FK index.
- **Middleware was using `getSession()` instead of `getUser()`** — the explicitly-warned-against Supabase server-side anti-pattern. Switched to `getUser()`. Also anchored path gates (`path === '/inside' || path.startsWith('/inside/')`) so a sibling route like `/insidious` can't bypass.
- **CSRF wasn't enforced** on `/api/admin/access/[id]`, `/api/auth/welcome`, `/api/auth/sign-out`. Enabled Astro 5's `security: { checkOrigin: true }` in `astro.config.mjs`. Verified in production manifest (dev mode disables it by design).
- **Race condition in `/api/auth/callback`**: read-then-insert pattern would crash on the second concurrent OAuth callback for the same user (23505 unique_violation). Replaced with INSERT-first; on conflict fall through to metadata refresh.
- **Resend send was awaited synchronously** in the OAuth callback — could block until Vercel's 10s function timeout. Wrapped in `Promise.race` against a 3s timeout.
- **Avatar URLs from OAuth metadata flowed straight into `<img src>`** in the admin panel — reviewer-controlled tracking pixel vector. Added an allowlist of provider hosts (lh3-6.googleusercontent.com, avatars.githubusercontent.com) in `callback.ts`.
- **`OauthButton` script double-binds** click handlers on view transitions, racing two PKCE code_verifier cookies. Added `dataset.bound` flag.
- **`supabase-server.ts` read env vars at module load time** with `!` non-null assertions — cold start without env vars permanently bound to placeholders. Moved to lazy `getEnv()` reads.
- **Several smaller fixes**: error checks on every supabase-js call (it doesn't throw), UUID validation on `params.id`, audit fields cleared on reject, email refreshed on returning users, etc.
- Followed up the security/correctness fixes with a refactor pass: viewer info centralized in middleware → `Astro.locals` (eliminated duplicate queries in 7 inside pages), `ACCESS_STATUS` const replaces magic strings everywhere, hand-typed `Database` interface (drops `any`), `lib/format.ts` extracted from duplicate `fmtDate`/`fmtTs`, dead code removed (`Header.astro`, `Footer.astro`, `Sidebar.astro`, `data/routes.ts`, dead exports in `constants.ts`), `dd_views` dedupe within 60s window. Runbook Phase 4 expanded into 5 sub-phases (4a happy path, 4b GitHub OAuth, 4c rejection/revoke/reapply, 4d auth gating probes, 4e error redirects).
- Validated the rewritten migration against a real Supabase project (`ikywqzcllcmikmaolbij`, the existing sens.legal project from SEN-401). Discovered the project had legacy schemas from an abandoned experiment (`raw_decisions`, `pipeline_processing`, `portal.waitlist`) — all with zero rows. Dropped them via `cleanup_legacy_schemas` migration, applied the new schema, ran a stress test that confirmed: SELECT works without recursion, the trigger fires correctly on auth.users insert, privilege escalation via `UPDATE profiles SET role='admin'` returns 0 rows because there's no UPDATE policy on profiles for the authenticated role.
- Shipped 5 atomic commits to `feat/silo-gated-portal`, opened PR #7, merged via `gh pr merge --squash`. Vercel deploy completed in 23 seconds.
- Configured OAuth providers via Chrome browser MCP: created Google OAuth Client `Silo Portal` in `paidproject` Google Cloud project (added `diego@sens.legal` as test user), created GitHub OAuth App `Silo Portal` in sensdiego account, configured both providers in Supabase Auth.
- Vercel env vars: added `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`. The legacy `SUPABASE_SERVICE_ROLE_KEY` from SEN-401 was already correct for this project.
- **Site URL footgun discovered live**: Supabase Auth shipped with `Site URL = http://localhost:3000` by default. After successful Google OAuth, Supabase Auth redirected the browser to `localhost:3000/?code=...` instead of `sens.legal/api/auth/callback`. Fixed via dashboard: `Site URL → https://sens.legal`, added both `https://sens.legal/api/auth/callback` and `http://localhost:4321/api/auth/callback` to the Redirect URLs allowlist. Documented as new Phase 1.5 in the runbook so the next person doesn't lose 3 minutes to the same issue.
- End-to-end smoke test passed: signed in via Google as `diego@sens.legal`, landed at `/pending`, promoted self to admin via SQL through the Supabase MCP, navigated to `/inside`, welcome card rendered with first-name extraction working, dd_views logged with the 60-second dedupe (2 rapid reloads → 1 row), `/admin` overview cards showed `0 pending, 1 currently active`.
- Created issue #8 to track the remaining content authoring work (37 `<TodoBlock>` slots across the public landing, about page, and 7 inside chapters).

**State at end of session:**

- Portal LIVE in production at https://sens.legal and https://sens.legal/inside (gated, 1 admin reviewer = Diego).
- Outstanding work tracked: issue #8 (content pass) and runbook Phases 5–8 (Vercel teardown of the 4 docs subdomain projects, DNS cleanup, silo-site repo archival, optional comms).
- Open recommendation: consider Supabase Pro ($25/mo) for the gated portal because the current free-tier project auto-pauses after inactivity — a data room of legal access logs shouldn't depend on "hope nobody pauses it."
