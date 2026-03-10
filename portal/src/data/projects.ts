export interface ProjectRoadmapStage {
  title: string;
  titlePtBr: string;
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
    },
  },
];
