// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const mermaidScript = {
  tag: 'script',
  attrs: { type: 'module', defer: true },
  content: `
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
    });
    const observer = new MutationObserver(() => {
      document.querySelectorAll('pre:has(code.language-mermaid)').forEach(pre => {
        const code = pre.querySelector('code');
        if (!code || pre.dataset.mermaidProcessed) return;
        pre.dataset.mermaidProcessed = 'true';
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = code.textContent;
        pre.replaceWith(div);
      });
      mermaid.run();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('pre:has(code.language-mermaid)').forEach(pre => {
        const code = pre.querySelector('code');
        if (!code) return;
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = code.textContent;
        pre.replaceWith(div);
      });
      mermaid.run();
    });
  `,
};

export default defineConfig({
  site: 'https://valter.sens.legal',
  integrations: [
    starlight({
      title: 'Valter',
      description: 'Legal knowledge backend serving Brazilian STJ jurisprudence via REST API and MCP.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sensdiego/Valter' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          translations: { 'pt-BR': 'Primeiros Passos' },
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction', translations: { 'pt-BR': 'Introdução' } },
            { label: 'Quickstart', slug: 'getting-started/quickstart' },
            { label: 'Installation', slug: 'getting-started/installation', translations: { 'pt-BR': 'Instalação' } },
          ],
        },
        {
          label: 'Architecture',
          translations: { 'pt-BR': 'Arquitetura' },
          items: [
            { label: 'Overview', slug: 'architecture/overview', translations: { 'pt-BR': 'Visão Geral' } },
            { label: 'Technology Stack', slug: 'architecture/stack' },
            { label: 'Decision Records', slug: 'architecture/decisions', translations: { 'pt-BR': 'Decisões' } },
            { label: 'Diagrams', slug: 'architecture/diagrams', translations: { 'pt-BR': 'Diagramas' } },
          ],
        },
        {
          label: 'Features',
          translations: { 'pt-BR': 'Funcionalidades' },
          items: [
            { label: 'Feature Overview', slug: 'features', translations: { 'pt-BR': 'Visão Geral' } },
            { label: 'Hybrid Search', slug: 'features/hybrid-search', translations: { 'pt-BR': 'Busca Híbrida' } },
            { label: 'Graph Analytics', slug: 'features/graph-analytics' },
            { label: 'MCP Server', slug: 'features/mcp-server', translations: { 'pt-BR': 'Servidor MCP' } },
            { label: 'Ingestion Workflow', slug: 'features/ingestion-workflow', translations: { 'pt-BR': 'Workflow de Ingestão' } },
            { label: 'Verification & Enrichment', slug: 'features/verification-enrichment', translations: { 'pt-BR': 'Verificação e Enriquecimento' } },
            { label: 'Reasoning Chain', slug: 'features/reasoning-chain', translations: { 'pt-BR': 'Cadeia de Raciocínio' } },
            { label: 'Observability', slug: 'features/observability', translations: { 'pt-BR': 'Observabilidade' } },
          ],
        },
        {
          label: 'Configuration',
          translations: { 'pt-BR': 'Configuração' },
          items: [
            { label: 'Environment Variables', slug: 'configuration/environment', translations: { 'pt-BR': 'Variáveis de Ambiente' } },
            { label: 'Settings', slug: 'configuration/settings', translations: { 'pt-BR': 'Configurações' } },
            { label: 'Integrations', slug: 'configuration/integrations', translations: { 'pt-BR': 'Integrações' } },
          ],
        },
        {
          label: 'Development',
          translations: { 'pt-BR': 'Desenvolvimento' },
          items: [
            { label: 'Setup', slug: 'development/setup' },
            { label: 'Conventions', slug: 'development/conventions', translations: { 'pt-BR': 'Convenções' } },
            { label: 'Testing', slug: 'development/testing', translations: { 'pt-BR': 'Testes' } },
            { label: 'Contributing', slug: 'development/contributing', translations: { 'pt-BR': 'Contribuindo' } },
          ],
        },
        {
          label: 'API Reference',
          translations: { 'pt-BR': 'Referência da API' },
          items: [
            { label: 'Overview', slug: 'api', translations: { 'pt-BR': 'Visão Geral' } },
            { label: 'Search', slug: 'api/search', translations: { 'pt-BR': 'Busca' } },
            { label: 'Graph', slug: 'api/graph', translations: { 'pt-BR': 'Grafo' } },
            { label: 'Verify & Enrich', slug: 'api/verify-enrich', translations: { 'pt-BR': 'Verificar e Enriquecer' } },
            { label: 'Ingest', slug: 'api/ingest', translations: { 'pt-BR': 'Ingestão' } },
            { label: 'Admin', slug: 'api/admin' },
            { label: 'MCP Tools', slug: 'api/mcp-tools', translations: { 'pt-BR': 'Tools MCP' } },
          ],
        },
        {
          label: 'Roadmap',
          items: [
            { label: 'Vision', slug: 'roadmap', translations: { 'pt-BR': 'Visão' } },
            { label: 'Milestones', slug: 'roadmap/milestones', translations: { 'pt-BR': 'Marcos' } },
            { label: 'Changelog', slug: 'roadmap/changelog' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'pt-BR': 'Referência' },
          items: [
            { label: 'Glossary', slug: 'reference/glossary', translations: { 'pt-BR': 'Glossário' } },
            { label: 'FAQ', slug: 'reference/faq' },
            { label: 'Troubleshooting', slug: 'reference/troubleshooting' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      head: [
        { tag: 'meta', attrs: { name: 'robots', content: 'index, follow' } },
        { tag: 'link', attrs: { rel: 'alternate', type: 'text/plain', href: '/llms.txt', title: 'LLM Index' } },
        mermaidScript,
      ],
    }),
  ],
});
