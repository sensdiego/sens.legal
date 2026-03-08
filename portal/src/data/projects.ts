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
      currentStage: 4,
      totalStages: 6,
      currentStageLabel: 'Unified pipeline + reasoning',
      currentStageLabelPtBr: 'Pipeline unificado + reasoning',
      summary:
        'This roadmap position mirrors the Juca -> Valter migration: canonical triage, schema work, and graph-led retrieval are done, while the unified pipeline landed in main on March 8, 2026 with follow-up validation still open.',
      summaryPtBr:
        'Esta posicao no roadmap espelha a migracao Juca -> Valter: triagem canonica, schema e graph-led retrieval ja foram concluidos, enquanto o pipeline unificado entrou em main em 8 de marco de 2026 com validacoes complementares ainda em aberto.',
      now:
        'Regularize Neo4j schema consolidation and live A/B validation after the merged unified pipeline.',
      nowPtBr:
        'Regularizar a consolidacao do schema Neo4j e a validacao A/B com dados reais apos o merge do pipeline unificado.',
      next:
        'Resume chat orchestration and final backend cutover from Juca once validation blockers are cleared.',
      nextPtBr:
        'Retomar a orquestracao de chat e o cutover final do backend que sai do Juca assim que os bloqueios de validacao forem removidos.',
      blockers: [
        'Neo4j schema consolidation is still required before trustworthy live evaluation.',
        'Aura live validation and secrets setup are still pending in CI.',
      ],
      blockersPtBr: [
        'A consolidacao do schema Neo4j ainda e necessaria antes de uma avaliacao live confiavel.',
        'A validacao live no Aura e a configuracao de secrets no CI seguem pendentes.',
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
        'The interface base already exists, but the roadmap is still at the hub-foundation milestone: reset the UX, integrate Valter cleanly, and finish moving legal backend ownership out of Juca.',
      summaryPtBr:
        'A base de interface ja existe, mas o roadmap ainda esta no milestone de fundacao do hub: resetar a UX, integrar o Valter de forma limpa e concluir a saida do ownership do backend juridico de dentro do Juca.',
      now:
        'Reset the hub UX, add the agent adapter layer, and integrate Valter as the primary legal backend.',
      nowPtBr:
        'Resetar a UX do hub, adicionar a camada de adaptadores para agentes e integrar o Valter como backend juridico principal.',
      next:
        'Ship progressive briefing on top of external backend calls and then remove duplicated local backend paths.',
      nextPtBr:
        'Entregar o briefing progressivo sobre chamadas a backends externos e depois remover caminhos locais de backend duplicado.',
      blockers: [
        'Frontend cleanup and failing test debt are still part of the foundation milestone.',
        'Backend migration into Valter needs to stay ahead of Juca cutover work.',
      ],
      blockersPtBr: [
        'Cleanup de frontend e divida de testes ainda fazem parte do milestone de fundacao.',
        'A migracao do backend para o Valter precisa seguir a frente do trabalho de cutover do Juca.',
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
        'Foundation reliability is already operational: live /api/search, typed contracts, a working shell, and real-data validation. The roadmap position is now canonical document resolution.',
      summaryPtBr:
        'A fundacao ja esta operacional: /api/search ao vivo, contratos tipados, shell funcional e validacao com dados reais. A posicao atual do roadmap agora e resolucao canonica de documentos.',
      now:
        'Resolve statutes by alias, abbreviation, number, and year, then map provisions with structural context.',
      nowPtBr:
        'Resolver normas por alias, sigla, numero e ano, e depois mapear dispositivos com contexto estrutural.',
      next:
        'Expose document-first reader and grounding contracts for Valter and Juca.',
      nextPtBr:
        'Expor reader document-first e contratos de grounding para o Valter e para o Juca.',
      blockers: [
        'The current search baseline still indexes node text rather than canonical document resolution.',
        'Ambiguous legal citations still need dedicated resolution and disambiguation flows.',
      ],
      blockersPtBr: [
        'A baseline atual de busca ainda indexa texto de nos, nao resolucao canonica de documentos.',
        'Citacoes juridicas ambiguas ainda precisam de fluxos dedicados de resolucao e desambiguacao.',
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
      currentStage: 1,
      totalStages: 5,
      currentStageLabel: 'Reproducible foundation',
      currentStageLabelPtBr: 'Fundacao reproduzivel',
      summary:
        'Strategic direction is aligned, but the production roadmap still starts with making the local doctrine pipeline reproducible before retrieval or synthesis claims.',
      summaryPtBr:
        'A direcao estrategica esta alinhada, mas o roadmap de producao ainda comeca por tornar o pipeline local de doutrina reproduzivel antes de qualquer discurso de retrieval ou sintese.',
      now:
        'Regularize local paths, CLI behavior, and reproducible pipeline setup for contracts and civil procedure.',
      nowPtBr:
        'Regularizar paths locais, comportamento de CLI e setup reproduzivel do pipeline para contratos e processo civil.',
      next:
        'Measure doctrinal quality and define the artifact handoff contract into Valter.',
      nextPtBr:
        'Medir a qualidade doutrinaria e definir o contrato de handoff de artefatos para o Valter.',
      blockers: [
        'The pipeline still depends on creator-machine path regularization.',
        'Enrichment and retrieval quality still need explicit measurement before public-facing claims.',
      ],
      blockersPtBr: [
        'O pipeline ainda depende da regularizacao de paths da maquina do criador.',
        'A qualidade de enrichment e retrieval ainda precisa ser medida explicitamente antes de claims publicos.',
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
