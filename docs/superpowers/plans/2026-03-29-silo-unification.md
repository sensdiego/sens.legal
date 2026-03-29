# Silo Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the sens.legal documentation site from 16 pages (4 separate projects) into 8 pages describing one unified product called Silo.

**Architecture:** Static Astro site. Replace `projects.ts` (678 lines) with a small `constants.ts` (~80 lines) for shared data. Page content moves inline into each `.astro` file. Three new components (ProofPoints, CapabilityCard, MilestoneStatus). Vercel 301 redirects for old URLs.

**Tech Stack:** Astro, TypeScript, Vercel

**Spec:** `docs/superpowers/specs/2026-03-29-silo-unification-redesign.md`

---

## File Map

### Create
- `portal/src/data/constants.ts` — shared proof points, capabilities, milestones, nav routes
- `portal/src/components/ProofPoints.astro` — grid of proof point badges (reused on home + /silo)
- `portal/src/components/CapabilityCard.astro` — capability card with status color
- `portal/src/components/MilestoneStatus.astro` — milestone badge with status
- `portal/src/pages/silo.astro` — EN hub page
- `portal/src/pages/pt-br/silo.astro` — PT-BR hub page

### Modify
- `portal/src/data/routes.ts` — new nav structure (2 groups: PRODUCT, RESOURCES)
- `portal/src/components/Header.astro` — update nav links (remove Projects/Use Cases)
- `portal/src/components/Search.astro` — remove codename external doc links
- `portal/src/components/Sidebar.astro` — no structural changes (consumes routes.ts)
- `portal/src/pages/index.astro` — new Silo home (EN)
- `portal/src/pages/pt-br/index.astro` — new Silo home (PT-BR)
- `portal/src/pages/architecture.astro` — replace codenames with functional names
- `portal/src/pages/pt-br/architecture.astro` — same
- `portal/src/pages/roadmap.astro` — milestones, no issue IDs
- `portal/src/pages/pt-br/roadmap.astro` — same
- `portal/src/pages/about.astro` — reframe to Silo
- `portal/src/pages/pt-br/about.astro` — same
- `portal/src/pages/contributing.astro` — reframe to Silo
- `portal/src/pages/pt-br/contributing.astro` — same
- `portal/src/pages/api/index.astro` — new consolidated thin hub (replaces rest.astro + mcp.astro)
- `portal/src/pages/pt-br/api/index.astro` — same PT-BR
- `vercel.json` — add 20 redirect rules

### Delete
- `portal/src/data/projects.ts`
- `portal/src/components/ProjectCard.astro`
- `portal/src/components/ProjectRoadmapStatus.astro`
- `portal/src/pages/projects/valter.astro` + PT-BR
- `portal/src/pages/projects/juca.astro` + PT-BR
- `portal/src/pages/projects/leci.astro` + PT-BR
- `portal/src/pages/projects/douto.astro` + PT-BR
- `portal/src/pages/use-cases/search.astro` + PT-BR
- `portal/src/pages/use-cases/verify.astro` + PT-BR
- `portal/src/pages/use-cases/argument.astro` + PT-BR
- `portal/src/pages/use-cases/case.astro` + PT-BR
- `portal/src/pages/api/rest.astro` + PT-BR
- `portal/src/pages/api/mcp.astro` + PT-BR

---

### Task 1: Create constants.ts

**Files:**
- Create: `portal/src/data/constants.ts`

- [ ] **Step 1: Create the shared data file**

```typescript
// portal/src/data/constants.ts

export const lastUpdated = '2026-03-29';

export interface ProofPoint {
  value: string;
  label: string;
  labelPtBr: string;
}

export const proofPoints: ProofPoint[] = [
  { value: '75K+', label: 'nodes in the graph', labelPtBr: 'nodes no grafo' },
  { value: '120K+', label: 'relationships', labelPtBr: 'relacoes' },
  { value: '2.2M', label: 'classified corpus', labelPtBr: 'corpus classificado' },
  { value: '35+', label: 'MCP tools', labelPtBr: 'MCP tools' },
  { value: '50+', label: 'REST endpoints', labelPtBr: 'REST endpoints' },
  { value: '4', label: 'tribunals', labelPtBr: 'tribunais' },
];

export type CapabilityStatus = 'operational' | 'functional' | 'building';

export interface Capability {
  id: string;
  name: string;
  namePtBr: string;
  status: CapabilityStatus;
}

export const capabilities: Capability[] = [
  { id: 'graph', name: 'Knowledge Graph', namePtBr: 'Grafo de Conhecimento', status: 'operational' },
  { id: 'judge-intelligence', name: 'Judge Intelligence', namePtBr: 'Inteligencia Decisoria', status: 'operational' },
  { id: 'search', name: 'Graph-Led Search', namePtBr: 'Busca Graph-Led', status: 'functional' },
  { id: 'pipeline', name: 'Ingestion Pipeline', namePtBr: 'Pipeline de Ingestao', status: 'functional' },
  { id: 'archive', name: 'Structured Archive', namePtBr: 'Acervo Estruturado', status: 'building' },
  { id: 'legislation', name: 'Legislative Resolution', namePtBr: 'Resolucao Legislativa', status: 'building' },
  { id: 'doctrine', name: 'Doctrine', namePtBr: 'Doutrina', status: 'building' },
];

export type MilestoneStatus = 'done' | 'in_progress' | 'planned';

export interface Milestone {
  name: string;
  namePtBr: string;
  status: MilestoneStatus;
  description: string;
  descriptionPtBr: string;
}

export const milestones: Milestone[] = [
  {
    name: 'Foundation',
    namePtBr: 'Fundacao',
    status: 'in_progress',
    description: 'Directed densification of the knowledge graph in the corporate/M&A niche.',
    descriptionPtBr: 'Densificacao dirigida do grafo de conhecimento no nicho societario/M&A.',
  },
  {
    name: 'Momento 360',
    namePtBr: 'Momento 360',
    status: 'planned',
    description: 'Case diagnosis, assisted argumentation, A/B validation Claude vs Claude+Silo.',
    descriptionPtBr: 'Diagnostico de caso, fundamentacao assistida, validacao A/B Claude vs Claude+Silo.',
  },
  {
    name: 'Validation',
    namePtBr: 'Validacao',
    status: 'planned',
    description: 'Validate the 360 experience with an external lawyer.',
    descriptionPtBr: 'Validar a experiencia 360 com advogada externa.',
  },
  {
    name: 'Flywheel',
    namePtBr: 'Flywheel',
    status: 'planned',
    description: 'Demonstrate the virtuous cycle with real petitions from the validation.',
    descriptionPtBr: 'Demonstrar o ciclo virtuoso com peticoes reais da validacao.',
  },
  {
    name: 'Pitch',
    namePtBr: 'Pitch',
    status: 'planned',
    description: 'Evidence pack for investors.',
    descriptionPtBr: 'Evidence pack para investidores.',
  },
];

export interface NavRoute {
  label: string;
  labelPtBr?: string;
  slug: string;
}

export interface NavGroup {
  title: string;
  titlePtBr: string;
  items: NavRoute[];
}

export const navGroups: NavGroup[] = [
  {
    title: 'PRODUCT',
    titlePtBr: 'PRODUTO',
    items: [
      { label: 'Home', labelPtBr: 'Inicio', slug: '/' },
      { label: 'Silo', slug: '/silo' },
      { label: 'Architecture', labelPtBr: 'Arquitetura', slug: '/architecture' },
      { label: 'API', slug: '/api' },
    ],
  },
  {
    title: 'RESOURCES',
    titlePtBr: 'RECURSOS',
    items: [
      { label: 'Roadmap', slug: '/roadmap' },
      { label: 'Contributing', labelPtBr: 'Contribuir', slug: '/contributing' },
      { label: 'Contact', labelPtBr: 'Contato', slug: '/contact' },
      { label: 'About', labelPtBr: 'Sobre', slug: '/about' },
    ],
  },
];
```

- [ ] **Step 2: Verify typecheck**

Run: `cd portal && npx tsc --noEmit`
Expected: PASS (new file, no consumers yet)

- [ ] **Step 3: Commit**

```bash
git add portal/src/data/constants.ts
git commit -m "feat(portal): add constants.ts for Silo unified data layer"
```

---

### Task 2: Update routes.ts and nav components

**Files:**
- Modify: `portal/src/data/routes.ts`
- Modify: `portal/src/components/Header.astro`
- Modify: `portal/src/components/Search.astro`

- [ ] **Step 1: Replace routes.ts content**

Replace the entire file with:

```typescript
// portal/src/data/routes.ts
import { navGroups } from './constants';

// Re-export for backward compatibility with Sidebar.astro
export type { NavGroup as RouteGroup, NavRoute as RouteItem } from './constants';
export const routes = navGroups;
```

- [ ] **Step 2: Update Header.astro nav links**

Replace lines 25-29 in `portal/src/components/Header.astro`:

```astro
    <nav class="header-nav">
      <a href={`${prefix}/silo`}>Silo</a>
      <a href={`${prefix}/architecture`}>{lang === 'pt-br' ? 'Arquitetura' : 'Architecture'}</a>
      <a href={`${prefix}/about`}>{lang === 'pt-br' ? 'Sobre' : 'About'}</a>
    </nav>
```

- [ ] **Step 3: Update Search.astro external docs**

Replace lines 21-25 in `portal/src/components/Search.astro`:

```typescript
const externalDocs = [
  { label: 'Engine Docs', group: 'EXTERNAL', href: 'https://valter.sens.legal' },
  { label: 'Interface Docs', group: 'EXTERNAL', href: 'https://juca.sens.legal' },
  { label: 'Legislation Docs', group: 'EXTERNAL', href: 'https://leci.sens.legal' },
];
```

- [ ] **Step 4: Verify build**

Run: `cd portal && npm run build`
Expected: Build succeeds. Sidebar now shows PRODUCT + RESOURCES groups instead of PROJECTS + USE CASES.

- [ ] **Step 5: Commit**

```bash
git add portal/src/data/routes.ts portal/src/components/Header.astro portal/src/components/Search.astro
git commit -m "feat(portal): update nav to Silo structure — remove project/use-case groups"
```

---

### Task 3: Create shared components

**Files:**
- Create: `portal/src/components/ProofPoints.astro`
- Create: `portal/src/components/CapabilityCard.astro`
- Create: `portal/src/components/MilestoneStatus.astro`

- [ ] **Step 1: Create ProofPoints.astro**

```astro
---
import { proofPoints } from '../data/constants';

interface Props {
  lang?: 'en' | 'pt-br';
}

const { lang = 'en' } = Astro.props;
---

<div class="proof-points">
  {proofPoints.map((p) => (
    <span>{p.value} {lang === 'pt-br' ? p.labelPtBr : p.label}</span>
  ))}
</div>

<style>
  .proof-points {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm) var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .proof-points span {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    letter-spacing: 0.02em;
  }
</style>
```

- [ ] **Step 2: Create CapabilityCard.astro**

```astro
---
import type { CapabilityStatus } from '../data/constants';

interface Props {
  name: string;
  status: CapabilityStatus;
  id: string;
}

const { name, status, id } = Astro.props;

const statusColors: Record<CapabilityStatus, string> = {
  operational: 'var(--color-green, #4caf50)',
  functional: 'var(--color-blue, #2196f3)',
  building: 'var(--color-orange, #ff9800)',
};

const statusLabels: Record<CapabilityStatus, string> = {
  operational: 'Operational',
  functional: 'Functional',
  building: 'Building',
};
---

<div class="capability-card" id={id}>
  <div class="capability-header">
    <h3 class="capability-name">{name}</h3>
    <span class="capability-badge" style={`background: ${statusColors[status]}20; color: ${statusColors[status]}; border-color: ${statusColors[status]}40;`}>
      {statusLabels[status]}
    </span>
  </div>
  <div class="capability-body">
    <slot />
  </div>
</div>

<style>
  .capability-card {
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: var(--space-lg);
    margin-bottom: var(--space-md);
  }

  .capability-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .capability-name {
    font-size: 1rem;
    margin: 0;
  }

  .capability-badge {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
    border: 1px solid;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .capability-body {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .capability-body :global(p) {
    margin: 0;
  }
</style>
```

- [ ] **Step 3: Create MilestoneStatus.astro**

```astro
---
import type { Milestone } from '../data/constants';

interface Props {
  milestones: Milestone[];
  lang?: 'en' | 'pt-br';
}

const { milestones, lang = 'en' } = Astro.props;

const statusIcons: Record<string, string> = {
  done: '●',
  in_progress: '◐',
  planned: '○',
};

const statusLabels: Record<string, Record<string, string>> = {
  en: { done: 'Done', in_progress: 'In progress', planned: 'Planned' },
  'pt-br': { done: 'Concluido', in_progress: 'Em andamento', planned: 'Planejado' },
};
---

<div class="milestone-list">
  {milestones.map((m, i) => (
    <div class="milestone-item">
      <div class="milestone-indicator">
        <span class={`milestone-icon milestone-${m.status}`}>{statusIcons[m.status]}</span>
        {i < milestones.length - 1 && <div class="milestone-line" />}
      </div>
      <div class="milestone-content">
        <div class="milestone-header">
          <strong>{lang === 'pt-br' ? m.namePtBr : m.name}</strong>
          <span class="milestone-status">{statusLabels[lang][m.status]}</span>
        </div>
        <p class="milestone-desc">{lang === 'pt-br' ? m.descriptionPtBr : m.description}</p>
      </div>
    </div>
  ))}
</div>

<style>
  .milestone-list {
    display: flex;
    flex-direction: column;
  }

  .milestone-item {
    display: flex;
    gap: var(--space-md);
  }

  .milestone-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 1.5rem;
  }

  .milestone-icon {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .milestone-done { color: var(--color-green, #4caf50); }
  .milestone-in_progress { color: var(--color-blue, #2196f3); }
  .milestone-planned { color: var(--color-text-muted); }

  .milestone-line {
    width: 2px;
    flex: 1;
    background: var(--color-border);
    min-height: 1.5rem;
  }

  .milestone-content {
    padding-bottom: var(--space-md);
  }

  .milestone-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .milestone-status {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .milestone-desc {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: var(--space-xs) 0 0;
  }
</style>
```

- [ ] **Step 4: Verify build**

Run: `cd portal && npm run build`
Expected: PASS (new components, no consumers yet)

- [ ] **Step 5: Commit**

```bash
git add portal/src/components/ProofPoints.astro portal/src/components/CapabilityCard.astro portal/src/components/MilestoneStatus.astro
git commit -m "feat(portal): add ProofPoints, CapabilityCard, MilestoneStatus components"
```

---

### Task 4: Create /silo page (EN + PT-BR)

**Files:**
- Create: `portal/src/pages/silo.astro`
- Create: `portal/src/pages/pt-br/silo.astro`

- [ ] **Step 1: Create EN silo page**

Create `portal/src/pages/silo.astro`. This is the largest new file. Content inline, imports capabilities from constants for the mini-nav and cards.

The page structure:
1. Mini-nav (anchor links to each capability)
2. The Problem section
3. What is Silo section
4. Numbers grid (ProofPoints component)
5. 7 CapabilityCards with detailed inline descriptions

```astro
---
import DocsLayout from '../layouts/DocsLayout.astro';
import ProofPoints from '../components/ProofPoints.astro';
import CapabilityCard from '../components/CapabilityCard.astro';
import { capabilities } from '../data/constants';
---

<DocsLayout title="Silo" description="Traceable legal intelligence infrastructure — product hub.">
  <h1>Silo</h1>

  <nav class="mini-nav">
    {capabilities.map((c) => (
      <a href={`#${c.id}`}>{c.name}</a>
    ))}
  </nav>

  <hr />

  <h2>The problem</h2>
  <p>
    Frontier models hallucinate citations, miss relationships between decisions,
    and offer no audit trail. Lawyers cannot trust answers without evidence.
  </p>

  <h2>What is Silo</h2>
  <p>
    A 360-degree legal knowledge graph that materializes the legal syllogism
    (major premise + minor premise = conclusion) into a navigable data structure.
    It empowers LLMs with structured, relational, and verifiable data about how
    courts decide.
  </p>

  <h2>Numbers</h2>
  <ProofPoints lang="en" />
  <p class="detail-numbers">
    Neo4j Aura, schema v2.1, 9 labels, 15 edge types.
    6K+ SAME_AS edges (cross-tribunal entity resolution).
    Corpus: STJ, TJPR, TJSP, TRF4.
  </p>

  <hr />

  <h2>Capabilities</h2>

  <CapabilityCard name="Knowledge Graph" status="operational" id="graph">
    <p>
      Neo4j Aura. 9 labels, 15 relationship types. The Subsumption node
      materializes the legal syllogism. Cross-tribunal entity resolution
      (SAME_AS). Schema v2.1.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Judge Intelligence" status="operational" id="judge-intelligence">
    <p>
      How each minister decides by topic. Catalog of decision profiles,
      cross-judge comparison, profile-to-argumentation conversion.
      First product with real usage.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Graph-Led Search" status="functional" id="search">
    <p>
      Neo4j as the primary source, semantic search as fallback.
      Cross-encoder reranking. Filters by minister, tribunal, date, outcome.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Ingestion Pipeline" status="functional" id="pipeline">
    <p>
      v2.2, 12 stages: ingestion, segmentation, metadata (LLM), normative
      analysis, factual analysis, canonicalization (regex + embedding +
      cross-tribunal), Neo4j load. Cross-stage coherence with 4 checks.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Structured Archive" status="building" id="archive">
    <p>
      Agent-friendly layer over petitions. Citation extraction, pipeline
      prioritization by real lawyer demand. CNJ normalization operational.
      LLM layer pending validation (GATE).
    </p>
  </CapabilityCard>

  <CapabilityCard name="Legislative Resolution" status="building" id="legislation">
    <p>
      Legal reference to canonical ID. Citation parser, alias registry (19 laws),
      bulk resolution with temporal override. 322 tests, 0 failures.
      3 laws in the database (CF, CC, CPC). Local only.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Doctrine" status="building" id="doctrine">
    <p>
      Local pipeline: legal books to chunks to embeddings to CLI search.
      Focus on contract law and civil procedure. Internal supplier for the
      engine. Pre-release.
    </p>
  </CapabilityCard>
</DocsLayout>

<style>
  .mini-nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .mini-nav a {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 3px;
  }

  .mini-nav a:hover {
    color: var(--color-text);
    border-color: var(--color-border-active);
  }

  .detail-numbers {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 2: Create PT-BR silo page**

Create `portal/src/pages/pt-br/silo.astro`. Same structure, Portuguese content:

```astro
---
import DocsLayout from '../../layouts/DocsLayout.astro';
import ProofPoints from '../../components/ProofPoints.astro';
import CapabilityCard from '../../components/CapabilityCard.astro';
import { capabilities } from '../../data/constants';
---

<DocsLayout title="Silo" description="Infraestrutura de inteligencia juridica rastreavel — hub do produto." lang="pt-br">
  <h1>Silo</h1>

  <nav class="mini-nav">
    {capabilities.map((c) => (
      <a href={`#${c.id}`}>{c.namePtBr}</a>
    ))}
  </nav>

  <hr />

  <h2>O problema</h2>
  <p>
    Modelos de fronteira alucinam citacoes, perdem relacoes entre decisoes,
    e nao oferecem trilha de auditoria. Advogados nao podem confiar em
    respostas sem evidencia.
  </p>

  <h2>O que e o Silo</h2>
  <p>
    Grafo de conhecimento juridico 360 graus que materializa o silogismo
    juridico (premissa maior + menor = conclusao) em estrutura de dados
    navegavel. Potencializa LLMs com dados estruturados, relacionais e
    verificaveis sobre como tribunais decidem.
  </p>

  <h2>Numeros</h2>
  <ProofPoints lang="pt-br" />
  <p class="detail-numbers">
    Neo4j Aura, schema v2.1, 9 labels, 15 tipos de relacao.
    6K+ SAME_AS edges (entity resolution cross-tribunal).
    Corpus: STJ, TJPR, TJSP, TRF4.
  </p>

  <hr />

  <h2>Capacidades</h2>

  <CapabilityCard name="Grafo de Conhecimento" status="operational" id="graph">
    <p>
      Neo4j Aura. 9 labels, 15 tipos de relacao. O no de Subsuncao materializa
      o silogismo juridico. Entity resolution cross-tribunal (SAME_AS). Schema v2.1.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Inteligencia Decisoria" status="operational" id="judge-intelligence">
    <p>
      Como cada ministro decide por tema. Catalogo de recortes, comparacao entre
      julgadores, conversao de perfil em argumentacao. Primeiro produto com uso real.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Busca Graph-Led" status="functional" id="search">
    <p>
      Neo4j como fonte primaria, busca semantica como fallback.
      Cross-encoder reranking. Filtros por ministro, tribunal, data, resultado.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Pipeline de Ingestao" status="functional" id="pipeline">
    <p>
      v2.2, 12 estagios: ingestao, segmentacao, metadados (LLM), analise
      normativa, analise fatica, canonicalizacao (regex + embedding +
      cross-tribunal), carga Neo4j. Coerencia cross-stage com 4 checks.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Acervo Estruturado" status="building" id="archive">
    <p>
      Camada agent-friendly sobre peticoes. Extracao de citacoes, priorizacao
      de pipeline por demanda real de advogados. Normalizacao CNJ operacional.
      Camada LLM pendente de validacao (GATE).
    </p>
  </CapabilityCard>

  <CapabilityCard name="Resolucao Legislativa" status="building" id="legislation">
    <p>
      Referencia legal para ID canonico. Parser de citacoes, alias registry
      (19 leis), bulk resolution com temporal override. 322 testes, 0 falhas.
      3 leis no banco (CF, CC, CPC). Roda local apenas.
    </p>
  </CapabilityCard>

  <CapabilityCard name="Doutrina" status="building" id="doctrine">
    <p>
      Pipeline local: livros juridicos para chunks para embeddings para busca CLI.
      Foco em contratos e processo civil. Fornecedor interno do motor. Pre-release.
    </p>
  </CapabilityCard>
</DocsLayout>

<style>
  .mini-nav {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .mini-nav a {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 3px;
  }

  .mini-nav a:hover {
    color: var(--color-text);
    border-color: var(--color-border-active);
  }

  .detail-numbers {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 3: Verify build**

Run: `cd portal && npm run build`
Expected: PASS. New /silo and /pt-br/silo routes.

- [ ] **Step 4: Commit**

```bash
git add portal/src/pages/silo.astro portal/src/pages/pt-br/silo.astro
git commit -m "feat(portal): add /silo product hub page (EN + PT-BR)"
```

---

### Task 5: Rewrite home pages

**Files:**
- Modify: `portal/src/pages/index.astro`
- Modify: `portal/src/pages/pt-br/index.astro`

- [ ] **Step 1: Rewrite EN home**

Replace entire content of `portal/src/pages/index.astro` with new Silo home. Key changes: remove projects.ts import, remove project cards, remove Mermaid diagram, add ProofPoints component, add Silo branding.

The new file keeps the waitlist form and its scripts. Removes all `projects` and `ecosystemContent` references.

Read the current file for the full waitlist script + styles (lines 133-320) and preserve them exactly. Replace lines 1-131 with the new Silo content using ProofPoints component and inline capability preview.

- [ ] **Step 2: Rewrite PT-BR home**

Same changes to `portal/src/pages/pt-br/index.astro`. Mirror structure with Portuguese copy, `../../` relative imports.

- [ ] **Step 3: Verify build**

Run: `cd portal && npm run build`
Expected: PASS. Home no longer imports from projects.ts.

- [ ] **Step 4: Commit**

```bash
git add portal/src/pages/index.astro portal/src/pages/pt-br/index.astro
git commit -m "feat(portal): rewrite home as Silo product page — honest numbers, no project cards"
```

---

### Task 6: Update remaining pages (architecture, api, roadmap, about, contributing)

**Files:**
- Modify: `portal/src/pages/architecture.astro` + PT-BR
- Create: `portal/src/pages/api/index.astro` + PT-BR (thin hub replacing rest.astro + mcp.astro)
- Modify: `portal/src/pages/roadmap.astro` + PT-BR
- Modify: `portal/src/pages/about.astro` + PT-BR
- Modify: `portal/src/pages/contributing.astro` + PT-BR

- [ ] **Step 1: Update architecture pages**

Read current `architecture.astro`. Replace all codenames:
- "Valter" → "Core Engine" (EN) / "Motor de Grafo" (PT-BR)
- "Juca" → "Interface" / "Interface"
- "Leci" → "Legislative Resolution" / "Resolucao Legislativa"
- "Douto" → "Doctrine Pipeline" / "Pipeline de Doutrina"

Update Mermaid diagram labels if present. Replace "Valter-owned stores" with "Silo stores".

- [ ] **Step 2: Create new /api thin hub pages**

Create `portal/src/pages/api/index.astro` as thin hub with overview + links to canonical docs. No endpoint/tool counts. Links to `https://valter.sens.legal` (engine docs) and `https://juca.sens.legal` (interface docs).

Create matching `portal/src/pages/pt-br/api/index.astro`.

- [ ] **Step 3: Update roadmap pages**

Replace current roadmap (4 project cards with stages) with milestone list using MilestoneStatus component. Import milestones from constants.ts. No issue IDs.

- [ ] **Step 4: Update about pages**

Change "ecosystem of four projects" framing to "Silo infrastructure". Replace codename references with functional names. Keep Diego's bio, OAB, vision.

- [ ] **Step 5: Update contributing pages**

Change "contribute to individual projects" to "contribute to Silo". Remove per-project contribution sections.

- [ ] **Step 6: Verify build**

Run: `cd portal && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add portal/src/pages/architecture.astro portal/src/pages/pt-br/architecture.astro \
  portal/src/pages/api/index.astro portal/src/pages/pt-br/api/index.astro \
  portal/src/pages/roadmap.astro portal/src/pages/pt-br/roadmap.astro \
  portal/src/pages/about.astro portal/src/pages/pt-br/about.astro \
  portal/src/pages/contributing.astro portal/src/pages/pt-br/contributing.astro
git commit -m "feat(portal): update remaining pages — codename cleanup, Silo framing, milestone roadmap"
```

---

### Task 7: Add Vercel redirects

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add redirects to vercel.json**

Replace `vercel.json` content:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "redirects": [
    { "source": "/projects/valter", "destination": "/silo", "permanent": true },
    { "source": "/projects/juca", "destination": "/silo", "permanent": true },
    { "source": "/projects/leci", "destination": "/silo", "permanent": true },
    { "source": "/projects/douto", "destination": "/silo", "permanent": true },
    { "source": "/use-cases/search", "destination": "/silo", "permanent": true },
    { "source": "/use-cases/verify", "destination": "/silo", "permanent": true },
    { "source": "/use-cases/argument", "destination": "/silo", "permanent": true },
    { "source": "/use-cases/case", "destination": "/silo", "permanent": true },
    { "source": "/api/rest", "destination": "/api", "permanent": true },
    { "source": "/api/mcp", "destination": "/api", "permanent": true },
    { "source": "/pt-br/projects/valter", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/projects/juca", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/projects/leci", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/projects/douto", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/use-cases/search", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/use-cases/verify", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/use-cases/argument", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/use-cases/case", "destination": "/pt-br/silo", "permanent": true },
    { "source": "/pt-br/api/rest", "destination": "/pt-br/api", "permanent": true },
    { "source": "/pt-br/api/mcp", "destination": "/pt-br/api", "permanent": true }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat(portal): add 301 redirects for old project/use-case/api URLs"
```

---

### Task 8: Delete old pages and data

**Files:**
- Delete: 10 EN page files + 10 PT-BR mirrors (20 files)
- Delete: `portal/src/data/projects.ts`
- Delete: `portal/src/components/ProjectCard.astro`
- Delete: `portal/src/components/ProjectRoadmapStatus.astro`

- [ ] **Step 1: Delete old project pages**

```bash
rm portal/src/pages/projects/valter.astro portal/src/pages/projects/juca.astro \
   portal/src/pages/projects/leci.astro portal/src/pages/projects/douto.astro
rm portal/src/pages/pt-br/projects/valter.astro portal/src/pages/pt-br/projects/juca.astro \
   portal/src/pages/pt-br/projects/leci.astro portal/src/pages/pt-br/projects/douto.astro
```

- [ ] **Step 2: Delete old use-case pages**

```bash
rm portal/src/pages/use-cases/search.astro portal/src/pages/use-cases/verify.astro \
   portal/src/pages/use-cases/argument.astro portal/src/pages/use-cases/case.astro
rm portal/src/pages/pt-br/use-cases/search.astro portal/src/pages/pt-br/use-cases/verify.astro \
   portal/src/pages/pt-br/use-cases/argument.astro portal/src/pages/pt-br/use-cases/case.astro
```

- [ ] **Step 3: Delete old api sub-pages**

```bash
rm portal/src/pages/api/rest.astro portal/src/pages/api/mcp.astro
rm portal/src/pages/pt-br/api/rest.astro portal/src/pages/pt-br/api/mcp.astro
```

- [ ] **Step 4: Delete old data and components**

```bash
rm portal/src/data/projects.ts
rm portal/src/components/ProjectCard.astro portal/src/components/ProjectRoadmapStatus.astro
```

- [ ] **Step 5: Verify build**

Run: `cd portal && npm run build`
Expected: PASS. No remaining imports from deleted files.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(portal): delete old project/use-case/api pages, projects.ts, and orphan components"
```

---

### Task 9: Final verification

- [ ] **Step 1: Full build check**

Run: `cd portal && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 2: Typecheck**

Run: `cd portal && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Count output routes**

Run: `ls portal/dist/ -R | grep index.html | wc -l`
Expected: ~16 routes (8 EN + 8 PT-BR). No project/use-case routes.

- [ ] **Step 4: Verify no codenames in output**

Run: `grep -r "Valter\|Juca\|Leci\|Douto" portal/dist/ --include="*.html" -l`
Expected: No results (or only in external doc links which are acceptable).

- [ ] **Step 5: Local preview**

Run: `cd portal && npm run dev`
Open: http://localhost:4321
Verify: Home shows Silo branding, /silo page loads with 7 capabilities, sidebar shows PRODUCT + RESOURCES groups.
