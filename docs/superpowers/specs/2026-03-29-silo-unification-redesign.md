# Redesign sens.legal — Unificação Silo

> Spec gerada em 2026-03-29 durante sessão de brainstorm.
> Decisões validadas pelo Diego. Revisada por CEO review + Codex outside voice.

---

## Contexto

O site sens.legal é o site de documentação e infraestrutura do ecossistema.
Atualmente apresenta 4 projetos separados (Valter, Juca, Leci, Douto) com
páginas, roadmaps e use cases individuais — 16 páginas únicas (32 rotas
contando EN + PT-BR).

O SILO unification map (2026-03-28) redefine tudo como **um produto único
chamado Silo**. Valter, BAU, Juca, Leci e Douto são codenames internos de
desenvolvimento. Para o mundo externo, é tudo Silo.

O site precisa ser redesenhado para refletir essa realidade.

---

## Decisões tomadas

1. **sens.legal persiste como site de documentação/infra.** Não é landing page.
   O domínio silo.legal será a landing page no futuro.

2. **Silo é o produto único.** Todas as engrenagens são descritas com nomes
   funcionais (Motor de Grafo, Interface, etc.), nunca codenames (Valter, Juca).
   Isso inclui limpar referências a codenames nas páginas restantes do portal
   (architecture, api, about, contributing).

3. **Consolidação radical.** De 21 páginas para 8 (x2 bilíngue = 16 rotas).

4. **Bilíngue (EN + PT-BR)** como hoje.

5. **Números honestos com ranges arredondados.** Usar "75K+ nodes", "120K+
   relationships", "35+ MCP tools" em vez de números exatos que desatualizam.
   Campo `lastUpdated` no constants.ts com data do último sync.

6. **Busca é graph-led.** Neo4j como fonte primária, busca semântica complementa
   como fallback. Sem referência a "weighted", "hybrid" ou "pesos adaptativos"
   na documentação — a busca é graph-led, ponto.

7. **Use cases viram seções dentro da página /silo.** Não existem como páginas
   separadas. Só mostra o que funciona de verdade.

8. **Douto continua** como engrenagem "Doutrina" — pipeline local, fornecedor
   interno do motor, pre-release.

9. **`/api` como thin hub.** Overview do que existe + links pra docs canônicos.
   Sem contagens detalhadas de endpoints/tools que desatualizam.

10. **Roadmap sem issue IDs.** Milestones com descrições sim, SEN-XXX e
    dependency DAGs não. Contexto interno fica no Linear.

11. **Mini-nav com anchor links** no topo da /silo pra navegar as 7 capacidades.

---

## Sitemap

8 páginas (EN + PT-BR = 16 rotas):

### / (Home)

Propósito: porta de entrada, apresenta o Silo, proof points, waitlist.

Conteúdo:
- Hero: "Silo" + tagline "Infraestrutura de inteligência jurídica rastreável"
- Proof points honestos (ranges arredondados):
  - 75K+ nodes no grafo
  - 120K+ relationships
  - 2.2M corpus classificado
  - 35+ MCP tools
  - 50+ REST endpoints
  - 4 tribunais (STJ, TJPR, TJSP, TRF4)
- Parágrafo: o que é o Silo (grafo 360°, potencializa LLMs)
- Preview de capacidades (lista curta com link para /silo)
- Waitlist CTA (mantém formulário existente)

Remove:
- Lista de 4 projetos com status/stack/roadmap cards
- Referências a projetos individuais por nome

### /silo

Propósito: página-hub do produto. Concentra tudo que antes eram 4 projetos + 4 use cases.

Estrutura (scroll vertical com mini-nav de anchor links no topo):

**Mini-nav (EN):** Graph | Judge Intelligence | Search | Pipeline | Archive | Legislation | Doctrine
**Mini-nav (PT-BR):** Grafo | Inteligência Decisória | Busca | Pipeline | Acervo | Legislação | Doutrina

**Seção 1 — O problema**
Modelos de fronteira alucinam citações, perdem relações entre decisões, não
oferecem trilha de auditoria. Advogados não podem confiar em respostas sem
evidência.

**Seção 2 — O que é o Silo**
Grafo de conhecimento jurídico 360° que materializa o silogismo jurídico
(premissa maior + menor → conclusão) em estrutura de dados navegável.
Potencializa LLMs com dados estruturados, relacionais e verificáveis sobre
como tribunais decidem.

**Seção 3 — Números**
Grid com proof points (ranges arredondados, mesmos da home com mais contexto):
- 75K+ nodes, 120K+ relationships (Neo4j Aura, schema v2.1, 9 labels, 15 edge types)
- 2.2M corpus classificado (STJ, TJPR, TJSP, TRF4)
- 35+ MCP tools, 50+ REST endpoints
- 4 tribunais
- 6K+ SAME_AS edges (entity resolution cross-tribunal)

**Seção 4 — Capacidades**
7 capacidades, cada uma com descrição e estado real marcado por cor:

| Capacidade | Nome funcional | Estado | Cor |
|---|---|---|---|
| Grafo de Conhecimento | Motor de Grafo | Operacional | Verde |
| Perfil Decisório | Inteligência Decisória | Operacional | Verde |
| Busca Graph-Led | Busca | Funcional | Azul |
| Pipeline de Ingestão | Pipeline | Funcional | Azul |
| Acervo Estruturado | Acervo | Em construção | Laranja |
| Resolução Legislativa | Legislação | Em construção | Laranja |
| Doutrina | Doutrina | Em construção | Laranja |

Detalhes por capacidade:

**Grafo de Conhecimento (Operacional)**
Neo4j Aura. 9 labels, 15 tipos de relação. Nó de Subsunção materializa o
silogismo jurídico. Entity resolution cross-tribunal (SAME_AS). Schema v2.1.

**Inteligência Decisória (Operacional)**
Como cada ministro decide por tema. Catálogo de recortes, comparação entre
julgadores, conversão de perfil em argumentação. Primeiro produto com uso real.

**Busca Graph-Led (Funcional)**
Neo4j como fonte primária, busca semântica como fallback. Cross-encoder
reranking. Filtros por ministro, tribunal, data, resultado.

**Pipeline de Ingestão (Funcional)**
v2.2, 12 estágios: Ingestão → segmentação → metadados (LLM) → análise
normativa → análise fática → canonicalização (regex + embedding + cross-tribunal)
→ carga Neo4j. Coerência cross-stage com 4 checks.

**Acervo Estruturado (Em construção)**
Camada agent-friendly sobre petições. Extração de citações, priorização de
pipeline por demanda real de advogados. Normalização CNJ operacional. Camada
LLM pendente de validação (GATE).

**Resolução Legislativa (Em construção)**
Referência legal → ID canônico. Parser de citações, alias registry (19 leis),
bulk resolution com temporal override. 322 testes, 0 falhas. 3 leis no banco
(CF, CC, CPC). Roda local apenas — não deployado.

**Doutrina (Em construção)**
Pipeline local: livros jurídicos → chunks → embeddings → busca CLI. Foco em
contratos e processo civil. Fornecedor interno do motor. Pre-release.

### /architecture

Propósito: transparência técnica para investidores e desenvolvedores.

Conteúdo:
- Diagrama de engrenagens com nomes funcionais (sem codenames — limpar
  referências existentes a Valter/Juca/Leci/Douto)
- Fluxo de dados: petição → extração de sinais → priorização → pipeline
  12 estágios → grafo → busca graph-led → resposta
- Stack por camada:
  - Motor: Python, FastAPI, Neo4j Aura, Qdrant, PostgreSQL, Redis
  - Interface: Next.js, React, TypeScript, SQLite
  - Legislação: Next.js, PostgreSQL, Drizzle ORM, pgvector
  - Doutrina: Python, LlamaParse, MiniMax, Legal-BERTimbau
  - Acervo: Python, Pydantic v2, structlog
- Pontos de integração entre engrenagens
- Deploy: Railway (API + MCP remote), Neo4j Aura

### /api

Propósito: thin hub com overview e links pra docs canônicos.

Conteúdo:
- Overview: o Silo expõe REST endpoints e MCP tools pra agentes e integradores
- REST: breve descrição dos grupos de endpoints + link pra docs canônicos
- MCP: breve descrição das categorias de tools + link pra docs canônicos
- Auth, rate limits, SSE (overview)
- NÃO listar contagens detalhadas de endpoints/tools (desatualizam)

Consolida as 2 páginas atuais (/api/rest + /api/mcp) em uma.
Arquivo: `portal/src/pages/api/index.astro` (coexiste com `/api/waitlist`
server endpoint que NÃO deve ser afetado).
Limpar referências a codenames nos links.

### /roadmap

Propósito: estado do progresso por milestones.

Conteúdo:
- Milestones do Silo com descrições:
  1. **Fundação** — densificação dirigida do grafo no nicho societário/M&A
  2. **Momento 360** — diagnóstico de caso, fundamentação assistida, validação A/B
  3. **Validação** — validar 360 com advogada externa
  4. **Flywheel** — demonstrar ciclo virtuoso com petições reais
  5. **Pitch** — evidence pack
- Estado por milestone (done, in progress, planned)
- Sem issue IDs (SEN-XXX) nem dependency DAGs — contexto interno fica no Linear
- Remove os 4 roadmap cards individuais por projeto

### /about

Propósito: quem é Diego, visão, diferencial.

Conteúdo:
- Adapta texto atual (está bom)
- Reframing: "sens.legal é a infraestrutura do Silo" em vez de "ecossistema de 4 projetos"
- Limpar referências a codenames (trocar por nomes funcionais)
- Mantém: OAB, background, visão de rastreabilidade

### /contact

Mantém como está.

### /contributing

Adapta para "contribuir ao Silo" em vez de projetos individuais.
Limpar referências a codenames.

---

## Data layer

### Abordagem: constants.ts pequeno + conteúdo direto nas páginas

Em vez de um data layer monolítico (projects.ts → silo.ts), o conteúdo vai
direto nas páginas Astro. Um arquivo `constants.ts` pequeno compartilha apenas
o que é reusado entre páginas:

```typescript
// portal/src/data/constants.ts

export const lastUpdated = '2026-03-29';

export const proofPoints = [
  { value: '75K+', label: 'nodes in the graph', labelPtBr: 'nodes no grafo' },
  { value: '120K+', label: 'relationships', labelPtBr: 'relações' },
  { value: '2.2M', label: 'classified corpus', labelPtBr: 'corpus classificado' },
  { value: '35+', label: 'MCP tools', labelPtBr: 'MCP tools' },
  { value: '50+', label: 'REST endpoints', labelPtBr: 'REST endpoints' },
  { value: '4', label: 'tribunals', labelPtBr: 'tribunais' },
];

export type CapabilityStatus = 'operational' | 'functional' | 'building';

export const capabilities = [
  { name: 'Knowledge Graph', namePtBr: 'Grafo de Conhecimento', status: 'operational' as CapabilityStatus },
  { name: 'Judge Intelligence', namePtBr: 'Inteligência Decisória', status: 'operational' as CapabilityStatus },
  { name: 'Graph-Led Search', namePtBr: 'Busca Graph-Led', status: 'functional' as CapabilityStatus },
  { name: 'Ingestion Pipeline', namePtBr: 'Pipeline de Ingestão', status: 'functional' as CapabilityStatus },
  { name: 'Structured Archive', namePtBr: 'Acervo Estruturado', status: 'building' as CapabilityStatus },
  { name: 'Legislative Resolution', namePtBr: 'Resolução Legislativa', status: 'building' as CapabilityStatus },
  { name: 'Doctrine', namePtBr: 'Doutrina', status: 'building' as CapabilityStatus },
];

export type MilestoneStatus = 'done' | 'in_progress' | 'planned';

export const milestones = [
  { name: 'Foundation', namePtBr: 'Fundação', status: 'in_progress' as MilestoneStatus },
  { name: 'Momento 360', namePtBr: 'Momento 360', status: 'planned' as MilestoneStatus },
  { name: 'Validation', namePtBr: 'Validação', status: 'planned' as MilestoneStatus },
  { name: 'Flywheel', namePtBr: 'Flywheel', status: 'planned' as MilestoneStatus },
  { name: 'Pitch', namePtBr: 'Pitch', status: 'planned' as MilestoneStatus },
];

export const navRoutes = [
  { label: 'Home', labelPtBr: 'Início', slug: '/' },
  { label: 'Silo', slug: '/silo' },
  { label: 'Architecture', labelPtBr: 'Arquitetura', slug: '/architecture' },
  { label: 'API', slug: '/api' },
  { label: 'Roadmap', slug: '/roadmap' },
  { label: 'About', labelPtBr: 'Sobre', slug: '/about' },
  { label: 'Contributing', labelPtBr: 'Contribuir', slug: '/contributing' },
  { label: 'Contact', labelPtBr: 'Contato', slug: '/contact' },
];
```

### Remove
- `projects.ts` inteiro (678 linhas)
- `homeProjectOrder`
- `ecosystemContent` (narrativa vai direto nas páginas)

### routes.ts
Substituir conteúdo por import de `navRoutes` do constants.ts. Manter
estrutura `RouteGroup[]` (Sidebar depende) com 2 grupos:
- **PRODUCT** (Silo, Architecture, API)
- **RESOURCES** (Roadmap, Contributing, Contact)
Home fica fora dos grupos (link fixo no topo do Sidebar).

---

## Componentes

### Remove
- `ProjectCard.astro` — não há mais projetos separados
- `ProjectRoadmapStatus.astro` — substitui por milestone

### Novo / Adapta
- `CapabilityCard.astro` — card de capacidade com cor de estado
- `MilestoneStatus.astro` — status de milestone do Silo
- `ProofPoints.astro` — grid de números (reusável entre home e /silo)

### Atualiza
- `Sidebar.astro` — importar navRoutes do constants.ts
- `Header.astro` — nav atualizado
- `Search.astro` — limpar referências a codenames
- `routes.ts` — nova estrutura simplificada

---

## Sequência de implementação (cutover order)

A ordem importa — deletar antes de criar quebra o build.

1. **Criar constants.ts** — novo data layer pequeno
2. **Criar /silo page** (EN + PT-BR) — nova página com conteúdo direto
3. **Criar componentes** — CapabilityCard, MilestoneStatus, ProofPoints
4. **Atualizar home** — novo hero, proof points, remover lista de projetos
5. **Atualizar routes.ts e nav** — Sidebar, Header, Search (trocar imports)
6. **Atualizar páginas restantes** — architecture, api, roadmap, about, contributing
   (limpar codenames, reframing pra Silo)
7. **Adicionar redirects** no vercel.json (ver matriz abaixo)
8. **Deletar páginas antigas** — projetos, use cases, api sub-pages
9. **Deletar projects.ts e componentes órfãos** — ProjectCard, ProjectRoadmapStatus
10. **Build check** — `npm run build` deve passar sem erros

---

## Redirect matrix (vercel.json)

301 redirects para todas as URLs antigas. Destino: /silo (página-hub) ou
/ (home) conforme contexto.

| Source (EN) | Source (PT-BR) | Destination | Code |
|---|---|---|---|
| /projects/valter | /silo | 301 |
| /projects/juca | /silo | 301 |
| /projects/leci | /silo | 301 |
| /projects/douto | /silo | 301 |
| /use-cases/search | /silo | 301 |
| /use-cases/verify | /silo | 301 |
| /use-cases/argument | /silo | 301 |
| /use-cases/case | /silo | 301 |
| /api/rest | /api | 301 |
| /api/mcp | /api | 301 |
| /pt-br/projects/valter | /pt-br/silo | 301 |
| /pt-br/projects/juca | /pt-br/silo | 301 |
| /pt-br/projects/leci | /pt-br/silo | 301 |
| /pt-br/projects/douto | /pt-br/silo | 301 |
| /pt-br/use-cases/search | /pt-br/silo | 301 |
| /pt-br/use-cases/verify | /pt-br/silo | 301 |
| /pt-br/use-cases/argument | /pt-br/silo | 301 |
| /pt-br/use-cases/case | /pt-br/silo | 301 |
| /pt-br/api/rest | /pt-br/api | 301 |
| /pt-br/api/mcp | /pt-br/api | 301 |

Nota: redirects no vercel.json usam formato
`{"source": "/old", "destination": "/new", "permanent": true}`.
Redirects são production-only — em `astro dev` local, URLs antigas darão 404
após deleção das páginas (esperado).

---

## Páginas removidas (10 EN + 10 PT-BR = 20 rotas)

- `/projects/valter` + PT-BR
- `/projects/juca` + PT-BR
- `/projects/leci` + PT-BR
- `/projects/douto` + PT-BR
- `/use-cases/search` + PT-BR
- `/use-cases/verify` + PT-BR
- `/use-cases/argument` + PT-BR
- `/use-cases/case` + PT-BR
- `/api/rest` + PT-BR (consolida em /api)
- `/api/mcp` + PT-BR (consolida em /api)

## Páginas mantidas sem alteração

- `/admin/waitlist` — admin page, mantém como está

---

## Páginas novas (1 EN + 1 PT-BR = 2 rotas)

- `/silo` + PT-BR

---

## Codename cleanup — páginas restantes

Todas as páginas que permanecem devem ter referências a codenames (Valter,
Juca, Leci, Douto) substituídas por nomes funcionais:

| Codename | Nome funcional (EN) | Nome funcional (PT-BR) |
|---|---|---|
| Valter | Core Engine / Knowledge Graph Engine | Motor de Grafo |
| Juca | Interface / Client Hub | Interface |
| Leci | Legislative Resolution | Resolução Legislativa |
| Douto | Doctrine Pipeline | Pipeline de Doutrina |
| BAU | Structured Archive | Acervo Estruturado |

Arquivos a verificar: architecture.astro, api.astro (novo), about.astro,
contributing.astro, Search.astro, Header.astro, Sidebar.astro.

---

## sites/ directory

Fora de escopo deste redesign. As pastas `sites/valter`, `sites/juca`,
`sites/leci`, `sites/douto` não fazem parte do portal Astro.

---

## Fora de escopo

- Redesign visual (CSS, cores, tipografia) — mantém estilo atual
- Landing page silo.legal — futuro
- Conteúdo do Juca (juca.sens.legal) — não afeta este site
- Mudanças no Linear ou nos repos dos codenames
- Atualização dos CLAUDE.md com seções "Conexão com Silo"
- sites/ directory (doc sites separados dos codenames)
- Auto-geração de números a partir de APIs de produção (futuro)
