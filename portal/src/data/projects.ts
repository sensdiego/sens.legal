export interface Project {
  name: string;
  subdomain: string;
  description: string;
  repo: string;
  status: 'alpha' | 'beta' | 'stable';
  stack: string[];
  llms_txt_url: string;
}

export const projects: Project[] = [
  {
    name: 'Juca',
    subdomain: 'juca',
    description: 'Frontend hub for Brazilian legal AI, orchestrating Valter and Leci agents.',
    repo: 'https://github.com/sensdiego/juca',
    status: 'alpha',
    stack: ['Next.js', 'React', 'TypeScript'],
    llms_txt_url: 'https://juca.sens.legal/llms.txt',
  },
  {
    name: 'Valter',
    subdomain: 'valter',
    description: 'Legal knowledge backend serving Brazilian STJ jurisprudence via REST API and MCP.',
    repo: 'https://github.com/sensdiego/Valter',
    status: 'alpha',
    stack: ['Node.js', 'PostgreSQL', 'MCP'],
    llms_txt_url: 'https://valter.sens.legal/llms.txt',
  },
  {
    name: 'Leci',
    subdomain: 'leci',
    description: 'Navigation hub for architecture, setup, roadmap, and operations.',
    repo: 'https://github.com/sensdiego/leci',
    status: 'alpha',
    stack: ['Next.js', 'Drizzle ORM', 'PostgreSQL'],
    llms_txt_url: 'https://leci.sens.legal/llms.txt',
  },
];
