// portal/src/data/constants.ts
//
// Shared content tokens used by /index.astro, the gated /inside data room,
// /inside/proof.astro, and /inside/roadmap.astro. Anything that lived here for
// the deleted DocsLayout (capabilities, navGroups) was removed when the layout
// went away.

export type InsideChapterNum = '01' | '02' | '03' | '04' | '05' | '06' | '07';

export type InsideChapterSlug =
  | 'thesis'
  | 'system'
  | 'proof'
  | 'depth'
  | 'decisions'
  | 'roadmap'
  | 'team';

export interface InsideChapter {
  num: InsideChapterNum;
  slug: InsideChapterSlug;
  title: string;
  summary: string;
  description: string;
  href: `/inside/${InsideChapterSlug}`;
  lastUpdated: string;
}

export const dataRoomUpdatedAt = '2026-04-08';
export const dataRoomLandingUpdatedAt = '2026-04-07';
export const dataRoomLandingDescription =
  "Silo's technical data room: seven chapters covering thesis, system architecture, production proof, and roadmap. Confidential reviewer access.";

export const insideChapters: InsideChapter[] = [
  {
    num: '01',
    slug: 'thesis',
    title: 'Thesis',
    summary: 'What we are building, in five minutes.',
    description: 'The core bet behind Silo: legal reasoning is structural, auditable, and more than vector retrieval.',
    href: '/inside/thesis',
    lastUpdated: '2026-04-08',
  },
  {
    num: '02',
    slug: 'system',
    title: 'System',
    summary: 'Architecture, data flow, the syllogism graph.',
    description: "The architecture behind Silo's case analysis agent, intelligence engine, document intelligence, legislative grounding, and evaluation layer.",
    href: '/inside/system',
    lastUpdated: '2026-04-08',
  },
  {
    num: '03',
    slug: 'proof',
    title: 'Proof',
    summary: 'What is running today — numbers, traces.',
    description: 'Current production evidence: live graph numbers, shipped surfaces, and a recorded case-analysis trace.',
    href: '/inside/proof',
    lastUpdated: '2026-04-08',
  },
  {
    num: '04',
    slug: 'depth',
    title: 'Depth',
    summary: 'Deep dives into the hard problems.',
    description: 'Technical deep dives into retrieval, document intelligence, MCP transport, and the hard parts of legal structure.',
    href: '/inside/depth',
    lastUpdated: '2026-04-08',
  },
  {
    num: '05',
    slug: 'decisions',
    title: 'Decisions',
    summary: 'ADRs, premortems, why we chose X.',
    description: 'Design decisions, ADR-style tradeoffs, premortems, and the constraints shaping Silo.',
    href: '/inside/decisions',
    lastUpdated: '2026-04-08',
  },
  {
    num: '06',
    slug: 'roadmap',
    title: 'Roadmap & Risks',
    summary: 'What is next; what could go wrong.',
    description: 'The next phases, adoption risks, kill criteria, and validation path for the product.',
    href: '/inside/roadmap',
    lastUpdated: '2026-04-08',
  },
  {
    num: '07',
    slug: 'team',
    title: 'Team & Velocity',
    summary: 'Who decides, how fast we ship.',
    description: 'The operating model, cadence, and boundary between agentic development and human legal judgment.',
    href: '/inside/team',
    lastUpdated: '2026-04-08',
  },
];

export interface ProofPoint {
  value: string;
  label: string;
  labelPtBr: string;
  source?: string;
}

export const proofPoints: ProofPoint[] = [
  {
    value: '86,522',
    label: 'nodes in the graph',
    labelPtBr: 'nodes no grafo',
    source: 'Neo4j Aura · verified Apr 2026',
  },
  {
    value: '133,404',
    label: 'relationships',
    labelPtBr: 'relacoes',
    source: 'Neo4j Aura · verified Apr 2026',
  },
  {
    value: '2.2M',
    label: 'LLM-classified decisions',
    labelPtBr: 'corpus classificado',
    source: 'corpus pool · TJPR + TJSP + TRF4',
  },
  {
    value: '45',
    label: 'MCP tools',
    labelPtBr: 'MCP tools',
    source: 'mcp remote · live',
  },
  {
    value: '57',
    label: 'REST endpoints',
    labelPtBr: 'REST endpoints',
    source: 'valter-api · live',
  },
  {
    value: '3',
    label: 'tribunals in graph',
    labelPtBr: 'tribunais',
    source: 'STJ · TJPR · TJSP',
  },
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
    description: 'Deepen the graph where the first wedge is real: corporate and M&A matters, cleaner signals, and more reliable structure at ingestion time.',
    descriptionPtBr: 'Densificacao dirigida do grafo de conhecimento no nicho societario/M&A.',
  },
  {
    name: 'Momento 360',
    namePtBr: 'Momento 360',
    status: 'planned',
    description: 'Ship the full case loop: diagnosis, assisted argumentation, and side-by-side comparison against a frontier-model-only workflow.',
    descriptionPtBr: 'Diagnostico de caso, fundamentacao assistida, validacao A/B Claude vs Claude+Silo.',
  },
  {
    name: 'Validation',
    namePtBr: 'Validacao',
    status: 'planned',
    description: 'Put the 360 workflow in front of an external lawyer on live matters and measure whether it changes speed, confidence, and output quality.',
    descriptionPtBr: 'Validar a experiencia 360 com advogada externa.',
  },
  {
    name: 'Flywheel',
    namePtBr: 'Flywheel',
    status: 'planned',
    description: 'Use real matters to learn where the graph is thin, where the agent stalls, and which additional structure improves the next case.',
    descriptionPtBr: 'Demonstrar o ciclo virtuoso com peticoes reais da validacao.',
  },
  {
    name: 'Pitch',
    namePtBr: 'Pitch',
    status: 'planned',
    description: 'Turn the technical and workflow evidence into a compact diligence pack for investors and partners.',
    descriptionPtBr: 'Evidence pack para investidores.',
  },
];
