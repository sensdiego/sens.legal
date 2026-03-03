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

**Infra configurada:**
- Audience "sens.legal waitlist" criada no Resend
- `RESEND_API_KEY` e `RESEND_AUDIENCE_ID` configuradas no Vercel (production)

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
