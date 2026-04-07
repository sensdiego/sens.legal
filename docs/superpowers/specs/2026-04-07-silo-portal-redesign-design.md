# Redesign sens.legal — Silo gated portal

> Spec gerada em 2026-04-07 durante sessão de brainstorm.
> Decisões validadas pelo Diego.
> Sucessora natural da spec `2026-03-29-silo-unification-redesign.md`,
> que consolidou 4 codenames sob o produto único Silo. Esta spec leva
> a unificação até o fim: colapsa o overlap com o repo `silo-site`,
> põe o site inteiro atrás de OAuth, e estabelece a estética editorial
> aprovada nos mockups como cânone.

---

## Contexto

A spec anterior (2026-03-29) consolidou os 4 codenames internos
(Valter, Juca, Leci, Douto) sob o produto único **Silo** no site sens.legal.
Aquela rodada deixou três pendências estruturais que esta spec resolve:

1. **Os 4 docs sites em `sites/{valter,juca,leci,douto}/`** continuaram
   existindo como sub-apps Astro+Starlight independentes em subdomínios
   (`valter.sens.legal` etc.). Eles vazam os codenames publicamente
   (em domínio, título, sidebar, GitHub link) e ainda são abastecidos
   por um pipeline de sync (`scripts/sync-docs.sh`) que puxa autodocs
   dos repos privados. Isso é incoerente com a unificação.

2. **Existe um repo irmão `~/Dev/silo-site`** (público em
   `github.com/sensdiego/silo`) com docs Markdown puras (sem build),
   bilíngue EN+PT-BR mas EN-primário, escritas com voz editorial restrita
   e com codenames já abstraídos desde o bootstrap. silo-site cobre
   conteúdos que se sobrepõem com o portal (product overview, architecture,
   roadmap, faq, project history, release notes). Os dois servem
   propósitos diferentes mal coordenados — content drift garantido.

3. **A audiência real do site é estreita.** Hoje só existem prospects de
   VCs e parceiros que recebem o link diretamente. Não há audiência
   pública orgânica. O modelo de site público otimizado para SEO
   é incoerente com como o produto é distribuído.

A reformulação proposta nesta spec:

- **silo-site morre como repo deployável separado.** Seu conteúdo
  Markdown vira corpus de migração para o portal. O repo é arquivado
  no GitHub após o cutover.
- **Os 4 sites em `sites/*` são deletados.** O sync pipeline morre.
  Vercel projects e DNS dos subdomínios são desligados.
- **sens.legal vira o único site Silo.** Quase tudo é gated atrás
  de OAuth (Google + GitHub) com aprovação manual. Apenas ~5 páginas
  públicas existem como porta de entrada.
- **A estética editorial dos mockups aprovados nesta sessão é cânone.**
  Sidebar numerada, top bar com confidential badge, proof rows,
  Instrument Sans + JetBrains Mono, accent #2B579A.
- **EN-only.** PT-BR mirror inteiro do portal é deletado, redirects
  PT-BR no `vercel.json` removidos.
- **A voz editorial restrita do silo-site** ("Intelligence engine",
  "Legislative grounding", "what this document does not cover") vira
  padrão para todo o conteúdo do novo portal — não só para a parte
  gated.

---

## Decisões tomadas

| # | Decisão | Razão |
|---|---|---|
| 1 | sens.legal é o único repo build target. silo-site vira corpus de migração e depois arquivo. | silo-site não tem build, não tem missão github-pública (Diego confirmou "irrelevante"), e duplicar Astro/Vercel lá seria desperdício. |
| 2 | Site inteiro gated atrás de OAuth (Google + GitHub) + aprovação manual via Supabase. | Audiência real é só convidados; OAuth + allowlist + per-page tracking dá controle e sinal. |
| 3 | OAuth login = a própria expressão de interesse de acesso. Não há formulário de waitlist separado. | Reduz atrito; OAuth profile já carrega identidade rica (nome, email, avatar, GitHub handle). |
| 4 | 5 páginas públicas: `/`, `/about`, `/sign-in`, `/pending`, `/contact` + legal (`/privacy`, `/terms`, `/data-retention`). | Privacy precisa ser readable antes do consent OAuth (compliance). Home pública dá contexto antes do CTA. |
| 5 | 8 páginas gated em `/inside/*`: landing + 7 chapters (thesis, system, proof, depth, decisions, roadmap, team). | Reviewer journey linear, exportável como bundle PDF, cada chapter é um ensaio que se refina isoladamente. |
| 6 | EN-only. PT-BR mirror do portal é deletado completo. | Audiência DD é global; duplicar narrativa curada bilíngue dobra trabalho de redação por nada. |
| 7 | Voz editorial silo-site vira padrão pra todo o site. | Disciplina já existe, é DD-friendly por design, evita reescrita futura. |
| 8 | Estética dos mockups (`dd-thesis-mockup.html` + `public-home-mockup.html`) é cânone. | Aprovada explicitamente pelo Diego. DESIGN.md já cobre paleta; uso passa a ser disciplinado. |
| 9 | Single PR com commits atômicos, não múltiplos PRs sequenciais. | Tree fica verde do começo ao fim; sem janela meio-quebrada onde links pra subdomínios sumiram mas /inside ainda não existe. |
| 10 | Vercel teardown de valter/juca/leci/douto + DNS removal entram no escopo (como manual ops runbook commitado junto). | Diego pediu explicitamente "inclua tudo isso no seu escopo". |
| 11 | `/admin` continua mas é repropositado: gerencia DD allowlist em vez de waitlist genérica. | Infra Supabase + dashboard já existe; mais barato adaptar que reconstruir. |
| 12 | Conteúdo é scaffolded por Claude (estrutura, layouts, slots TODO). Diego escreve as palavras finais. | Claude não inventa números, narrativa ou posicionamento. Conteúdo é o ativo do Diego. |
| 13 | silo-site Markdown é o ponto de partida da prosa. Diego reescreve, não copia literalmente. | Garante que voz é dele e que conteúdo reflete estado de Abr 2026, não bootstrap de Mar 2026. |

---

## Não-objetivos

Coisas que esta spec **não** entrega:

- **Conteúdo final das 8 chapters do data room.** Essa é uma fase
  separada (PR de conteúdo, autorada pelo Diego, revisada por Claude).
- **Drafts gerados por Claude a partir dos repos privados.** Pode ser
  uma sessão futura, mas não está no escopo desta spec.
- **PT-BR do conteúdo público.** EN-only é decisão fixa. Voltar atrás
  exige spec nova.
- **Domain rename (sens.legal → silo.legal ou silo.app).** Pode acontecer
  no futuro mas não faz parte desta rodada.
- **Marketing público broad-reach.** O site continua sendo "link-only"
  na prática — não tem SEO, não tem blog, não tem newsletter, não tem
  open-graph optimization além do mínimo.
- **Migração programática de números/proof points do `constants.ts`
  pra YAML em silo-site.** O `constants.ts` continua vivo no portal
  como arquivo TS típico (ele já é fácil de editar e diff'ar).
  silo-site é arquivado, não convertido em data layer.
- **Versionamento formal de releases ou tags git para o data room.**
  Conteúdo evolui inline; Diego decide quando mostrar para reviewers.
- **Notificações em tempo real (Slack, push) sobre novos access
  requests.** Email via Resend é suficiente nessa fase.
- **Audit log granular além do que `dd_views` captura
  (page, ts, ip, ua).**
- **Suporte a outros providers OAuth além de Google e GitHub.**
  Reviewer atípico que não tenha conta nesses pode pedir acesso
  via email manual fora-do-sistema.
- **Migração de Vercel projects para Cloudflare Pages ou outro host.**
  Continua tudo na Vercel.

---

## Arquitetura

### Visão geral

```
                     ┌─────────────────────────────────────┐
                     │       sens.legal (único host)       │
                     │     Astro 5 + Vercel + Supabase     │
                     └─────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼──────────────────────────┐
            │                         │                          │
       PUBLIC FACE              GATED INSIDE                BACKSTAGE
       (anonymous OK)          (approved only)             (admin only)
            │                         │                          │
   /                           /inside                    /admin/access
   /about                      /inside/thesis             /admin/views
   /sign-in                    /inside/system             (roles: admin)
   /pending                    /inside/proof
   /contact                    /inside/depth
   /privacy                    /inside/decisions
   /terms                      /inside/roadmap
   /data-retention             /inside/team
                                      │
                              ┌───────┴────────┐
                              │  middleware    │
                              │  guards /inside│
                              │  + /admin      │
                              └────────────────┘
                                      │
                              ┌───────┴────────┐
                              │  Supabase Auth │
                              │  Google+GitHub │
                              └────────────────┘
```

### URL structure final

| Rota | Acesso | Layout | Origem do conteúdo |
|---|---|---|---|
| `/` | público | `PublicLayout` (sem sidebar) | escrita nova, base no `silo-site/docs/product-overview.md` |
| `/about` | público | `PublicLayout` | escrita nova, base no perfil do Diego |
| `/sign-in` | público | `MinimalLayout` | scaffold |
| `/pending` | autenticado | `MinimalLayout` | scaffold |
| `/contact` | público | `PublicLayout` | scaffold (1 email + 1 frase) |
| `/privacy` | público | `LegalLayout` | manter o atual + atualizar para cobrir OAuth + tracking |
| `/terms` | público | `LegalLayout` | manter o atual + revisar |
| `/data-retention` | público | `LegalLayout` | manter o atual + revisar |
| `/inside` | approved | `InsideLayout` (sidebar numerada) | scaffold com landing personalizado |
| `/inside/thesis` | approved | `InsideLayout` | scaffold + base no silo-site product-overview |
| `/inside/system` | approved | `InsideLayout` | scaffold + base no silo-site architecture |
| `/inside/proof` | approved | `InsideLayout` | scaffold + base no `constants.ts` proofPoints |
| `/inside/depth` | approved | `InsideLayout` | scaffold (sem corpus prévio — Diego escreve do zero) |
| `/inside/decisions` | approved | `InsideLayout` | scaffold (sem corpus prévio) |
| `/inside/roadmap` | approved | `InsideLayout` | scaffold + base no silo-site roadmap + `constants.ts` milestones |
| `/inside/team` | approved | `InsideLayout` | scaffold (sem corpus prévio) |
| `/admin/access` | admin | `AdminLayout` | nova página, lista access_requests pending/approved/rejected |
| `/admin/views` | admin | `AdminLayout` | nova página, mostra views por reviewer |
| `/api/auth/callback` | sistema | — | Supabase OAuth callback |
| `/api/auth/sign-out` | sistema | — | clear session |

### Páginas e rotas que **morrem** nesta migração

- `/silo` → conteúdo migra pra `/` e `/inside/thesis`, rota deletada
- `/architecture` → conteúdo migra pra `/inside/system`, rota deletada
- `/api` → conteúdo migra pra `/inside/depth`, rota deletada
- `/roadmap` → migra pra `/inside/roadmap`, rota pública deletada
- `/contributing` → deletada inteira
- `/support` → deletada inteira
- `/pt-br/*` (todas) → deletadas inteiras
- `/admin/index.astro` (waitlist atual) → repropositada para landing do admin nova

### Layouts

Quatro layouts compartilhando o mesmo design system:

- **`PublicLayout.astro`**
  Top bar com `Silo` à esquerda e nav minimal à direita (Approach, About, Sign in →).
  Sem sidebar. Footer único com legal links em monospace caps.
  Usado em `/`, `/about`, `/contact`.

- **`MinimalLayout.astro`**
  Top bar mínima (só `Silo`). Centered content. Sem footer ou nav.
  Usado em `/sign-in`, `/pending`. Reduz distração no momento de auth.

- **`LegalLayout.astro`**
  Top bar pública. Sem sidebar. Conteúdo legal em coluna estreita,
  type adequado pra leitura longa. Footer.
  Usado em `/privacy`, `/terms`, `/data-retention`.

- **`InsideLayout.astro`**
  Top bar com `Silo / Technical Data Room` + badge `[CONFIDENTIAL]`
  + `viewing as <name>`. Sidebar à esquerda (17rem) com 7 seções
  numeradas + meta box (expires, last updated, repo access on request).
  Conteúdo em coluna 42rem. Pager prev/next no rodapé. CSS `@media print`
  empilha as 7 seções pra export PDF.
  Usado em `/inside` e `/inside/*`.

- **`AdminLayout.astro`**
  Top bar com `Silo / Admin`. Sidebar simples (2 itens: Access, Views).
  Conteúdo full-width pra tabelas. Cookie verificado é admin role.

Todos os layouts compartilham as variáveis CSS do `DESIGN.md`
(`--color-bg #FAFAF8`, `--color-accent #2B579A`, Instrument Sans,
JetBrains Mono).

### Componentes compartilhados (em `portal/src/components/silo/`)

- `<ProofRow value="2.2M" label="classified decisions" source="live · Apr 2026" />`
- `<Diagram src="..." caption="..." />` — wrapper com legenda em monospace
- `<SectionLabel>What's running today</SectionLabel>` — small caps mono
- `<PageLede>{...}</PageLede>` — subhead em texto secundário
- `<Pager prev="01 · Thesis" next="03 · Proof" />`
- `<ConfidentialBadge />`
- `<OauthButton provider="google|github" />`
- `<PrincipleList>` + `<Principle number="01" title="...">` — usado no /
- `<TodoBlock>` — só em scaffold/dev; não vai pra produção
- `<AdminTable>` — wrapper pra tabelas do /admin/access

Componentes existentes (`ProofPoints.astro`, `CapabilityCard.astro`,
`DocsLayout.astro`) são deletados ou rebuildados sob esta nova
convenção. O `constants.ts` permanece como source of truth pra
proofPoints/capabilities/milestones e é importado pelos novos componentes.

---

## Modelo de autenticação e autorização

### Provider stack

- **Supabase Auth** (já tem `@supabase/supabase-js` no portal)
  - Provider 1: Google (via Google Cloud Console OAuth Client)
  - Provider 2: GitHub (via GitHub OAuth App)
- **Cookie de sessão httpOnly** gerenciado pelo Supabase Auth helper
- **Astro middleware** valida sessão + estado em cada request a `/inside/*` ou `/admin/*`

### Estados de usuário

| Estado | Definição | Acessa |
|---|---|---|
| Anônimo | sem cookie de sessão Supabase | `/`, `/about`, `/sign-in`, `/contact`, legal pages |
| Autenticado, **pending** | tem sessão, `access_requests.status = 'pending'` | público + `/pending` + sign-out |
| Autenticado, **approved** | tem sessão, `access_requests.status = 'approved'` | tudo acima + `/inside/*` |
| Autenticado, **rejected** | tem sessão, `access_requests.status = 'rejected'` | público + `/pending` mostrando "request not accepted" + sign-out |
| Autenticado, **admin** | tem sessão, `profiles.role = 'admin'` | tudo acima + `/admin/*` |

### Fluxo de sign-in

```
1. Visitante anônimo na /  →  clica "Continue with Google" no CTA
2. Browser redirect: supabase.auth.signInWithOAuth({ provider: 'google',
   options: { redirectTo: 'https://sens.legal/api/auth/callback' } })
3. Google OAuth screen → user authorizes
4. Google redirect → Supabase Auth callback (.supabase.co/auth/v1/callback)
5. Supabase exchange code → session cookie set
6. Supabase redirect to portal callback (/api/auth/callback)
7. /api/auth/callback handler:
   a. await supabase.auth.getSession()
   b. extract user.id, user.email, user.user_metadata (avatar_url, name,
      provider_id, github username if github provider)
   c. UPSERT into access_requests:
      ON CONFLICT (user_id) DO UPDATE updated_at = now()
      Default status = 'pending' on insert; never overwrite existing status
   d. Send notification email to Diego via Resend (only on first insert)
   e. Redirect: if status = 'approved' → /inside; else → /pending
8. /pending renders welcome message based on status:
   - pending: "Thanks Jane! Your request is under review. We'll email
     jane@sequoia.com when it's approved."
   - rejected: "Your request to access Silo's data room was not accepted
     at this time. If you believe this is a mistake, write to <email>."
```

### Fluxo de aprovação

```
1. Diego abre /admin/access
2. Vê lista de access_requests com status='pending', ordenada por created_at
3. Cada row mostra: avatar, nome, email, provider, github_handle (se GitHub),
   org (extraído do email domain), created_at, ações
4. Diego clica "Approve"  →  PATCH /api/admin/access/{id} { status: 'approved' }
5. Backend:
   a. UPDATE access_requests SET status='approved', approved_at=now(),
      approved_by=<diego_user_id>
   b. Trigger Resend email para o reviewer:
      Subject: "You're in — Silo Technical Data Room"
      Body: "Welcome, Jane. Your access has been approved. Visit
             https://sens.legal/inside to start. The data room is structured
             as 7 chapters meant to be read in order, ~30 min total."
6. Diego volta pra lista, request agora aparece em "Approved" tab
```

Diego pode também rejeitar (status='rejected') ou deixar pending para
sempre (graceful ghost).

### Middleware (`portal/src/middleware.ts`)

```ts
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase-server';

const PUBLIC_PATHS = new Set([
  '/', '/about', '/sign-in', '/contact',
  '/privacy', '/terms', '/data-retention',
]);
const PUBLIC_PREFIXES = ['/api/auth/', '/_astro/', '/fonts/', '/favicon'];

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Always public
  if (PUBLIC_PATHS.has(path)) return next();
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return next();

  const supabase = createSupabaseServerClient(context.cookies);
  const { data: { session } } = await supabase.auth.getSession();

  // Pending page is for authenticated users only
  if (path === '/pending') {
    if (!session) return context.redirect('/sign-in');
    return next();
  }

  // Inside requires approved
  if (path.startsWith('/inside')) {
    if (!session) return context.redirect('/sign-in');
    const { data: req } = await supabase
      .from('access_requests')
      .select('status')
      .eq('user_id', session.user.id)
      .single();
    if (!req || req.status !== 'approved') return context.redirect('/pending');
    // Log view (fire-and-forget)
    context.locals.logView = true;
    return next();
  }

  // Admin requires admin role
  if (path.startsWith('/admin')) {
    if (!session) return context.redirect('/sign-in');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    if (!profile || profile.role !== 'admin') return context.redirect('/');
    return next();
  }

  return next();
});
```

View logging: páginas `/inside/*` checam `Astro.locals.logView` e disparam
um insert em `dd_views` (fire-and-forget, não bloqueia render).

---

## Schema Supabase

### Tabela `access_requests`

```sql
CREATE TABLE access_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  name            text,
  avatar_url      text,
  provider        text NOT NULL CHECK (provider IN ('google', 'github')),
  github_handle   text,
  org             text,                       -- extracted from email domain
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  approved_at     timestamptz,
  approved_by     uuid REFERENCES auth.users(id),
  notes           text                        -- diego's private notes
);

CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_created_at ON access_requests(created_at DESC);
```

### Tabela `dd_views`

```sql
CREATE TABLE dd_views (
  id              bigserial PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,              -- denormalized for ease of admin queries
  page            text NOT NULL,              -- e.g. '/inside/thesis'
  ip              inet,
  user_agent      text,
  viewed_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dd_views_user_id ON dd_views(user_id);
CREATE INDEX idx_dd_views_viewed_at ON dd_views(viewed_at DESC);
```

### Tabela `profiles` (estende `auth.users`)

```sql
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'reviewer'
                  CHECK (role IN ('reviewer', 'admin')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Diego é admin manualmente após primeiro login:
-- INSERT INTO profiles (id, role) VALUES ('<diego_user_id>', 'admin');
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Tabelas existentes do waitlist atual

A tabela atual de waitlist (`waitlist_signups` ou similar — verificar
nome real no Supabase) **não é deletada** nesta migração. Ela é
deprecada (não escreve mais), mas histórico fica preservado. Se Diego
quiser limpar depois, é uma decisão separada.

### RLS (Row Level Security)

- `access_requests`: RLS on. Reviewer só vê própria row. Admin vê tudo.
- `dd_views`: RLS on. Só admin vê.
- `profiles`: RLS on. User vê própria row. Admin vê tudo.

---

## Sistema de design — cânone

**Mockups aprovados nesta sessão são a fonte canônica de estilo:**

- `dd-thesis-mockup.html` (sidebar numerada, top bar com badge confidential, proof rows, pager, CSS print-friendly) — define `InsideLayout`.
- `public-home-mockup.html` (top bar mínima, hero com pre-label monospace, principles numerados, CTA card com OAuth buttons, footer monospace caps) — define `PublicLayout`.

Esses arquivos vivem em `.superpowers/brainstorm/49621-1775559558/content/`
e devem ser referenciados durante implementação. Vale copiá-los para
`docs/design-mockups/` no commit final pra não dependerem do session
directory que pode ser limpo.

### Variáveis CSS canônicas (já em DESIGN.md)

```css
--color-bg: #FAFAF8;
--color-bg-secondary: #F2F1EE;
--color-text: #1A1A18;
--color-text-secondary: #5C5C58;
--color-text-muted: #9C9C96;
--color-border: #E4E3DF;
--color-border-active: #1A1A18;
--color-accent: #2B579A;
--color-accent-hover: #1E3F70;
--font-sans: 'Instrument Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--header-height: 3.5rem;
```

### Restrições editoriais (do DESIGN.md, agora estritamente seguidas)

- **Zero gradiente, zero ícone decorativo, zero CTA pulsing.**
- **Único accent color: #2B579A.** Sem secondary accents.
- **Type scale fixo:** h1 2.5–3.25rem (hero pode ir até 3.25), h2 1.5–1.75rem, h3 1.0625–1.25rem, body 0.9375rem.
- **Mono pra labels, valores numéricos, code, footer.** Nunca pra body.
- **Restraint > marketing.** Quando em dúvida, menos.

### Restrições editoriais de copy (do silo-site, agora padrão pra tudo)

- **EN-only.**
- **Codenames internos NUNCA aparecem em copy.** "Intelligence engine",
  "Main interface", "Legislative grounding", "Document intelligence",
  "Evaluation layer" — nunca Valter, Juca, Leci, Douto.
- **Seções "What this document does not cover"** quando relevante,
  para hidratar a fronteira entre o que é público e o que é privado.
- **Tom:** memo de pesquisa, não pitch deck. Restraint, evidence,
  honesty about state.
- **Nunca usar emoji em copy.**

---

## Conteúdo: migração e autoria

### Princípio base

**Claude scaffolds. Diego writes.** Claude não inventa números, não
posiciona o produto, não escolhe palavras de impacto. Toda página
nova vai ter:

- Headings na hierarquia certa (h1, h2, h3)
- Componentes visuais nos slots certos (`<ProofRow>`, `<Diagram>`, etc.)
- Blocos `<TodoBlock>` visíveis em dev marcando onde cada parágrafo entra
- Quando há corpus prévio (silo-site Markdown ou constants.ts), o
  Markdown é colado como **comentário HTML invisível** dentro da página
  Astro pra Diego ter como base de reescrita. Marcado como "FROM SILO-SITE"
  ou "FROM CONSTANTS.TS".

### Mapa de origem do corpus

| Página alvo | Corpus de partida |
|---|---|
| `/` | `silo-site/docs/product-overview.md` (princípios), `constants.ts` (proofPoints) |
| `/about` | bio do Diego (escrita do zero, sem corpus prévio) |
| `/contact` | scaffold mínimo |
| `/privacy` | revisão do `portal/src/pages/privacy.astro` atual + cláusulas OAuth/tracking |
| `/terms` | revisão do atual |
| `/data-retention` | revisão do atual + cláusulas dd_views |
| `/inside/thesis` | `silo-site/docs/product-overview.md` |
| `/inside/system` | `silo-site/docs/architecture.md` (mermaid + descrição por camada) |
| `/inside/proof` | `constants.ts` proofPoints + capabilities |
| `/inside/depth` | (sem corpus — Diego escreve do zero) |
| `/inside/decisions` | `silo-site/docs/project-history.md` + decisões registradas em git |
| `/inside/roadmap` | `silo-site/docs/roadmap.md` + `constants.ts` milestones |
| `/inside/team` | (sem corpus — Diego escreve do zero) |

### Pipeline de migração

1. Antes da deleção do silo-site: copiar `silo-site/docs/*.md` (EN apenas)
   para `docs/legacy/silo-site/` neste repo, como referência permanente
   versionada. PT-BR mirror do silo-site também é descartado.
2. Durante o scaffold das páginas, embutir o Markdown relevante como
   comentário HTML no topo do arquivo `.astro`:
   ```astro
   ---
   import InsideLayout from '../../layouts/InsideLayout.astro';
   ---
   {/*
   FROM SILO-SITE: docs/product-overview.md
   --
   ## Problem
   Brazilian lawyers work across disconnected silos:
   ...
   */}
   <InsideLayout title="Thesis" chapter="01">
     <h1>{/* TODO: H1 — máx 5 palavras, ativo, declarativo */}</h1>
     ...
   </InsideLayout>
   ```
3. Diego escreve a versão final em PR de conteúdo separado, removendo
   os comentários conforme preenche.

### Autoridade do `constants.ts`

`portal/src/data/constants.ts` continua sendo a fonte de verdade para
dados estruturados (proofPoints, capabilities, milestones). Componentes
de página o importam diretamente. Quando dados mudam, é uma edição
única em TS, não em Markdown.

---

## Demolição

Lista exaustiva do que sai do tree neste PR. Cada item vira commit
atômico (ou parte de um) na seção "Plano de execução".

### Diretórios deletados

- `sites/valter/` (sub-app inteira)
- `sites/juca/` (sub-app inteira)
- `sites/leci/` (sub-app inteira)
- `sites/douto/` (sub-app inteira)
- `portal/src/pages/pt-br/` (mirror inteiro)

### Arquivos deletados

- `scripts/sync-docs.sh`
- `scripts/build-all.sh` (verificar dependentes antes; provavelmente só constrói os 4 sites)
- `portal/src/pages/silo.astro`
- `portal/src/pages/architecture.astro`
- `portal/src/pages/api/index.astro` (e qualquer outra rota sob `/api/` que não seja API endpoint)
- `portal/src/pages/roadmap.astro`
- `portal/src/pages/contributing.astro`
- `portal/src/pages/support.astro`
- `portal/src/components/ProofPoints.astro` (substituído por `<ProofRow>`)
- `portal/src/components/CapabilityCard.astro` (lógica migra pra `/inside/proof`)
- `portal/src/layouts/DocsLayout.astro` (substituído por novos layouts)

### Modificações

- `package.json` raiz: remover `sites/*` do `workspaces`. Remover scripts
  `dev:valter`, `dev:juca`, `dev:leci`, `dev:douto`, `build:all`, `sync`.
- `vercel.json` raiz: remover **todos** os 20 redirects (16 PT-BR + 4 da rodada anterior do Silo Unification, que apontavam para `/silo` que vai morrer). Adicionar redirects novos:
  - `/silo` → `/`
  - `/architecture` → `/inside/system` (vai exigir login se não tiver, retorna /sign-in)
  - `/api` → `/inside/depth`
  - `/roadmap` → `/inside/roadmap`
  - `/pt-br/(.*)` → `/`
- `README.md`: deletar tabela com `valter.sens.legal | juca.sens.legal | ...`. Reescrever pra refletir novo estado (single Astro portal at sens.legal, gated).
- `EDITORIAL_SNAPSHOT.md`: revisar/atualizar pra refletir EN-only e nova governança.
- `portal/src/components/Search.astro`: remover array `externalDocs`. Talvez deletar componente inteiro se não há mais search público.
- `progress.md`: log entry da sessão 2026-04-07.
- `HANDOFF.md`: atualizar com novo estado.

### O que **não** é deletado

- `tco/` (parece ser conteúdo interno separado, fora do escopo)
- `docs/superpowers/` (specs e plans históricos preservados)
- `output/` (parece ser output de scripts, fora do escopo)
- `shared/` — **investigar antes do commit 04**: se contém utilities
  importadas pelo `portal/`, manter intacto; se era apenas suporte aos
  4 sites deletados, deletar junto com eles. Plano de implementação
  resolve isso na fase de exploração inicial.
- `logo/` (assets já no .gitignore)
- `portal/src/pages/admin/` (repropositada, não deletada)
- Qualquer migration Supabase histórica (preservada)

---

## Plano de execução — Single PR, commits atômicos

PR title: `feat(portal): silo gated portal redesign — single source of truth`

Branch: `feat/silo-gated-portal`

### Commits

> **Nota:** A ordem abaixo é conceitual e captura intenção. A ordem
> exata (especialmente a interleave de auth lib, components com
> dependência de auth, e middleware) é refinada pelo
> `superpowers:writing-plans` no plano de implementação. O critério
> de validação é que `npm -w portal run build` passe em **cada**
> commit individual.

```
01  chore(sites): remove valter/juca/leci/douto subdirs and sync scripts
    - rm -rf sites/{valter,juca,leci,douto}
    - rm scripts/sync-docs.sh scripts/build-all.sh

02  chore(workspace): drop sites/* from workspaces and dev scripts
    - package.json: workspaces removed sites/*
    - package.json: removed dev:valter/juca/leci/douto, build:all, sync

03  chore(i18n): remove pt-br mirror and redirects
    - rm -rf portal/src/pages/pt-br
    - vercel.json: removed all pt-br redirects

04  refactor(portal): remove deprecated public pages
    - rm portal/src/pages/{silo,architecture,roadmap,contributing,support}.astro
    - rm portal/src/pages/api/index.astro
    - rm portal/src/components/{ProofPoints,CapabilityCard}.astro
    - rm portal/src/layouts/DocsLayout.astro

05  refactor(portal): remove subdomain refs from search/api/architecture/README
    - portal/src/components/Search.astro: drop externalDocs (delete file if unused)
    - README.md: remove subdomain table, rewrite for new state
    - EDITORIAL_SNAPSHOT.md: align with EN-only governance

06  docs(legacy): preserve silo-site markdown corpus under docs/legacy/silo-site
    - cp -r ~/Dev/silo-site/docs/{architecture,faq,product-overview,project-history,release-notes,roadmap}.md docs/legacy/silo-site/
    - exclude pt-br mirror

07  feat(portal/design): copy approved mockups to docs/design-mockups
    - cp .superpowers/brainstorm/.../dd-thesis-mockup.html docs/design-mockups/
    - cp .superpowers/brainstorm/.../public-home-mockup.html docs/design-mockups/

08  feat(portal/layouts): add PublicLayout, MinimalLayout, LegalLayout, InsideLayout, AdminLayout
    - new files in portal/src/layouts/
    - shared CSS variables already in portal/src/styles/

09  feat(portal/components): add silo design system components
    - portal/src/components/silo/{ProofRow,Diagram,SectionLabel,PageLede,Pager,ConfidentialBadge,OauthButton,PrincipleList,Principle,TodoBlock,AdminTable}.astro

10  feat(portal): scaffold public pages (/, /about, /contact, /sign-in, /pending)
    - portal/src/pages/{index,about,contact,sign-in,pending}.astro
    - includes embedded silo-site Markdown as HTML comments where applicable

11  feat(portal/legal): refresh privacy/terms/data-retention for OAuth + tracking
    - update portal/src/pages/{privacy,terms,data-retention}.astro
    - add OAuth provider clauses (data collected: email, name, avatar)
    - add view tracking clause (page, ts, ip, ua)

12  feat(portal/inside): scaffold 8 data room pages
    - portal/src/pages/inside/{index,thesis,system,proof,depth,decisions,roadmap,team}.astro
    - all with TODO blocks and where-relevant FROM-SILO-SITE comments

13  feat(portal/auth): supabase OAuth (google + github) integration
    - portal/src/lib/supabase-server.ts
    - portal/src/lib/supabase-browser.ts
    - portal/src/pages/api/auth/callback.ts
    - portal/src/pages/api/auth/sign-out.ts

14  feat(portal/middleware): gate /inside and /admin behind auth + status check
    - portal/src/middleware.ts
    - public path allowlist
    - access_requests status check for /inside/*
    - profiles role check for /admin/*

15  feat(portal/admin): rebuild /admin as DD allowlist + views dashboard
    - portal/src/pages/admin/index.astro (overview + landing)
    - portal/src/pages/admin/access.astro (pending/approved/rejected tabs)
    - portal/src/pages/admin/views.astro (per-reviewer view log)
    - portal/src/pages/api/admin/access/[id].ts (PATCH approve/reject)

16  feat(portal/dd): view tracking + access notification emails
    - portal/src/lib/track-view.ts
    - portal/src/lib/email-templates.ts
    - Resend integration: notify-diego, notify-approved

17  feat(db): migration for access_requests, dd_views, profiles
    - supabase/migrations/<timestamp>_silo_gated_portal.sql
    - includes RLS policies

18  chore(vercel): rewrite redirects for collapsed routes
    - vercel.json: /silo → /, /architecture → /inside/system,
      /api → /inside/depth, /roadmap → /inside/roadmap, /pt-br/(.*) → /

19  docs(runbook): manual ops for OAuth providers, vercel teardown, dns
    - docs/runbooks/silo-portal-launch.md (see "Operações manuais" below)

20  docs(progress): log 2026-04-07 silo gated portal session
    - progress.md: append session entry
    - HANDOFF.md: replace contents with new state
```

### Verificações antes de mergear

- `npm -w portal run build` passa zero warnings
- `npm -w portal run check` (astro check) passa
- Smoke local:
  - `npm run dev:portal`, abrir `localhost:4321`
  - `/` renderiza com hero, principles, CTA
  - clicar CTA → `/sign-in` mostra os 2 botões OAuth
  - botões abrem o flow Supabase (vai falhar sem env vars locais — esperado)
  - `/inside/thesis` sem cookie redireciona pra `/sign-in`
  - `/admin/access` sem cookie redireciona pra `/sign-in`
- Lighthouse no `/`: performance ≥ 95, accessibility ≥ 95
- `grep -r "valter.sens.legal\|juca.sens.legal\|leci.sens.legal\|douto.sens.legal" portal/` retorna vazio
- `grep -r "pt-br" portal/src/pages/` retorna vazio

---

## Operações manuais — runbook

Tudo isto vive em `docs/runbooks/silo-portal-launch.md`, commitado junto com o PR. Diego executa após merge, na ordem.

### Fase 1 — Setup OAuth providers (antes do deploy)

**Google Cloud Console:**
1. Console → APIs & Services → Credentials → Create Credentials → OAuth Client ID
2. Application type: Web application
3. Name: `silo-portal`
4. Authorized JavaScript origins: `https://sens.legal`, `http://localhost:4321`
5. Authorized redirect URIs: `https://<supabase-project>.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret
7. Supabase dashboard → Authentication → Providers → Google → Enable, paste credentials

**GitHub:**
1. github.com/settings/developers → New OAuth App
2. Application name: `Silo Portal`
3. Homepage URL: `https://sens.legal`
4. Authorization callback URL: `https://<supabase-project>.supabase.co/auth/v1/callback`
5. Register
6. Generate new client secret
7. Supabase dashboard → Authentication → Providers → GitHub → Enable, paste credentials

### Fase 2 — Supabase migration

```bash
cd /Users/sensdiego/Dev/sens.legal
npx supabase db push
# OR via dashboard SQL editor: paste contents of supabase/migrations/<file>.sql
```

After migration, set Diego as admin manually:

```sql
-- Run in Supabase SQL editor after Diego signs in once:
INSERT INTO profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'diego@sens.legal'  -- adjust to actual email
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Fase 3 — Vercel env vars

In Vercel dashboard → portal project → Settings → Environment Variables:

| Var | Value | Scope |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | (existing) | All |
| `PUBLIC_SUPABASE_ANON_KEY` | (existing) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | (existing or new) | Production, Preview |
| `RESEND_API_KEY` | (existing) | Production, Preview |
| `RESEND_FROM_EMAIL` | `silo@sens.legal` (or verified domain) | All |
| `DIEGO_NOTIFY_EMAIL` | `diego@sens.legal` | All |
| `PORTAL_BASE_URL` | `https://sens.legal` | Production |
| `PORTAL_BASE_URL` | `http://localhost:4321` | Development |

### Fase 4 — Smoke test em produção

After Vercel deploy completes:

1. Open `https://sens.legal` in incognito → see new home
2. Click "Continue with Google" in CTA → OAuth flow → callback redirects to `/pending`
3. `/pending` shows "Thanks Diego!" (since you're the first user)
4. Run the SQL above to set yourself as admin
5. Refresh, navigate to `/admin/access` → see your own pending row
6. Approve yourself
7. Navigate to `/inside` → see landing
8. Click into `/inside/thesis` → see scaffolded chapter with TODOs
9. Verify a row appears in `dd_views` for `/inside/thesis`

### Fase 5 — Vercel teardown dos subdomínios (após smoke test passar)

1. Vercel dashboard → project `valter-docs` → Settings → Domains → remove `valter.sens.legal`
2. Repeat for `juca-docs`, `leci-docs`, `douto-docs`
3. Each project: Settings → General → bottom of page → Pause Project (NOT delete — pause keeps it as rollback for 30 days)
4. After 30 days of stability: Vercel dashboard → each project → Delete Project

### Fase 6 — DNS cleanup

DNS records location: TBD (verificar se está em Vercel DNS, Cloudflare, ou Registro.br no momento da execução). Default assume Vercel DNS.

Vercel dashboard → Domains (top-level) → sens.legal:
1. Find DNS records for `valter`, `juca`, `leci`, `douto` (subdomain CNAMEs)
2. Delete each one

Confirm with `dig valter.sens.legal` (after TTL expires, should return NXDOMAIN or empty).

### Fase 7 — Arquivar silo-site repo

```bash
# Local
cd /Users/sensdiego/Dev/silo-site
git tag pre-archive-2026-04-07
git push --tags

# GitHub UI:
# Settings → bottom → Archive this repository
```

silo-site continua acessível como histórico, mas não recebe mais commits. Conteúdo já está em `sens.legal/docs/legacy/silo-site/` neste repo.

### Fase 8 — Comunicação (opcional)

Se algum reviewer já tem link antigo de `valter.sens.legal/...`, ele
vai dar 404 após Fase 5/6. Nenhum redirect cross-domain está
configurado (decisão consciente — DNS removal é o cleanup mais limpo).
Se necessário, Diego envia novo link manualmente.

---

## Riscos e questões abertas

### Riscos identificados

| Risco | Mitigação |
|---|---|
| OAuth provider config errado em produção (callback URL não bate) | Smoke test obrigatório em incognito. Rollback é trivial: revert deploy na Vercel. |
| Diego se exclui do próprio admin (role mal setado) | SQL backup explícito: `INSERT INTO profiles (id, role) VALUES (...)` documentado em duas formas no runbook. |
| Reviewer sem conta Google/GitHub | Documentado como out-of-scope. Fallback é mandar email manual e adicionar via SQL: `INSERT INTO access_requests (..., status='approved')` antes do reviewer fazer login (status sobrevive ao primeiro insert). |
| Email do Resend cai em spam pro reviewer | Verificar SPF/DKIM no domínio sens.legal antes do launch. Já configurado pro Resend atual. |
| `dd_views` cresce rápido e fica caro | Volume estimado: ~10 reviewers × 8 pages × 5 sessions/mês = 400 rows/mês. Trivial. |
| RLS mal configurado expõe access_requests pra reviewers | Test explicit: como reviewer logado, query `SELECT * FROM access_requests` deve retornar só própria row. |
| Conteúdo das 8 chapters não fica pronto a tempo do próximo VC pitch | Out of scope desta spec. Os scaffolds permitem que o site exista mesmo com TODOs visíveis em dev — em produção, TodoBlock pode renderizar como placeholder neutro ou ser escondido por env flag. Decisão de Diego no PR de conteúdo. |
| Reviewer encaminha link `/inside/thesis` pra outra pessoa | Não há vazamento — o destinatário cai em `/sign-in` porque sem cookie. OAuth + per-user check protege. |
| Performance do middleware (extra query no Supabase em cada request) | Cache de status na sessão (cookie httpOnly assinado) — possível otimização futura. Por enquanto, query simples por user_id é <50ms. Se virar problema, cachear no edge. |

### Questões abertas (a resolver no implementation plan ou em PRs futuros)

- **Qual email exatamente Diego usa como `DIEGO_NOTIFY_EMAIL`?** Pode haver mais de um (pessoal + escritório). Resolver no setup.
- **`portal/src/pages/admin/index.astro` atual** — Diego vai querer revisar antes de eu reescrever, ou OK eu propor desde o scaffold?
- **`/contact` — só email ou tem formulário?** Recomendação: só email (mailto:), sem formulário (formulário público em site gated é incoerente).
- **Privacy policy texto:** Diego escreve, Claude scaffolda? Ou Claude propõe draft baseado no atual + clausulas OAuth/tracking? Recomendação: Claude propõe draft, Diego revisa e ajusta.
- **`/about` precisa de foto?** Recomendação: não nessa rodada (mais bagagem visual). Pode entrar depois.
- **Reviewer com email pessoal (gmail) vs corporativo (sequoia.com)** — `org` extraído do domínio dá `gmail.com` que é inútil. Tratamento: na UI do `/admin/access`, mostrar `gmail.com` em cinza ou esconder. Diego decide caso a caso quando aprovar.
- **Quando o reviewer é aprovado, ele precisa de algum onboarding tour?** Recomendação: não. O `/inside` landing já explica. Reading time stamp ("~30 min total, 7 chapters") basta.
- **Tradução das legal pages pro inglês** — atualmente em PT-BR? Verificar e converter se necessário.
- **`/admin/access` deve ter botão "send reminder" pra rows pending há > X dias?** Out of scope. Pode entrar depois se virar fricção real.

---

## Apêndice — Estado-alvo final

### Tree (high level)

```
sens.legal/
├── DESIGN.md                         (atualizado: enforcement note)
├── EDITORIAL_SNAPSHOT.md             (atualizado: EN-only)
├── README.md                         (reescrito)
├── HANDOFF.md                        (substituído)
├── progress.md                       (entry 2026-04-07 appended)
├── package.json                      (sites/* removido do workspaces)
├── vercel.json                       (redirects atualizados)
├── docs/
│   ├── design-mockups/               (NOVO)
│   │   ├── dd-thesis-mockup.html
│   │   └── public-home-mockup.html
│   ├── legacy/                       (NOVO)
│   │   └── silo-site/
│   │       ├── architecture.md
│   │       ├── faq.md
│   │       ├── product-overview.md
│   │       ├── project-history.md
│   │       ├── release-notes.md
│   │       └── roadmap.md
│   ├── runbooks/                     (NOVO)
│   │   └── silo-portal-launch.md
│   └── superpowers/
│       ├── plans/
│       └── specs/
│           ├── 2026-03-29-silo-unification-redesign.md
│           └── 2026-04-07-silo-portal-redesign-design.md   ← ESTA SPEC
├── portal/
│   ├── src/
│   │   ├── components/
│   │   │   ├── silo/                  (NOVO — design system)
│   │   │   │   ├── AdminTable.astro
│   │   │   │   ├── ConfidentialBadge.astro
│   │   │   │   ├── Diagram.astro
│   │   │   │   ├── OauthButton.astro
│   │   │   │   ├── Pager.astro
│   │   │   │   ├── PageLede.astro
│   │   │   │   ├── Principle.astro
│   │   │   │   ├── PrincipleList.astro
│   │   │   │   ├── ProofRow.astro
│   │   │   │   ├── SectionLabel.astro
│   │   │   │   └── TodoBlock.astro
│   │   │   └── ... (existing minus deletions)
│   │   ├── data/
│   │   │   └── constants.ts          (mantido)
│   │   ├── layouts/
│   │   │   ├── AdminLayout.astro     (NOVO)
│   │   │   ├── InsideLayout.astro    (NOVO)
│   │   │   ├── LegalLayout.astro     (NOVO)
│   │   │   ├── MinimalLayout.astro   (NOVO)
│   │   │   └── PublicLayout.astro    (NOVO)
│   │   ├── lib/
│   │   │   ├── email-templates.ts    (NOVO)
│   │   │   ├── supabase-browser.ts   (NOVO)
│   │   │   ├── supabase-server.ts    (NOVO)
│   │   │   └── track-view.ts         (NOVO)
│   │   ├── middleware.ts             (NOVO)
│   │   ├── pages/
│   │   │   ├── about.astro           (NOVO)
│   │   │   ├── admin/
│   │   │   │   ├── access.astro      (NOVO)
│   │   │   │   ├── index.astro       (REESCRITO)
│   │   │   │   └── views.astro       (NOVO)
│   │   │   ├── api/
│   │   │   │   ├── admin/
│   │   │   │   │   └── access/[id].ts (NOVO)
│   │   │   │   └── auth/
│   │   │   │       ├── callback.ts   (NOVO)
│   │   │   │       └── sign-out.ts   (NOVO)
│   │   │   ├── contact.astro         (NOVO)
│   │   │   ├── data-retention.astro  (mantido, atualizado)
│   │   │   ├── index.astro           (REESCRITO — public home)
│   │   │   ├── inside/
│   │   │   │   ├── decisions.astro   (NOVO scaffold)
│   │   │   │   ├── depth.astro       (NOVO scaffold)
│   │   │   │   ├── index.astro       (NOVO landing)
│   │   │   │   ├── proof.astro       (NOVO scaffold)
│   │   │   │   ├── roadmap.astro     (NOVO scaffold)
│   │   │   │   ├── system.astro      (NOVO scaffold)
│   │   │   │   ├── team.astro        (NOVO scaffold)
│   │   │   │   └── thesis.astro      (NOVO scaffold)
│   │   │   ├── pending.astro         (NOVO)
│   │   │   ├── privacy.astro         (mantido, atualizado)
│   │   │   ├── sign-in.astro         (NOVO)
│   │   │   └── terms.astro           (mantido, atualizado)
│   │   └── styles/
│   │       └── ... (mantido)
│   ├── astro.config.mjs              (mantido)
│   └── package.json                  (mantido)
├── shared/                           (avaliar; manter ou deletar)
├── tco/                              (fora do escopo)
└── supabase/
    └── migrations/
        └── <timestamp>_silo_gated_portal.sql (NOVO)
```

### Diretórios deletados

```
sites/valter/
sites/juca/
sites/leci/
sites/douto/
portal/src/pages/pt-br/
```

### O que muda na vida do Diego depois

- Único repo pra atualizar conteúdo: `sens.legal`. silo-site arquivado.
- Único site pra olhar: `https://sens.legal`. Sem mais 5 deploys.
- Adicionar reviewer: zero passos manuais. Reviewer entra via OAuth, Diego aprova em `/admin/access` em 2 cliques.
- Telemetria: quem viu o quê em `dd_views`.
- Atualizar números: edita `constants.ts`, deploy. Componentes pegam automaticamente em `/`, `/inside/proof`, e qualquer outra página que importa.
- Atualizar narrativa de chapter: edita arquivo `.astro`, deploy. Sem sync, sem cross-repo.
- Disciplina editorial: garantida pela ausência de espaços onde marketing genérico cabe. EN-only, sem codenames, restraint > marketing.

---

## Próximo passo

Após aprovação desta spec pelo Diego, invocar `superpowers:writing-plans`
para gerar o plano de implementação executável dos 20 commits acima
em ordem, com checkpoints de revisão.
