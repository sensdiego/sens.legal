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
  site: 'https://leci.sens.legal',
  integrations: [
    starlight({
      title: 'Leci',
      description: 'Navigation hub for architecture, setup, roadmap, and operations.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sensdiego/leci' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          translations: { 'pt-BR': 'Primeiros Passos' },
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Quickstart', slug: 'getting-started/quickstart' },
            { label: 'Installation', slug: 'getting-started/installation' },
          ],
        },
        {
          label: 'Architecture',
          translations: { 'pt-BR': 'Arquitetura' },
          items: [
            { label: 'Architecture Overview', slug: 'architecture/overview' },
            { label: 'Technology Stack', slug: 'architecture/stack' },
            { label: 'Architecture Decisions', slug: 'architecture/decisions' },
            { label: 'Architecture Diagrams', slug: 'architecture/diagrams' },
            { label: 'Project Diagnostic Snapshot', slug: 'architecture/PROJECT_MAP' },
          ],
        },
        {
          label: 'Features',
          translations: { 'pt-BR': 'Funcionalidades' },
          items: [
            { label: 'Features Index', slug: 'features' },
            { label: 'Core Data Model and Migrations', slug: 'features/core-data-model-and-migrations' },
            { label: 'Legal Search Foundation', slug: 'features/legal-search-foundation' },
            { label: 'Revision and Audit Trail', slug: 'features/revision-and-audit-trail' },
            { label: 'Web Interface', slug: 'features/web-interface' },
            { label: 'Data Ingestion Pipeline', slug: 'features/data-ingestion-pipeline' },
            { label: 'Temporal Trust Layer', slug: 'features/temporal-trust-layer' },
          ],
        },
        {
          label: 'Configuration',
          translations: { 'pt-BR': 'Configuração' },
          items: [
            { label: 'Environment Variables', slug: 'configuration/environment' },
            { label: 'Project Settings Files', slug: 'configuration/settings' },
            { label: 'External Integrations', slug: 'configuration/integrations' },
          ],
        },
        {
          label: 'Development',
          translations: { 'pt-BR': 'Desenvolvimento' },
          items: [
            { label: 'Development Setup', slug: 'development/setup' },
            { label: 'Development Conventions', slug: 'development/conventions' },
            { label: 'Testing Strategy', slug: 'development/testing' },
            { label: 'Contributing Guide', slug: 'development/contributing' },
          ],
        },
        {
          label: 'Roadmap',
          translations: { 'pt-BR': 'Roadmap' },
          items: [
            { label: 'Product Roadmap', slug: 'roadmap' },
            { label: 'Milestones', slug: 'roadmap/milestones' },
            { label: 'Changelog', slug: 'roadmap/changelog' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'pt-BR': 'Referência' },
          items: [
            { label: 'Glossary', slug: 'reference/glossary' },
            { label: 'FAQ', slug: 'reference/faq' },
            { label: 'Troubleshooting', slug: 'reference/troubleshooting' },
          ],
        },
        {
          label: 'Planning',
          translations: { 'pt-BR': 'Planejamento' },
          items: [
            { label: 'Planning Roadmap', slug: 'planning/ROADMAP' },
            { label: 'Premortem', slug: 'planning/PREMORTEM' },
            { label: 'Innovation Layer', slug: 'planning/INNOVATION_LAYER' },
            { label: 'Repository Reorganization', slug: 'planning/REORG_PLAN' },
          ],
        },
        {
          label: 'ADR',
          items: [
            { label: 'ADR Guide', slug: 'adr/README' },
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
