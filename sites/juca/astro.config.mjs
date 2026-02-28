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
  site: 'https://juca.sens.legal',
  integrations: [
    starlight({
      title: 'Juca',
      description: 'Frontend hub for Brazilian legal AI, orchestrating Valter and Leci agents.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sensdiego/juca' },
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
            { label: 'Architecture Overview', slug: 'architecture/overview', translations: { 'pt-BR': 'Visão Geral da Arquitetura' } },
            { label: 'Technology Stack', slug: 'architecture/stack', translations: { 'pt-BR': 'Stack Tecnológica' } },
            { label: 'Architecture Decision Records', slug: 'architecture/decisions' },
            { label: 'Architecture Diagrams', slug: 'architecture/diagrams', translations: { 'pt-BR': 'Diagramas de Arquitetura' } },
            { label: 'sens.legal Ecosystem', slug: 'architecture/ecosystem', translations: { 'pt-BR': 'Ecossistema sens.legal' } },
          ],
        },
        {
          label: 'Features',
          translations: { 'pt-BR': 'Funcionalidades' },
          items: [
            { label: 'Features', slug: 'features', translations: { 'pt-BR': 'Funcionalidades' } },
            { label: 'Block System', slug: 'features/block-system' },
            {
              label: 'Briefing Progressivo',
              items: [
                { label: 'Overview', slug: 'features/briefing' },
                { label: 'Phase 1: Diagnosis', slug: 'features/briefing/phase-1-diagnosis', translations: { 'pt-BR': 'Fase 1: Diagnóstico' } },
                { label: 'Phase 2: Precedents', slug: 'features/briefing/phase-2-precedents', translations: { 'pt-BR': 'Fase 2: Precedentes' } },
                { label: 'Phase 3: Risks & Opportunities', slug: 'features/briefing/phase-3-risks', translations: { 'pt-BR': 'Fase 3: Riscos & Oportunidades' } },
                { label: 'Phase 4: Contextual Delivery', slug: 'features/briefing/phase-4-delivery', translations: { 'pt-BR': 'Fase 4: Entrega Contextual' } },
              ],
            },
            { label: 'Composer & Intent Detection', slug: 'features/composer', translations: { 'pt-BR': 'Composer & Detecção de Intenção' } },
            { label: 'Session Management', slug: 'features/session-management', translations: { 'pt-BR': 'Gerenciamento de Sessão' } },
            { label: 'PDF Export', slug: 'features/pdf-export', translations: { 'pt-BR': 'Exportação PDF' } },
            { label: 'Authentication', slug: 'features/auth', translations: { 'pt-BR': 'Autenticação' } },
            { label: 'Feature Flags', slug: 'features/feature-flags' },
          ],
        },
        {
          label: 'Configuration',
          translations: { 'pt-BR': 'Configuração' },
          items: [
            { label: 'Environment Variables', slug: 'configuration/environment', translations: { 'pt-BR': 'Variáveis de Ambiente' } },
            { label: 'Configuration Files', slug: 'configuration/settings', translations: { 'pt-BR': 'Arquivos de Configuração' } },
            { label: 'External Integrations', slug: 'configuration/integrations', translations: { 'pt-BR': 'Integrações Externas' } },
          ],
        },
        {
          label: 'Development',
          translations: { 'pt-BR': 'Desenvolvimento' },
          items: [
            { label: 'Development Setup', slug: 'development/setup', translations: { 'pt-BR': 'Configuração do Ambiente' } },
            { label: 'Coding Conventions', slug: 'development/conventions', translations: { 'pt-BR': 'Convenções de Código' } },
            { label: 'Testing Guide', slug: 'development/testing', translations: { 'pt-BR': 'Guia de Testes' } },
            { label: 'Contributing Guide', slug: 'development/contributing', translations: { 'pt-BR': 'Guia de Contribuição' } },
          ],
        },
        {
          label: 'API Reference',
          translations: { 'pt-BR': 'Referência da API' },
          items: [
            { label: 'API Reference', slug: 'api', translations: { 'pt-BR': 'Referência da API' } },
            { label: 'Valter API Adapter', slug: 'api/valter-adapter', translations: { 'pt-BR': 'Adapter da API Valter' } },
            { label: 'Unified Endpoints', slug: 'api/unified', translations: { 'pt-BR': 'Endpoints Unified' } },
            { label: 'Briefing Endpoints', slug: 'api/briefing', translations: { 'pt-BR': 'Endpoints de Briefing' } },
            { label: 'Export Endpoints', slug: 'api/export', translations: { 'pt-BR': 'Endpoints de Exportação' } },
          ],
        },
        {
          label: 'Roadmap',
          items: [
            { label: 'Roadmap', slug: 'roadmap' },
            { label: 'Milestones', slug: 'roadmap/milestones' },
            { label: 'Changelog', slug: 'roadmap/changelog' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'pt-BR': 'Referência' },
          items: [
            { label: 'Glossary', slug: 'reference/glossary', translations: { 'pt-BR': 'Glossário' } },
            { label: 'FAQ', slug: 'reference/faq' },
            { label: 'Troubleshooting', slug: 'reference/troubleshooting', translations: { 'pt-BR': 'Solução de Problemas' } },
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
