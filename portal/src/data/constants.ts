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
