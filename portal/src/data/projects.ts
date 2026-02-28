export interface Project {
  name: string;
  subdomain: string;
  description: string;
  descriptionPtBr: string;
  repo: string;
  status: 'alpha' | 'beta' | 'stable';
  stack: string[];
  docsUrl: string;
  llms_txt_url: string;
}

export const projects: Project[] = [
  {
    name: 'Valter',
    subdomain: 'valter',
    description: 'Legal knowledge backend — Brazilian STJ jurisprudence served via REST API and Model Context Protocol (MCP).',
    descriptionPtBr: 'Backend de conhecimento juridico — jurisprudencia do STJ servida via REST API e Model Context Protocol (MCP).',
    repo: 'https://github.com/sensdiego/Valter',
    status: 'alpha',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Qdrant', 'Neo4j', 'Redis'],
    docsUrl: 'https://valter.sens.legal',
    llms_txt_url: 'https://valter.sens.legal/llms.txt',
  },
  {
    name: 'Juca',
    subdomain: 'juca',
    description: 'Frontend for lawyers — the interface through which legal professionals interact with the ecosystem.',
    descriptionPtBr: 'Frontend para advogados — a interface pela qual profissionais do direito interagem com o ecossistema.',
    repo: 'https://github.com/sensdiego/juca',
    status: 'alpha',
    stack: ['Next.js', 'React', 'TypeScript'],
    docsUrl: 'https://juca.sens.legal',
    llms_txt_url: 'https://juca.sens.legal/llms.txt',
  },
  {
    name: 'Leci',
    subdomain: 'leci',
    description: 'Legislation backend — Brazilian statutes and regulations as a complementary data source.',
    descriptionPtBr: 'Backend de legislacao — estatutos e normas brasileiras como fonte de dados complementar.',
    repo: 'https://github.com/sensdiego/leci',
    status: 'alpha',
    stack: ['Astro', 'Starlight', 'TypeScript'],
    docsUrl: 'https://leci.sens.legal',
    llms_txt_url: 'https://leci.sens.legal/llms.txt',
  },
];
