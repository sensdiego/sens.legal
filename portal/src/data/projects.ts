export interface Project {
  name: string;
  subdomain: string;
  description: string;
  descriptionPtBr: string;
  repo: string;
  status: 'dev' | 'alpha' | 'beta' | 'stable';
  stack: string[];
  docsUrl: string;
  llms_txt_url: string;
}

export const projects: Project[] = [
  {
    name: 'Valter',
    subdomain: 'valter',
    description: 'Jurisprudence backend — STJ decisions indexed through hybrid search, knowledge graph, REST API, and MCP.',
    descriptionPtBr: 'Backend de jurisprudencia — decisoes do STJ indexadas via busca hibrida, knowledge graph, REST API e MCP.',
    repo: 'https://github.com/sensdiego/Valter',
    status: 'dev',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Qdrant', 'Neo4j', 'Redis'],
    docsUrl: 'https://valter.sens.legal',
    llms_txt_url: 'https://valter.sens.legal/llms.txt',
  },
  {
    name: 'Juca',
    subdomain: 'juca',
    description: 'Lawyer interface — progressive legal briefing connected to the full ecosystem via API and MCP.',
    descriptionPtBr: 'Interface para advogados — briefing juridico progressivo conectado ao ecossistema via API e MCP.',
    repo: 'https://github.com/sensdiego/juca',
    status: 'dev',
    stack: ['Next.js', 'React', 'TypeScript'],
    docsUrl: 'https://juca.sens.legal',
    llms_txt_url: 'https://juca.sens.legal/llms.txt',
  },
  {
    name: 'Leci',
    subdomain: 'leci',
    description: 'Legislation backend — federal statutes, regulations, and normative acts as structured data.',
    descriptionPtBr: 'Backend de legislacao — leis, regulamentos e atos normativos federais como dados estruturados.',
    repo: 'https://github.com/sensdiego/leci',
    status: 'dev',
    stack: ['Next.js', 'PostgreSQL', 'pgvector', 'Railway', 'TypeScript'],
    docsUrl: 'https://leci.sens.legal',
    llms_txt_url: 'https://leci.sens.legal/llms.txt',
  },
  {
    name: 'Douto',
    subdomain: 'douto',
    description: 'Doctrine pipeline — legal books processed into structured, searchable knowledge with semantic indexing.',
    descriptionPtBr: 'Pipeline de doutrina — livros juridicos processados em conhecimento estruturado e pesquisavel com indexacao semantica.',
    repo: 'https://github.com/sensdiego/douto',
    status: 'dev',
    stack: ['Python', 'Legal-BERTimbau', 'LlamaParse', 'MiniMax'],
    docsUrl: 'https://douto.sens.legal',
    llms_txt_url: 'https://douto.sens.legal/llms.txt',
  },
];
