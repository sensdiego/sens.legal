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
      theme: 'default',
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
  site: 'https://douto.sens.legal',
  integrations: [
    starlight({
      title: 'Douto',
      logo: { src: './src/assets/logo.png', alt: 'sens' },
      description: 'Legal doctrine knowledge agent — processes legal books into structured, searchable knowledge.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sensdiego/douto' },
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
            { label: 'Architecture Decisions', slug: 'architecture/decisions', translations: { 'pt-BR': 'Decisões de Arquitetura' } },
            { label: 'Architecture Diagrams', slug: 'architecture/diagrams', translations: { 'pt-BR': 'Diagramas de Arquitetura' } },
          ],
        },
        {
          label: 'Features',
          translations: { 'pt-BR': 'Funcionalidades' },
          items: [
            { label: 'Features', slug: 'features', translations: { 'pt-BR': 'Funcionalidades' } },
            {
              label: 'Knowledge Base',
              translations: { 'pt-BR': 'Base de Conhecimento' },
              items: [
                { label: 'Atomic Notes', slug: 'features/knowledge-base/atomic-notes', translations: { 'pt-BR': 'Notas Atômicas' } },
                { label: 'Maps of Content', slug: 'features/knowledge-base/mocs', translations: { 'pt-BR': 'Mapas de Conteúdo' } },
                { label: 'Skill Graph', slug: 'features/knowledge-base/skill-graph' },
              ],
            },
            {
              label: 'Pipeline',
              items: [
                { label: 'PDF Extraction', slug: 'features/pipeline/pdf-extraction', translations: { 'pt-BR': 'Extração de PDF' } },
                { label: 'Intelligent Chunking', slug: 'features/pipeline/intelligent-chunking', translations: { 'pt-BR': 'Chunking Inteligente' } },
                { label: 'Metadata Enrichment', slug: 'features/pipeline/enrichment', translations: { 'pt-BR': 'Enriquecimento de Metadados' } },
                { label: 'Semantic Embeddings', slug: 'features/pipeline/embeddings', translations: { 'pt-BR': 'Embeddings Semânticos' } },
                { label: 'Hybrid Search', slug: 'features/pipeline/hybrid-search', translations: { 'pt-BR': 'Busca Híbrida' } },
              ],
            },
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
