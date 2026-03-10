# sens.legal — Progress

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
