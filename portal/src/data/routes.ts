export interface RouteItem {
  label: string;
  labelPtBr?: string;
  slug: string;
}

export interface RouteGroup {
  title: string;
  titlePtBr?: string;
  items: RouteItem[];
}

export const routes: RouteGroup[] = [
  {
    title: 'GETTING STARTED',
    titlePtBr: 'PRIMEIROS PASSOS',
    items: [
      { label: 'Home', labelPtBr: 'Inicio', slug: '/' },
      { label: 'About', labelPtBr: 'Sobre', slug: '/about' },
      { label: 'Architecture', labelPtBr: 'Arquitetura', slug: '/architecture' },
    ],
  },
  {
    title: 'PROJECTS',
    titlePtBr: 'PROJETOS',
    items: [
      { label: 'Valter', slug: '/projects/valter' },
      { label: 'Juca', slug: '/projects/juca' },
      { label: 'Leci', slug: '/projects/leci' },
      { label: 'Douto', slug: '/projects/douto' },
    ],
  },
  {
    title: 'USE CASES',
    titlePtBr: 'CASOS DE USO',
    items: [
      { label: 'Semantic Search', labelPtBr: 'Busca Semantica', slug: '/use-cases/search' },
      { label: 'Verify Claims', labelPtBr: 'Verificar Alegacoes', slug: '/use-cases/verify' },
      { label: 'Optimal Argument', labelPtBr: 'Melhor Argumento', slug: '/use-cases/argument' },
      { label: 'Case Analysis', labelPtBr: 'Analise de Processo', slug: '/use-cases/case' },
    ],
  },
  {
    title: 'API REFERENCE',
    titlePtBr: 'REFERENCIA API',
    items: [
      { label: 'REST API', slug: '/api/rest' },
      { label: 'MCP Tools', labelPtBr: 'Tools MCP', slug: '/api/mcp' },
    ],
  },
  {
    title: 'RESOURCES',
    titlePtBr: 'RECURSOS',
    items: [
      { label: 'Roadmap', slug: '/roadmap' },
      { label: 'Contributing', labelPtBr: 'Contribuir', slug: '/contributing' },
      { label: 'Contact', labelPtBr: 'Contato', slug: '/contact' },
    ],
  },
];
