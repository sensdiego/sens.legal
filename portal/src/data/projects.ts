export interface ProjectRoadmapStage {
  title: string;
  titlePtBr: string;
  description: string;
  descriptionPtBr: string;
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
      currentStage: 7,
      totalStages: 10,
      currentStageLabel: 'Production stability',
      currentStageLabelPtBr: 'Estabilidade de producao',
      summary:
        'All 6 migration phases are done. Chat pipeline is live with 30 MCP tools and 7 Railway services online. Now stabilizing for v1.0 while planning the v2.0 graph reconstruction.',
      summaryPtBr:
        'Todas as 6 fases de migracao estao concluidas. Pipeline de chat ativo com 30 tools MCP e 7 servicos Railway online. Agora estabilizando para v1.0 enquanto planeja a reconstrucao do grafo v2.0.',
      now:
        'Finish v1.0 stability: HTTPS on valter.legal, Railway alerts, and production runbook.',
      nowPtBr:
        'Concluir estabilidade v1.0: HTTPS no valter.legal, alertas Railway e runbook de producao.',
      next:
        'v1.1 resilience: circuit breakers, connection pools, and weekly STJ ingestion.',
      nextPtBr:
        'Resiliencia v1.1: circuit breakers, connection pools e ingestao semanal do STJ.',
      blockers: [
        'HTTPS on valter.legal blocks App Directory submission.',
        'Pipeline v2.0 schema redesign awaiting review before execution.',
      ],
      blockersPtBr: [
        'HTTPS no valter.legal bloqueia submissao ao App Directory.',
        'Redesign de schema do Pipeline v2.0 aguardando revisao antes da execucao.',
      ],
      stages: [
        {
          title: 'Canonical triage',
          titlePtBr: 'Triagem canonica',
          description: 'Audit and classify all existing data assets from the Juca migration, establishing quality baselines and identifying gaps.',
          descriptionPtBr: 'Auditar e classificar todos os ativos de dados existentes da migracao do Juca, estabelecendo baselines de qualidade e identificando lacunas.',
        },
        {
          title: 'Schema + entity resolution',
          titlePtBr: 'Schema + entity resolution',
          description: 'Consolidate the Neo4j schema, resolve duplicate entities, and establish canonical identifiers across the knowledge graph.',
          descriptionPtBr: 'Consolidar o schema Neo4j, resolver entidades duplicadas e estabelecer identificadores canonicos no knowledge graph.',
        },
        {
          title: 'Graph-led retrieval',
          titlePtBr: 'Graph-led retrieval',
          description: 'Implement graph-guided search combining knowledge graph traversal with BM25 and cross-encoder reranking for precision.',
          descriptionPtBr: 'Implementar busca guiada por grafo combinando travessia de knowledge graph com BM25 e reranking cross-encoder para precisao.',
        },
        {
          title: 'Unified pipeline + reasoning',
          titlePtBr: 'Pipeline unificado + reasoning',
          description: 'Merge retrieval, reasoning, and verification into a single pipeline with extended MCP tool coverage.',
          descriptionPtBr: 'Unificar retrieval, reasoning e verificacao em um unico pipeline com cobertura ampliada de tools MCP.',
        },
        {
          title: 'Chat orchestration',
          titlePtBr: 'Orquestracao de chat',
          description: 'Build a multi-stage LLM chat pipeline with draft, critics, and revision phases plus real-time SSE streaming.',
          descriptionPtBr: 'Construir pipeline de chat LLM multi-estagio com fases de draft, criticos e revisao, mais streaming SSE em tempo real.',
        },
        {
          title: 'Juca backend cutover',
          titlePtBr: 'Cutover do backend do Juca',
          description: 'Complete the final migration of all backend responsibilities from Juca to Valter, enabling Juca to operate as a pure frontend hub.',
          descriptionPtBr: 'Concluir a migracao final de todas as responsabilidades de backend do Juca para o Valter, permitindo que o Juca opere como hub frontend puro.',
        },
        {
          title: 'Production stability (v1.0)',
          titlePtBr: 'Estabilidade de producao (v1.0)',
          description: 'HTTPS, monitoring alerts to Slack, production runbook, R2 canary rollout, and public policies (privacy, terms).',
          descriptionPtBr: 'HTTPS, alertas de monitoramento para Slack, runbook de producao, canary rollout R2 e politicas publicas (privacidade, termos).',
        },
        {
          title: 'Resilience (v1.1)',
          titlePtBr: 'Resiliencia (v1.1)',
          description: 'Circuit breakers for Qdrant/Neo4j, connection pools, weekly automated STJ ingestion, search fallback extraction, and PT-BR stopwords expansion.',
          descriptionPtBr: 'Circuit breakers para Qdrant/Neo4j, connection pools, ingestao semanal automatizada do STJ, extracao de fallback de busca e expansao de stopwords PT-BR.',
        },
        {
          title: 'Graph reconstruction (v2.0)',
          titlePtBr: 'Reconstrucao do grafo (v2.0)',
          description: 'Redesign Neo4j schema (11 labels, 15 qualified edges), 3-stage LLM extraction, multi-layer canonicalization, and scale from 3,673 to 1.5M decisions with multi-tribunal support.',
          descriptionPtBr: 'Redesign do schema Neo4j (11 labels, 15 edges qualificados), extracao LLM em 3 estagios, canonicalizacao multi-camada e escala de 3.673 para 1,5M decisoes com suporte multi-tribunal.',
        },
        {
          title: 'Scale + public presence (v2.1)',
          titlePtBr: 'Escala + presenca publica (v2.1)',
          description: 'ChatGPT App Directory submission, MCP remote hardening, multi-tenancy, SLA guarantees, and load testing.',
          descriptionPtBr: 'Submissao ao App Directory do ChatGPT, hardening MCP remoto, multi-tenancy, garantias de SLA e testes de carga.',
        },
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
          date: '2026-03-10',
          title: 'Pipeline v2.0 brainstorming structured',
          titlePtBr: 'Brainstorming do Pipeline v2.0 estruturado',
          summary: '24 issues created for graph reconstruction: schema-first approach, 11 labels, 15 qualified edges, 3-stage LLM extraction, scale to 1.5M decisions.',
          summaryPtBr: '24 issues criadas para reconstrucao do grafo: abordagem schema-first, 11 labels, 15 edges qualificados, extracao LLM em 3 estagios, escala para 1,5M decisoes.',
        },
        {
          date: '2026-03-09',
          title: 'Unified pipeline + 30 MCP tools',
          titlePtBr: 'Pipeline unificado + 30 tools MCP',
          summary: 'Validated PRD merged, 73 new tests, 30 MCP tools operational, and incremental ranking improvement (+0.017 nDCG).',
          summaryPtBr: 'PRD validado mergeado, 73 novos testes, 30 tools MCP operacionais e melhoria incremental de ranking (+0.017 nDCG).',
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
        'v0.2 design system is complete and the UI/UX reset is done. Now building v0.3: Valter integration via adapter layer to complete the hub foundation.',
      summaryPtBr:
        'O design system v0.2 esta completo e o reset de UI/UX esta feito. Agora construindo v0.3: integracao com Valter via adapter layer para completar a fundacao do hub.',
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
        {
          title: 'Hub foundation',
          titlePtBr: 'Fundacao do hub',
          description: 'Reset UI/UX with the Liquid Legal design system, integrate Valter via adapter layer, and establish the hub architecture.',
          descriptionPtBr: 'Resetar UI/UX com o design system Liquid Legal, integrar Valter via adapter layer e estabelecer a arquitetura do hub.',
        },
        {
          title: 'Progressive briefing',
          titlePtBr: 'Briefing progressivo',
          description: 'Implement a 4-phase briefing workflow (Diagnosis, Precedents, Risks, Delivery) consuming Valter as the backend.',
          descriptionPtBr: 'Implementar workflow de briefing em 4 fases (Diagnostico, Precedentes, Riscos, Entrega) consumindo o Valter como backend.',
        },
        {
          title: 'Polish and expand',
          titlePtBr: 'Polimento e expansao',
          description: 'Stabilize graph capabilities, resolve technical debt, add advanced selection criteria, and export legal memo formats.',
          descriptionPtBr: 'Estabilizar capacidades de grafo, resolver divida tecnica, adicionar criterios avancados de selecao e exportar formatos de memo juridico.',
        },
        {
          title: 'Multi-agent platform',
          titlePtBr: 'Plataforma multiagente',
          description: 'Expand the hub to orchestrate multiple agents (Valter, Leci, future agents), implement cost ledger and session security.',
          descriptionPtBr: 'Expandir o hub para orquestrar multiplos agentes (Valter, Leci, futuros agentes), implementar ledger de custos e seguranca de sessao.',
        },
        {
          title: 'Platform release',
          titlePtBr: 'Release de plataforma',
          description: 'Production-ready product with multi-tenancy, PWA, expanded corpus coverage, and complete documentation.',
          descriptionPtBr: 'Produto pronto para producao com multi-tenancy, PWA, cobertura de corpus expandida e documentacao completa.',
        },
      ],
      updates: [
        {
          date: '2026-03-09',
          title: 'Zustand removal and codebase cleanup',
          titlePtBr: 'Remocao do Zustand e limpeza do codebase',
          summary: 'Zustand fully removed (0 imports). Duplicated documentation cleaned up. All open PRs merged successfully.',
          summaryPtBr: 'Zustand completamente removido (0 imports). Documentacao duplicada limpa. Todos os PRs abertos mergeados com sucesso.',
        },
        {
          date: '2026-03-07',
          title: 'Design system v0.2 complete',
          titlePtBr: 'Design system v0.2 completo',
          summary: 'Liquid Legal UI/UX design system fully implemented: tokens, base components, shell layout, Composer, message blocks, and responsiveness.',
          summaryPtBr: 'Design system Liquid Legal UI/UX totalmente implementado: tokens, componentes base, shell layout, Composer, blocos de mensagem e responsividade.',
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
        'Provision resolution is underway: canonical provision IDs, a citation parser for free-form legal references, and a provision resolver with database-backed segment validation are implemented. Bulk API for Valter is next.',
      summaryPtBr:
        'A resolucao de dispositivos esta em andamento: IDs canonicos de dispositivo, parser de citacoes juridicas em texto livre e resolver de dispositivos com validacao por segmento no banco estao implementados. API bulk para o Valter e o proximo passo.',
      now:
        'Build the bulk resolution API for Valter integration and finish the provision resolution track.',
      nowPtBr:
        'Construir a API bulk de resolucao para integracao com o Valter e finalizar a trilha de resolucao de dispositivos.',
      next:
        'Expose document-first reader and grounding contracts for Valter and Juca.',
      nextPtBr:
        'Expor reader document-first e contratos de grounding para o Valter e para o Juca.',
      blockers: [
        'Bulk API depends on provision resolver integration tests with Railway database.',
      ],
      blockersPtBr: [
        'A API bulk depende de testes de integracao do provision resolver com o banco Railway.',
      ],
      stages: [
        {
          title: 'Foundation API and setup reliability',
          titlePtBr: 'Fundacao de API e confiabilidade de setup',
          description: 'Launch /api/search with PostgreSQL FTS, validate response contracts, and establish the Railway deployment pipeline.',
          descriptionPtBr: 'Lancar /api/search com PostgreSQL FTS, validar contratos de resposta e estabelecer o pipeline de deploy no Railway.',
        },
        {
          title: 'Canonical legal reference resolution',
          titlePtBr: 'Resolucao canonica de referencia juridica',
          description: 'Resolve statutes by alias, abbreviation, number, and year. Map provisions (articles, paragraphs, items) within resolved documents.',
          descriptionPtBr: 'Resolver normas por alias, sigla, numero e ano. Mapear dispositivos (artigos, paragrafos, incisos) dentro dos documentos resolvidos.',
        },
        {
          title: 'Reader and grounding contracts',
          titlePtBr: 'Reader e contratos de grounding',
          description: 'Expose a document-first reader and grounding contracts for Valter and Juca integration.',
          descriptionPtBr: 'Expor reader document-first e contratos de grounding para integracao com Valter e Juca.',
        },
        {
          title: 'Ingestion, quality, and advanced retrieval',
          titlePtBr: 'Ingestao, qualidade e retrieval avancado',
          description: 'Scale legislation ingestion, measure retrieval quality, and implement advanced search capabilities.',
          descriptionPtBr: 'Escalar ingestao de legislacao, medir qualidade de retrieval e implementar capacidades avancadas de busca.',
        },
        {
          title: 'Ecosystem stability and rollout',
          titlePtBr: 'Estabilidade e rollout no ecossistema',
          description: 'Stabilize API contracts, ensure production reliability, and complete ecosystem integration.',
          descriptionPtBr: 'Estabilizar contratos de API, garantir confiabilidade em producao e completar a integracao no ecossistema.',
        },
      ],
      updates: [
        {
          date: '2026-03-10',
          title: 'Provision resolver with database-backed validation',
          titlePtBr: 'Resolver de dispositivos com validacao no banco',
          summary: 'Provision resolver combines citation parser with document resolver, validates each segment (article, paragraph, inciso) against the database via dynamic JOIN chains. Failure diagnosis pinpoints exactly where resolution breaks.',
          summaryPtBr: 'Resolver de dispositivos combina parser de citacoes com resolver de documentos, valida cada segmento (artigo, paragrafo, inciso) no banco via cadeias de JOIN dinamicas. Diagnostico de falha aponta exatamente onde a resolucao quebra.',
        },
        {
          date: '2026-03-10',
          title: 'Citation parser for free-form legal references',
          titlePtBr: 'Parser de citacoes para referencias juridicas em texto livre',
          summary: 'Parses free-form citations like "art. 535, II, do CPC" into structured provisions. Handles direct and inverted forms, article enumeration, inciso/alinea, paragraphs, and caput.',
          summaryPtBr: 'Parseia citacoes em texto livre como "art. 535, II, do CPC" em dispositivos estruturados. Trata formas diretas e invertidas, enumeracao de artigos, inciso/alinea, paragrafos e caput.',
        },
        {
          date: '2026-03-10',
          title: 'Canonical provision identifier format',
          titlePtBr: 'Formato canonico de identificador de dispositivo',
          summary: 'Extended the document ID format to provision level: lo:10406:2002:art:186:par:1:inc:2:al:a. Build, parse, and validate functions with hierarchy enforcement and roundtrip tests.',
          summaryPtBr: 'Formato de ID de documento estendido ao nivel de dispositivo: lo:10406:2002:art:186:par:1:inc:2:al:a. Funcoes de build, parse e validacao com enforcement de hierarquia e testes de roundtrip.',
        },
        {
          date: '2026-03-09',
          title: 'Canonical document resolution complete',
          titlePtBr: 'Resolucao canonica de documentos completa',
          summary: 'Canonical document ID format, normalizer, 19-norm alias registry, confidence-scored resolver, and /api/resolve v0 endpoint shipped. 185 tests passing.',
          summaryPtBr: 'Formato canonico de ID de documento, normalizador, registro de alias de 19 normas, resolver com score de confianca e endpoint /api/resolve v0 entregues. 185 testes passando.',
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
        'The reproducible foundation stage is complete. Now entering the doctrinal quality gate to measure extraction pipeline output.',
      summaryPtBr:
        'O estagio de fundacao reproduzivel esta completo. Agora entrando no quality gate doutrinario para medir a saida do pipeline de extracao.',
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
        {
          title: 'Reproducible foundation',
          titlePtBr: 'Fundacao reproduzivel',
          description: 'Remove dependency on creator\'s machine, establish reliable local pipeline with normalized paths and CLI behavior.',
          descriptionPtBr: 'Remover dependencia da maquina do criador, estabelecer pipeline local confiavel com paths normalizados e comportamento de CLI.',
        },
        {
          title: 'Doctrinal quality gate',
          titlePtBr: 'Quality gate doutrinario',
          description: 'Measure if contract law and civil procedure content meets quality thresholds for retrieval and synthesis.',
          descriptionPtBr: 'Medir se o conteudo de direito contratual e processo civil atende aos limiares de qualidade para retrieval e sintese.',
        },
        {
          title: 'Artifact handoff contract to Valter',
          titlePtBr: 'Contrato de handoff de artefatos para o Valter',
          description: 'Define what Douto delivers: semantics, identifiers, coverage, and provenance metadata.',
          descriptionPtBr: 'Definir o que o Douto entrega: semantica, identificadores, cobertura e metadados de proveniencia.',
        },
        {
          title: 'Explainable retrieval',
          titlePtBr: 'Retrieval explicavel',
          description: 'Transition from local CLI search to reusable, explainable retrieval ready for controlled handoff.',
          descriptionPtBr: 'Transicionar de busca CLI local para retrieval reutilizavel e explicavel, pronto para handoff controlado.',
        },
        {
          title: 'Gated synthesis',
          titlePtBr: 'Sintese com gate proprio',
          description: 'Generate brainstorm and novel theses without hiding limitations or presenting inference as established fact.',
          descriptionPtBr: 'Gerar brainstorm e teses ineditas sem esconder limitacoes ou apresentar inferencia como fato estabelecido.',
        },
      ],
      updates: [
        {
          date: '2026-03-07',
          title: 'Strategic and operational realignment',
          titlePtBr: 'Realinhamento estrategico e operacional',
          summary: 'Douto repositioned as internal doctrine pipeline for Valter (not standalone product). Focus on contract law and civil procedure, with governance rules prioritizing accuracy over speed.',
          summaryPtBr: 'Douto reposicionado como pipeline interno de doutrina para o Valter (nao produto standalone). Foco em direito contratual e processo civil, com regras de governanca priorizando precisao sobre velocidade.',
        },
      ],
    },
  },
];
