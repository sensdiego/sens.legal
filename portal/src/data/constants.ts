// portal/src/data/constants.ts
//
// Shared content tokens used by /index.astro, /inside/proof.astro, and
// /inside/roadmap.astro. Anything that lived here for the deleted DocsLayout
// (capabilities, navGroups, lastUpdated) was removed when the layout went away.

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
