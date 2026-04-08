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
