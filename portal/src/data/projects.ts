export interface ProjectRoadmapStage {
  title: string;
  titlePtBr: string;
}

export interface ProjectUpdate {
  date: string;
  title: string;
  titlePtBr: string;
  summary: string;
  summaryPtBr: string;
}

export interface ProjectRoadmap {
  currentStage: number;
  totalStages: number;
  currentStageLabel: string;
  currentStageLabelPtBr: string;
  summary: string;
  summaryPtBr: string;
  now: string;
  nowPtBr: string;
  next: string;
  nextPtBr: string;
  blockers: string[];
  blockersPtBr: string[];
  stages: ProjectRoadmapStage[];
  updates: ProjectUpdate[];
}

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
  roadmap: ProjectRoadmap;
}

export const projects: Project[] = [
  {
    name: 'Valter',
    subdomain: 'valter',
    description: 'Ecosystem jurisprudence backend - graph-led retrieval, reasoning, verification, and API/MCP access centered in Valter.',
    descriptionPtBr: 'Backend de jurisprudencia do ecossistema - retrieval graph-led, reasoning, verificacao e acesso via API/MCP centralizados no Valter.',
    repo: 'https://github.com/sensdiego/Valter',
    status: 'dev',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Qdrant', 'Neo4j', 'Redis'],
    docsUrl: 'https://valter.sens.legal',
    llms_txt_url: 'https://valter.sens.legal/llms.txt',
    roadmap: {
      currentStage: 6,
      totalStages: 6,
      currentStageLabel: 'Juca backend cutover',
      currentStageLabelPtBr: 'Cutover do backend do Juca',
      summary:
        'Migration phases 0-4 are done and deployed. Chat pipeline is live with 28 MCP tools operational. Only the final Juca backend cutover remains before v1.0.',
      summaryPtBr:
        'As fases 0-4 da migracao estao concluidas e deployed. O pipeline de chat esta ativo com 28 tools MCP operacionais. Resta apenas o cutover final do backend do Juca antes do v1.0.',
      now:
        'Complete the final backend cutover from Juca and stabilize for v1.0.',
      nowPtBr:
        'Concluir o cutover final do backend do Juca e estabilizar para o v1.0.',
      next:
        'v1.0 stable production milestones.',
      nextPtBr:
        'Marcos de producao estavel v1.0.',
      blockers: [
        'Juca cutover depends on Juca frontend adapting to Valter-only backend.',
      ],
      blockersPtBr: [
        'O cutover do Juca depende do frontend do Juca se adaptar ao backend exclusivo do Valter.',
      ],
      stages: [
        { title: 'Canonical triage', titlePtBr: 'Triagem canonica' },
        { title: 'Schema + entity resolution', titlePtBr: 'Schema + entity resolution' },
        { title: 'Graph-led retrieval', titlePtBr: 'Graph-led retrieval' },
        { title: 'Unified pipeline + reasoning', titlePtBr: 'Pipeline unificado + reasoning' },
        { title: 'Chat orchestration', titlePtBr: 'Orquestracao de chat' },
        { title: 'Juca backend cutover', titlePtBr: 'Cutover do backend do Juca' },
      ],
      updates: [
        {
          date: '2026-03-11',
          title: 'Chat pipeline deployed to production',
          titlePtBr: 'Chat pipeline deployado em producao',
          summary: '3-stage LLM pipeline (draft, critics, revision) with SSE streaming deployed to Railway. 64 new tests added.',
          summaryPtBr: 'Pipeline LLM de 3 estagios (draft, criticos, revisao) com streaming SSE deployado no Railway. 64 novos testes adicionados.',
        },
        {
          date: '2026-03-09',
          title: 'Unified pipeline + 30 MCP tools',
          titlePtBr: 'Pipeline unificado + 30 tools MCP',
          summary: 'SEN-385 completed: validated PRD, 73 new tests, 30 MCP tools operational, and incremental ranking improvement (+0.017 nDCG).',
          summaryPtBr: 'SEN-385 concluido: PRD validado, 73 novos testes, 30 tools MCP operacionais e melhoria incremental de ranking (+0.017 nDCG).',
        },
        {
          date: '2026-03-05',
          title: 'Graph-led retrieval pivot',
          titlePtBr: 'Pivot para graph-led retrieval',
          summary: 'Implemented graph-guided search (60% KG, 40% BM25) with cross-encoder reranking. Validated at P@10=0.775, nDCG=0.791.',
          summaryPtBr: 'Busca guiada por grafo (60% KG, 40% BM25) com reranking cross-encoder implementada. Validada com P@10=0.775, nDCG=0.791.',
        },
        {
          date: '2026-02-22',
          title: 'ChatGPT production integration',
          titlePtBr: 'Integracao ChatGPT em producao',
          summary: 'Remote MCP via HTTP/SSE on Railway with HMAC authentication. Literal citation validation working through ChatGPT.',
          summaryPtBr: 'MCP remoto via HTTP/SSE no Railway com autenticacao HMAC. Validacao de citacoes literais funcionando via ChatGPT.',
        },
        {
          date: '2026-02-17',
          title: 'Railway deploy and stabilization',
          titlePtBr: 'Deploy Railway e estabilizacao',
          summary: 'API and Worker deployed to Railway with MCP diagnostics and functional healthchecks.',
          summaryPtBr: 'API e Worker deployados no Railway com diagnostico MCP e healthchecks funcionais.',
        },
        {
          date: '2026-02-15',
          title: 'Advanced search and MCP integration',
          titlePtBr: 'Busca avancada e integracao MCP',
          summary: 'AI-extracted feature search and Claude Desktop integration via MCP with 28 initial tools.',
          summaryPtBr: 'Busca por features extraidas via IA e integracao com Claude Desktop via MCP com 28 tools iniciais.',
        },
        {
          date: '2026-02-09',
          title: 'Rich data ingestion complete',
          titlePtBr: 'Ingestao completa de dados ricos',
          summary: 'Initial Juca to Valter migration with 19,768 case summaries and 23,441 STJ decisions loaded into Neo4j and Qdrant.',
          summaryPtBr: 'Migracao inicial Juca para Valter com 19.768 ementas e 23.441 decisoes do STJ carregadas em Neo4j e Qdrant.',
        },
      ],
    },
  },
  {
    name: 'Juca',
    subdomain: 'juca',
    description: 'Frontend hub for lawyers and AI-assisted workflows, progressively decoupled from backend services now moving into Valter.',
    descriptionPtBr: 'Hub frontend para advogados e fluxos assistidos por IA, desacoplando-se progressivamente dos servicos de backend que migram para o Valter.',
    repo: 'https://github.com/sensdiego/juca',
    status: 'dev',
    stack: ['Next.js', 'React', 'TypeScript'],
    docsUrl: 'https://juca.sens.legal',
    llms_txt_url: 'https://juca.sens.legal/llms.txt',
    roadmap: {
      currentStage: 1,
      totalStages: 5,
      currentStageLabel: 'Hub foundation',
      currentStageLabelPtBr: 'Fundacao do hub',
      summary:
        'v0.2 design system is complete and the UI/UX reset (SEN-354) is done. Now building v0.3: Valter integration via adapter layer to complete the hub foundation.',
      summaryPtBr:
        'O design system v0.2 esta completo e o reset de UI/UX (SEN-354) esta feito. Agora construindo v0.3: integracao com Valter via adapter layer para completar a fundacao do hub.',
      now:
        'Build v0.3 hub foundation: Valter integration and adapter layer.',
      nowPtBr:
        'Construir a fundacao do hub v0.3: integracao com o Valter e adapter layer.',
      next:
        'Ship progressive briefing (v0.4) with external backend calls.',
      nextPtBr:
        'Entregar o briefing progressivo (v0.4) com chamadas a backends externos.',
      blockers: [
        'Adapter layer depends on Valter MCP contract stabilization.',
        'Progressive briefing deferred to v0.4.',
      ],
      blockersPtBr: [
        'A adapter layer depende da estabilizacao do contrato MCP do Valter.',
        'Briefing progressivo adiado para v0.4.',
      ],
      stages: [
        { title: 'Hub foundation', titlePtBr: 'Fundacao do hub' },
        { title: 'Progressive briefing', titlePtBr: 'Briefing progressivo' },
        { title: 'Polish and expand', titlePtBr: 'Polimento e expansao' },
        { title: 'Multi-agent platform', titlePtBr: 'Plataforma multiagente' },
        { title: 'Platform release', titlePtBr: 'Release de plataforma' },
      ],
      updates: [
        {
          date: '2026-03-09',
          title: 'Zustand removal and codebase cleanup',
          titlePtBr: 'Remocao do Zustand e limpeza do codebase',
          summary: 'Zustand fully removed (0 imports). Duplicated documentation cleaned up. All PRs #300-306 merged successfully.',
          summaryPtBr: 'Zustand completamente removido (0 imports). Documentacao duplicada limpa. Todos os PRs #300-306 mergeados com sucesso.',
        },
        {
          date: '2026-03-07',
          title: 'Design system v0.2 complete',
          titlePtBr: 'Design system v0.2 completo',
          summary: 'Liquid Legal UI/UX design system fully implemented: tokens, base components, shell layout, Composer, message blocks, and responsiveness. SEN-354 closed.',
          summaryPtBr: 'Design system Liquid Legal UI/UX totalmente implementado: tokens, componentes base, shell layout, Composer, blocos de mensagem e responsividade. SEN-354 fechada.',
        },
        {
          date: '2026-02-28',
          title: 'Roadmap and hub vision defined',
          titlePtBr: 'Roadmap e visao de hub definidos',
          summary: 'Juca redefined as a lightweight frontend hub orchestrating external agents (Valter, Leci), transitioning away from monolithic backend.',
          summaryPtBr: 'Juca redefinido como hub frontend leve orquestrando agentes externos (Valter, Leci), migrando de backend monolitico.',
        },
      ],
    },
  },
  {
    name: 'Leci',
    subdomain: 'leci',
    description: 'Document-first legislation engine with live /api/search, reliable grounding, and structured statute retrieval for Valter and Juca.',
    descriptionPtBr: 'Engine legislativa document-first com /api/search operacional, grounding confiavel e recuperacao estruturada de normas para Valter e Juca.',
    repo: 'https://github.com/sensdiego/leci',
    status: 'dev',
    stack: ['Next.js', 'PostgreSQL', 'pgvector', 'Railway', 'TypeScript'],
    docsUrl: 'https://leci.sens.legal',
    llms_txt_url: 'https://leci.sens.legal/llms.txt',
    roadmap: {
      currentStage: 2,
      totalStages: 5,
      currentStageLabel: 'Canonical legal reference resolution',
      currentStageLabelPtBr: 'Resolucao canonica de referencia juridica',
      summary:
        'v0.2 reference resolution is complete: 185 tests passing, 19 federal regulations mapped. Now entering provision resolution (SEN-424 to SEN-429).',
      summaryPtBr:
        'A resolucao de referencia v0.2 esta completa: 185 testes passando, 19 regulamentacoes federais mapeadas. Agora entrando em resolucao de dispositivos (SEN-424 a SEN-429).',
      now:
        'Provision resolution — map articles, paragraphs, and items within resolved statutes.',
      nowPtBr:
        'Resolucao de dispositivos — mapear artigos, paragrafos e incisos dentro das normas resolvidas.',
      next:
        'Expose document-first reader and grounding contracts for Valter and Juca.',
      nextPtBr:
        'Expor reader document-first e contratos de grounding para o Valter e para o Juca.',
      blockers: [
        'Provision mapping requires structured article/paragraph parsing not yet built.',
      ],
      blockersPtBr: [
        'O mapeamento de dispositivos requer parsing estruturado de artigos/paragrafos ainda nao construido.',
      ],
      stages: [
        { title: 'Foundation API and setup reliability', titlePtBr: 'Fundacao de API e confiabilidade de setup' },
        { title: 'Canonical legal reference resolution', titlePtBr: 'Resolucao canonica de referencia juridica' },
        { title: 'Reader and grounding contracts', titlePtBr: 'Reader e contratos de grounding' },
        { title: 'Ingestion, quality, and advanced retrieval', titlePtBr: 'Ingestao, qualidade e retrieval avancado' },
        { title: 'Ecosystem stability and rollout', titlePtBr: 'Estabilidade e rollout no ecossistema' },
      ],
      updates: [
        {
          date: '2026-03-09',
          title: 'Canonical document resolution complete',
          titlePtBr: 'Resolucao canonica de documentos completa',
          summary: 'Five-issue track (SEN-418 to SEN-423) shipped: canonical document ID format, normalizer, 19-norm alias registry, confidence-scored resolver, and /api/resolve v0 endpoint. 185 tests passing.',
          summaryPtBr: 'Trilha de 5 issues (SEN-418 a SEN-423) entregue: formato canonico de ID de documento, normalizador, registro de alias de 19 normas, resolver com score de confianca e endpoint /api/resolve v0. 185 testes passando.',
        },
        {
          date: '2026-03-07',
          title: 'Search API and UI foundation',
          titlePtBr: 'API de busca e fundacao de UI',
          summary: 'Launched /api/search with PostgreSQL FTS, validated response contracts, and first autonomous search shell. Railway integration with real legislation data.',
          summaryPtBr: 'Lancamento do /api/search com PostgreSQL FTS, contratos de resposta validados e primeiro shell de busca autonomo. Integracao Railway com dados reais de legislacao.',
        },
        {
          date: '2026-03-06',
          title: 'Strategic product repositioning',
          titlePtBr: 'Reposicionamento estrategico de produto',
          summary: 'Leci redefined as legislation-only engine serving Valter and Juca. Shifted to document-first retrieval with normalized alias handling and contextual ambiguity resolution.',
          summaryPtBr: 'Leci redefinido como engine exclusiva de legislacao servindo Valter e Juca. Mudanca para retrieval document-first com normalizacao de alias e resolucao contextual de ambiguidade.',
        },
      ],
    },
  },
  {
    name: 'Douto',
    subdomain: 'douto',
    description: 'Local doctrine pipeline and internal artifact supplier for Valter, turning curated legal books into reusable doctrinal material.',
    descriptionPtBr: 'Pipeline local de doutrina e fornecedor interno de artefatos para o Valter, transformando obras juridicas curadas em material doutrinario reutilizavel.',
    repo: 'https://github.com/sensdiego/douto',
    status: 'dev',
    stack: ['Python', 'Legal-BERTimbau', 'LlamaParse', 'MiniMax'],
    docsUrl: 'https://douto.sens.legal',
    llms_txt_url: 'https://douto.sens.legal/llms.txt',
    roadmap: {
      currentStage: 2,
      totalStages: 5,
      currentStageLabel: 'Doctrinal quality gate',
      currentStageLabelPtBr: 'Quality gate doutrinario',
      summary:
        'Stage 1 (reproducible foundation) is complete: SEN-447 to SEN-451 done. Now entering the doctrinal quality gate (SEN-452 to SEN-456).',
      summaryPtBr:
        'O estagio 1 (fundacao reproduzivel) esta completo: SEN-447 a SEN-451 concluidos. Agora entrando no quality gate doutrinario (SEN-452 a SEN-456).',
      now:
        'Define and measure doctrinal quality metrics for the extraction pipeline.',
      nowPtBr:
        'Definir e medir metricas de qualidade doutrinaria do pipeline de extracao.',
      next:
        'Establish the artifact handoff contract to Valter.',
      nextPtBr:
        'Estabelecer o contrato de handoff de artefatos para o Valter.',
      blockers: [
        'Quality metrics and acceptance criteria not yet defined.',
      ],
      blockersPtBr: [
        'Metricas de qualidade e criterios de aceitacao ainda nao definidos.',
      ],
      stages: [
        { title: 'Reproducible foundation', titlePtBr: 'Fundacao reproduzivel' },
        { title: 'Doctrinal quality gate', titlePtBr: 'Quality gate doutrinario' },
        { title: 'Artifact handoff contract to Valter', titlePtBr: 'Contrato de handoff de artefatos para o Valter' },
        { title: 'Explainable retrieval', titlePtBr: 'Retrieval explicavel' },
        { title: 'Gated synthesis', titlePtBr: 'Sintese com gate proprio' },
      ],
      updates: [
        {
          date: '2026-03-07',
          title: 'Strategic and operational realignment',
          titlePtBr: 'Realinhamento estrategico e operacional',
          summary: 'Douto repositioned as internal doctrine pipeline for Valter (not standalone product). Focus on contract law and civil procedure. Canonical backlog established in Linear (SEN-447 to SEN-468) with governance rules prioritizing accuracy over speed.',
          summaryPtBr: 'Douto reposicionado como pipeline interno de doutrina para o Valter (nao produto standalone). Foco em direito contratual e processo civil. Backlog canonico estabelecido no Linear (SEN-447 a SEN-468) com regras de governanca priorizando precisao sobre velocidade.',
        },
      ],
    },
  },
];
