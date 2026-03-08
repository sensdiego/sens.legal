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
        'Migration core is advanced: triage, schema work, and graph-led retrieval are done, the unified pipeline is merged, and validation follow-up is still open.',
      summaryPtBr:
        'O nucleo da migracao ja avancou: triagem, schema e graph-led retrieval foram concluidos, o pipeline unificado ja foi mergeado, e o follow-up de validacao segue em aberto.',
      now:
        'Finish Neo4j schema consolidation and live A/B validation.',
      nowPtBr:
        'Concluir a consolidacao do schema Neo4j e a validacao A/B com dados reais.',
      next:
        'Start chat orchestration and the final backend cutover from Juca.',
      nextPtBr:
        'Iniciar a orquestracao de chat e o cutover final do backend que sai do Juca.',
      blockers: [
        'Schema consolidation still blocks trustworthy live evaluation.',
        'Aura live validation still depends on CI secrets setup.',
      ],
      blockersPtBr: [
        'A consolidacao do schema ainda bloqueia uma avaliacao live confiavel.',
        'A validacao live no Aura ainda depende da configuracao de secrets no CI.',
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
        'The interface base exists, but the roadmap is still in hub-foundation mode: reset the UX, integrate Valter cleanly, and finish backend decoupling.',
      summaryPtBr:
        'A base de interface ja existe, mas o roadmap ainda esta em modo fundacao do hub: resetar a UX, integrar o Valter com clareza e concluir o desacoplamento do backend.',
      now:
        'Reset the hub UX, add the agent adapter layer, and integrate Valter.',
      nowPtBr:
        'Resetar a UX do hub, adicionar a camada de adaptadores para agentes e integrar o Valter.',
      next:
        'Ship progressive briefing on external backend calls and remove duplicated local backend paths.',
      nextPtBr:
        'Entregar o briefing progressivo sobre chamadas a backends externos e remover caminhos locais de backend duplicado.',
      blockers: [
        'Frontend cleanup and test debt still belong to the foundation milestone.',
        'Valter migration still needs to stay ahead of Juca cutover work.',
      ],
      blockersPtBr: [
        'Cleanup de frontend e divida de testes ainda fazem parte do milestone de fundacao.',
        'A migracao para o Valter ainda precisa seguir a frente do cutover do Juca.',
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
        'Foundation is operational: live /api/search, typed contracts, a working shell, and real-data validation. The roadmap has moved to canonical reference resolution.',
      summaryPtBr:
        'A fundacao ja esta operacional: /api/search ao vivo, contratos tipados, shell funcional e validacao com dados reais. O roadmap agora entrou em resolucao canonica de referencia.',
      now:
        'Resolve statutes by alias, abbreviation, number, and year, then map provisions.',
      nowPtBr:
        'Resolver normas por alias, sigla, numero e ano, e depois mapear dispositivos.',
      next:
        'Expose document-first reader and grounding contracts for Valter and Juca.',
      nextPtBr:
        'Expor reader document-first e contratos de grounding para o Valter e para o Juca.',
      blockers: [
        'The current search baseline still indexes node text instead of canonical documents.',
        'Ambiguous legal citations still need dedicated resolution flows.',
      ],
      blockersPtBr: [
        'A baseline atual de busca ainda indexa texto de nos, nao documentos canonicos.',
        'Citacoes juridicas ambiguas ainda precisam de fluxos dedicados de resolucao.',
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
        'Direction is aligned, but production still starts with a reproducible local doctrine pipeline before any retrieval or synthesis claims.',
      summaryPtBr:
        'A direcao esta alinhada, mas o roadmap de producao ainda comeca por tornar o pipeline local de doutrina reproduzivel antes de qualquer claim de retrieval ou sintese.',
      now:
        'Regularize local paths, CLI behavior, and reproducible setup.',
      nowPtBr:
        'Regularizar paths locais, comportamento de CLI e setup reproduzivel.',
      next:
        'Measure doctrinal quality and define the artifact handoff into Valter.',
      nextPtBr:
        'Medir a qualidade doutrinaria e definir o handoff de artefatos para o Valter.',
      blockers: [
        'The pipeline still depends on creator-machine path regularization.',
        'Enrichment and retrieval quality still need explicit measurement.',
      ],
      blockersPtBr: [
        'O pipeline ainda depende da regularizacao de paths da maquina do criador.',
        'A qualidade de enrichment e retrieval ainda precisa ser medida explicitamente.',
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
