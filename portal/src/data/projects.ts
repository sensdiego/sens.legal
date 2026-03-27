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
  focus: string;
  focusPtBr: string;
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
    focus: 'jurisprudence',
    focusPtBr: 'jurisprudencia',
    description: 'Ecosystem jurisprudence backend - graph-led retrieval, reasoning, verification, and API/MCP access centered in Valter. Multi-tribunal corpus of 2.2M classified decisions across STJ, TJSP, TJPR, and TRF4.',
    descriptionPtBr: 'Backend de jurisprudencia do ecossistema - retrieval graph-led, reasoning, verificacao e acesso via API/MCP centralizados no Valter. Corpus multi-tribunal de 2,2M decisoes classificadas entre STJ, TJSP, TJPR e TRF4.',
    repo: 'https://github.com/sensdiego/Valter',
    status: 'dev',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Qdrant', 'Neo4j Aura', 'Redis'],
    docsUrl: 'https://valter.sens.legal',
    llms_txt_url: 'https://valter.sens.legal/llms.txt',
    roadmap: {
      currentStage: 9,
      totalStages: 10,
      currentStageLabel: 'Scale + public presence',
      currentStageLabelPtBr: 'Escala + presenca publica',
      summary:
        'v0.6.0 backend live with 50+ REST endpoints, 31 MCP tools, 50+ shipped features, and 1,900+ tests. Pipeline v2.1 operational with F0-F6 and cross-stage validation (check_1 through check_4). 2.2M decisions classified across TJPR (748K), TJSP (13.5K), and TRF4 (1.43M), with 5,310 fully processed in the production Neo4j graph (77,828 nodes, 128,021 edges, schema v2.1). Scale-up target: 800K decisions through the pipeline; long-term: 35M (all Brazilian tribunals). Judge profile catalog product launched with 7 endpoints. Entity resolution with legal provenance on SAME_AS edges. Similar cases expansion with free-text queries, graph scoring, and LLM narratives. TJPR 1st instance sentencas scraped and loaded (433 sentencas). AWS infrastructure exploration underway (NuageIT partnership). Accepted into the Neo4j for Startups program ($16K AuraDB Pro credits).',
      summaryPtBr:
        'O backend v0.6.0 esta no ar com 50+ endpoints REST, 31 tools MCP, 50+ features entregues e 1.900+ testes. Pipeline v2.1 operacional com F0-F6 e validacao cross-stage (check_1 a check_4). 2,2M decisoes classificadas entre TJPR (748K), TJSP (13,5K) e TRF4 (1,43M), com 5.310 totalmente processadas no grafo de producao Neo4j (77.828 nos, 128.021 edges, schema v2.1). Meta de scale-up: 800K decisoes pelo pipeline; longo prazo: 35M (todos os tribunais brasileiros). Produto de catalogo de perfil de juiz lancado com 7 endpoints. Entity resolution com proveniencia juridica nos edges SAME_AS. Expansao de casos similares com queries em texto livre, scoring de grafo e narrativas LLM. Sentencas de 1a instancia do TJPR coletadas e carregadas (433 sentencas). Exploracao de infraestrutura AWS em andamento (parceria NuageIT). Aceitos no programa Neo4j for Startups ($16K em creditos AuraDB Pro).',
      now:
        'Ship similar cases expansion to production. Scale entity resolution cross-tribunal with legal provenance. Plan AWS infrastructure migration (NuageIT partnership). OAuth 2.0 token flow for ChatGPT App Directory marketplace submission.',
      nowPtBr:
        'Entregar expansao de casos similares em producao. Escalar entity resolution cross-tribunal com proveniencia juridica. Planejar migracao de infraestrutura AWS (parceria NuageIT). Fluxo de token OAuth 2.0 para submissao ao marketplace do ChatGPT App Directory.',
      next:
        'Scale to 1.5M+ decisions in the multi-tribunal Neo4j graph. AWS deployment via NuageIT. Multi-tenancy and SLA guarantees for the public API. Cross-tribunal divergence detection.',
      nextPtBr:
        'Escalar para 1,5M+ decisoes no grafo multi-tribunal Neo4j. Deploy AWS via NuageIT. Multi-tenancy e garantias de SLA para a API publica. Deteccao de divergencias cross-tribunal.',
      blockers: [
        'OAuth 2.0 token flow pending completion for ChatGPT App Directory marketplace submission.',
        'AWS infrastructure migration planning underway — NuageIT partnership to be finalized.',
      ],
      blockersPtBr: [
        'Fluxo de token OAuth 2.0 pendente para submissao ao marketplace do ChatGPT App Directory.',
        'Planejamento de migracao de infraestrutura AWS em andamento — parceria NuageIT a ser finalizada.',
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
          description: 'Redesign Neo4j schema (11 labels, 15 qualified edges), 3-stage LLM extraction, multi-layer canonicalization, and scale from 23,400+ to 2.2M classified decisions across STJ, TJPR, TJSP, and TRF4. Neo4j for Startups partnership with $16K AuraDB Pro credits.',
          descriptionPtBr: 'Redesign do schema Neo4j (11 labels, 15 edges qualificados), extracao LLM em 3 estagios, canonicalizacao multi-camada e escala de 23.400+ para 2,2M decisoes classificadas entre STJ, TJPR, TJSP e TRF4. Parceria Neo4j for Startups com $16K em creditos AuraDB Pro.',
        },
        {
          title: 'Scale + public presence (v2.1)',
          titlePtBr: 'Escala + presenca publica (v2.1)',
          description: 'Scale from 5.3K to 800K+ decisions in the pipeline. ChatGPT App Directory submission with OAuth 2.0. AWS infrastructure migration (NuageIT partnership). Judge profile catalog and similar cases as first intelligence products. Multi-tenancy, SLA guarantees, and load testing.',
          descriptionPtBr: 'Escalar de 5,3K para 800K+ decisoes no pipeline. Submissao ao App Directory do ChatGPT com OAuth 2.0. Migracao de infraestrutura AWS (parceria NuageIT). Catalogo de perfil de juiz e casos similares como primeiros produtos de inteligencia. Multi-tenancy, garantias de SLA e testes de carga.',
        },
      ],
      updates: [
        {
          date: '2026-03-25',
          title: 'Entity resolution provenance and similar cases expansion (v0.5.0-v0.6.0)',
          titlePtBr: 'Proveniencia de entity resolution e expansao de casos similares (v0.5.0-v0.6.0)',
          summary: 'Legal provenance propagated to 487 SAME_AS synonym pairs with LLM enrichment. Similar cases expansion: free-text query support, real graph scoring factors in score_breakdown, relator enrichment via batch Cypher, and opt-in LLM narratives with corpus briefing. Schema truth sprint fixing Cypher alignment with Aura v2.1 schema. Synonym dict governance with stateless benchmark escape hatch.',
          summaryPtBr: 'Proveniencia juridica propagada para 487 pares de sinonimos SAME_AS com enriquecimento LLM. Expansao de casos similares: suporte a query em texto livre, fatores reais de scoring do grafo no score_breakdown, enriquecimento de relator via Cypher batch e narrativas LLM opt-in com briefing de corpus. Sprint de schema truth corrigindo alinhamento Cypher com schema Aura v2.1. Governanca do dicionario de sinonimos com escape hatch stateless para benchmark.',
        },
        {
          date: '2026-03-22',
          title: 'Judge profile catalog product surfaces shipped (v0.2.0-v0.4.1)',
          titlePtBr: 'Superficies de produto do catalogo de perfil de juiz entregues (v0.2.0-v0.4.1)',
          summary: '7 new product endpoints for judge profiling: catalog stats, freshness labels, enriched previews, conversion opportunities, comparison, change feed, and facet preservation. Criterio granularity normalization with 62 approved rules. Entity resolution eval harness and quick wins deployed. 26 PRs merged and 5 version bumps in one week.',
          summaryPtBr: '7 novos endpoints de produto para perfilamento de juiz: stats do catalogo, labels de freshness, previews enriquecidos, oportunidades de conversao, comparacao, change feed e preservacao de facetas. Normalizacao de granularidade de criterios com 62 regras aprovadas. Harness de avaliacao de entity resolution e quick wins deployados. 26 PRs merged e 5 bumps de versao em uma semana.',
        },
        {
          date: '2026-03-20',
          title: 'TJPR sentencas scraping and production hardening',
          titlePtBr: 'Scraping de sentencas TJPR e hardening de producao',
          summary: 'TJPR 1st instance sentencas scraped via combined DataJud+Qlik mode (50% hit rate on 814 processes), 433 sentencas loaded into Neo4j. DataJud enricher added for vara/sistema resolution across all 3,010 graph processes. Production hardening: startup/deploy path, external contracts, profile flow stabilization, and except-Exception catch-all elimination.',
          summaryPtBr: 'Sentencas de 1a instancia do TJPR coletadas via modo combinado DataJud+Qlik (50% de taxa de acerto em 814 processos), 433 sentencas carregadas no Neo4j. Enricher DataJud adicionado para resolucao de vara/sistema em todos os 3.010 processos do grafo. Hardening de producao: path de startup/deploy, contratos externos, estabilizacao de fluxo de perfil e eliminacao de catch-all except-Exception.',
        },
        {
          date: '2026-03-19',
          title: 'Autoresearch lab and cross-stage validation operational',
          titlePtBr: 'Laboratorio de autoresearch e validacao cross-stage operacional',
          summary: 'Autoresearch lab created for pipeline prompt optimization via Groq API (~$3.70, ~3.5M tokens, 30 experiments). Stage B polarity fix: 40%→96.7% accuracy in check_1 ($1.06 cost). Stage B check_2: baseline 63%→83% — root cause is missing repair_context, not prompt issues. Cross-stage validation (check_1 through check_4) operational on TJPR core1000. New MCP tool get_perfil_decisorio shipped (31 total) for judge profiling pivot.',
          summaryPtBr: 'Laboratorio de autoresearch criado para otimizacao de prompts do pipeline via Groq API (~$3,70, ~3,5M tokens, 30 experimentos). Fix de polaridade no Stage B: 40%→96,7% de acuracia no check_1 (custo $1,06). Stage B check_2: baseline 63%→83% — causa raiz e a falta de repair_context, nao problema de prompt. Validacao cross-stage (check_1 a check_4) operacional na TJPR core1000. Novo MCP tool get_perfil_decisorio entregue (31 total) para pivot de perfilamento de juiz.',
        },
        {
          date: '2026-03-17',
          title: 'Multi-tribunal corpus classified (2.2M decisions) and Neo4j for Startups',
          titlePtBr: 'Corpus multi-tribunal classificado (2,2M decisoes) e Neo4j for Startups',
          summary: 'Full corpus classification across TJPR (748K), TJSP (13.5K), and TRF4 (1.4M) completed with regex v2 + LLM curation. 17 shared clusters identified for cross-tribunal network. Batch scorecard, utility probes, and Aura diagnostic pack operational. Accepted into Neo4j for Startups program with $16K AuraDB Pro credits, 1:1 expert graph engineers, and co-marketing support.',
          summaryPtBr: 'Classificacao completa do corpus entre TJPR (748K), TJSP (13,5K) e TRF4 (1,4M) concluida com regex v2 + curacao LLM. 17 clusters compartilhados identificados para rede cross-tribunal. Scorecard de batch, probes de utilidade e pack diagnostico Aura operacionais. Aceitos no programa Neo4j for Startups com $16K em creditos AuraDB Pro, acesso 1:1 a engenheiros de grafo e suporte de co-marketing.',
        },
        {
          date: '2026-03-16',
          title: 'Pipeline de Peticoes project bootstrapped',
          titlePtBr: 'Projeto Pipeline de Peticoes inicializado',
          summary: '5-tier petition ingestion pipeline designed with 30+ issues across 7 EPICs (Infra, Tier 0-4, Validation, Batch). Targets 7K PDFs into the knowledge graph with PDF parsing, structural and semantic extraction, entity resolution, and Neo4j + Qdrant loading.',
          summaryPtBr: 'Pipeline de ingestao de peticoes em 5 tiers projetado com 30+ issues em 7 EPICs (Infra, Tier 0-4, Validacao, Batch). Meta de 7K PDFs no knowledge graph com parsing de PDF, extracao estrutural e semantica, entity resolution e carga Neo4j + Qdrant.',
        },
        {
          date: '2026-03-14',
          title: 'OAuth 2.0 Authorization Code Flow implemented',
          titlePtBr: 'OAuth 2.0 Authorization Code Flow implementado',
          summary: 'Full OAuthAuthorizationServerProvider with PKCE (no client secret), 3 tiers (Free: 25 tools/50 req/day, Pro: 30 tools/500 req/day), PostgreSQL backing with 8 new tables, and MCP marketplace-ready auth.',
          summaryPtBr: 'OAuthAuthorizationServerProvider completo com PKCE (sem client secret), 3 tiers (Free: 25 tools/50 req/dia, Pro: 30 tools/500 req/dia), backing PostgreSQL com 8 tabelas novas e auth pronta para marketplace MCP.',
        },
        {
          date: '2026-03-13',
          title: 'App Directory Phase 1 complete',
          titlePtBr: 'Fase 1 do App Directory concluida',
          summary: 'MCP tool annotations with human-readable descriptions, input_schema for all 30 tools, CORS hardening, and HTTPS on valter.legal. Added 42 tests and 780 LOC.',
          summaryPtBr: 'Anotacoes de tools MCP com descricoes legais, input_schema para todos os 30 tools, hardening de CORS e HTTPS no valter.legal. Adicionados 42 testes e 780 LOC.',
        },
        {
          date: '2026-03-12',
          title: 'Multi-tribunal scrapers and STJ ingestion started',
          titlePtBr: 'Scrapers multi-tribunal e ingestao STJ iniciados',
          summary: 'TRF4 and TJSP eproc scrapers added for case decision harvesting. STJ Dados Abertos download of 895 daily ZIPs started, targeting full corpus ingestion into data/stj.jsonl.',
          summaryPtBr: 'Scrapers de TRF4 e TJSP eproc adicionados para coleta de decisoes. Download do STJ Dados Abertos de 895 ZIPs diarios iniciado, mirando ingestao completa do corpus em data/stj.jsonl.',
        },
        {
          date: '2026-03-10',
          title: 'Juca cutover completed and public shell validated',
          titlePtBr: 'Cutover do Juca concluido e shell publico validado',
          summary: 'Migration phases 0-5 closed. juca-home validated on Railway with Valter as the canonical backend, /v1/chat returning 200 in production, and legacy legal backend routes pruned from Juca.',
          summaryPtBr: 'As fases 0-5 da migracao foram encerradas. O juca-home foi validado no Railway com o Valter como backend canonico, /v1/chat respondendo 200 em producao e as rotas juridicas legadas podadas do Juca.',
        },
        {
          date: '2026-03-11',
          title: 'Chat pipeline deployed to production',
          titlePtBr: 'Chat pipeline deployado em producao',
          summary: '3-stage LLM pipeline (draft, critics, revision) with SSE streaming deployed to Railway. Production health checks are green and public chat is serving the canonical flow.',
          summaryPtBr: 'Pipeline LLM de 3 estagios (draft, criticos, revisao) com streaming SSE deployado no Railway. Os health checks de producao estao verdes e o chat publico serve o fluxo canonico.',
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
    focus: 'interface',
    focusPtBr: 'interface',
    description: 'Frontend hub for lawyers and AI-assisted workflows. Shell-first over Valter as canonical backend. Progressive briefing (4-phase workflow) shipped. First intelligence product (judge profiling) live in the frontend.',
    descriptionPtBr: 'Hub frontend para advogados e fluxos assistidos por IA. Shell-first sobre o Valter como backend canonico. Briefing progressivo (workflow de 4 fases) entregue. Primeiro produto de inteligencia (perfilamento de juiz) no ar no frontend.',
    repo: 'https://github.com/sensdiego/juca',
    status: 'dev',
    stack: ['Next.js', 'React', 'TypeScript'],
    docsUrl: 'https://juca.sens.legal',
    llms_txt_url: 'https://juca.sens.legal/llms.txt',
    roadmap: {
      currentStage: 3,
      totalStages: 5,
      currentStageLabel: 'Polish and expand',
      currentStageLabelPtBr: 'Polimento e expansao',
      summary:
        'Progressive briefing (4-phase workflow: Diagnosis, Precedents, Risks, Delivery) is shipped with block system, PDF export, and Valter-backed data. Juca-to-Valter migration fully closed (SEN-616, SEN-617). First intelligence product (Perfil Decisorio — judge profiling) integrated with dedicated page and catalog-driven navigation. 42 legacy issues canceled, 2 projects closed. Next: polish hub workflows, production auth, and catalog UX expansion.',
      summaryPtBr:
        'O briefing progressivo (workflow de 4 fases: Diagnostico, Precedentes, Riscos, Entrega) foi entregue com sistema de blocos, exportacao PDF e dados do Valter. A migracao Juca→Valter foi totalmente encerrada (SEN-616, SEN-617). Primeiro produto de inteligencia (Perfil Decisorio — perfilamento de juiz) integrado com pagina dedicada e navegacao por catalogo. 42 issues legadas canceladas, 2 projetos fechados. Proximo: polir fluxos do hub, auth de producao e expansao de UX do catalogo.',
      now:
        'Polish judge profile catalog UX (end-to-end QA with real TJPR data). Replace temporary production auth bypass (ENABLE_DEV_AUTH=true). Expand catalog-driven navigation for intelligence products.',
      nowPtBr:
        'Polir UX do catalogo de perfil de juiz (QA end-to-end com dados reais do TJPR). Substituir bypass temporario de auth de producao (ENABLE_DEV_AUTH=true). Expandir navegacao catalog-driven para produtos de inteligencia.',
      next:
        'Multi-agent orchestration (Valter, Leci, future agents). Cost ledger and session security. PWA and expanded corpus coverage.',
      nextPtBr:
        'Orquestracao multiagente (Valter, Leci, futuros agentes). Ledger de custos e seguranca de sessao. PWA e cobertura de corpus expandida.',
      blockers: [
        'Production auth still needs to replace temporary ENABLE_DEV_AUTH=true on juca-home.',
        'Perfil Decisorio end-to-end QA with real TJPR data pending.',
      ],
      blockersPtBr: [
        'A auth de producao ainda precisa substituir o ENABLE_DEV_AUTH=true temporario no juca-home.',
        'QA end-to-end do Perfil Decisorio com dados reais do TJPR pendente.',
      ],
      stages: [
        {
          title: 'Hub foundation',
          titlePtBr: 'Fundacao do hub',
          description: 'Reset UI/UX with the Liquid Legal design system, complete the Valter cutover, and establish Juca as a shell-first frontend hub.',
          descriptionPtBr: 'Resetar UI/UX com o design system Liquid Legal, concluir o cutover para o Valter e estabelecer o Juca como hub frontend shell-first.',
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
          date: '2026-03-21',
          title: 'Perfil Decisorio UI and shell-only cutover finalized',
          titlePtBr: 'UI de Perfil Decisorio e cutover shell-only finalizado',
          summary: 'First intelligence product (judge profiling) integrated into Juca frontend with dedicated page and catalog-driven dropdown navigation. Shell-only cutover completed — all backend logic now lives in Valter. Linear cleanup session for project hygiene.',
          summaryPtBr: 'Primeiro produto de inteligencia (perfilamento de juiz) integrado ao frontend do Juca com pagina dedicada e navegacao por dropdown do catalogo. Cutover shell-only concluido — toda a logica de backend agora reside no Valter. Sessao de cleanup do Linear para higiene do projeto.',
        },
        {
          date: '2026-03-10',
          title: 'Shell-first cutover validated in production',
          titlePtBr: 'Cutover shell-first validado em producao',
          summary: 'juca-home was validated on Railway with Valter as the canonical backend. /api/v2/stream proxies /v1/chat, sessions persist valterConversationId, and legacy legal backend routes were pruned.',
          summaryPtBr: 'O juca-home foi validado no Railway com o Valter como backend canonico. O /api/v2/stream faz proxy para o /v1/chat, as sessoes persistem valterConversationId e as rotas juridicas legadas foram podadas.',
        },
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
    focus: 'legislation',
    focusPtBr: 'legislacao',
    description: 'Document-first legislation engine with live search and resolution APIs, reliable grounding, and structured statute retrieval for Valter and Juca.',
    descriptionPtBr: 'Engine legislativa document-first com APIs operacionais de busca e resolucao, grounding confiavel e recuperacao estruturada de normas para Valter e Juca.',
    repo: 'https://github.com/sensdiego/leci',
    status: 'dev',
    stack: ['Next.js', 'PostgreSQL', 'pgvector', 'Railway', 'TypeScript'],
    docsUrl: 'https://leci.sens.legal',
    llms_txt_url: 'https://leci.sens.legal/llms.txt',
    roadmap: {
      currentStage: 3,
      totalStages: 5,
      currentStageLabel: 'Reader and grounding contracts',
      currentStageLabelPtBr: 'Reader e contratos de grounding',
      summary:
        'Canonical document and provision resolution are complete, including the bulk citation resolution API for Valter. The next stage is exposing document-first reader flows, provision context, and grounding contracts for consumers.',
      summaryPtBr:
        'A resolucao canonica de documentos e dispositivos esta concluida, incluindo a API bulk de resolucao de citacoes para o Valter. A etapa seguinte e expor fluxos de reader document-first, contexto de dispositivos e contratos de grounding para os consumidores.',
      now:
        'Ship provision-context, deep-link, and reader flows on top of /api/resolve and /api/resolve-dispositivos.',
      nowPtBr:
        'Entregar contexto de dispositivos, deep-links e fluxos de reader sobre o /api/resolve e o /api/resolve-dispositivos.',
      next:
        'Publish grounding contracts for Valter and Juca, then move into ingestion and quality hardening.',
      nextPtBr:
        'Publicar contratos de grounding para Valter e Juca, depois avancar para ingestao e hardening de qualidade.',
      blockers: [
        'Provision context, deep-links, and reader endpoints still need to be exposed above the completed resolution layer.',
      ],
      blockersPtBr: [
        'Contexto de dispositivos, deep-links e endpoints de reader ainda precisam ser expostos sobre a camada de resolucao ja concluida.',
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
          date: '2026-03-25',
          title: 'Legislation acervo design spec and Valter handoff',
          titlePtBr: 'Design spec do acervo legislativo e handoff para Valter',
          summary: 'Design spec completed for legislation acervo integration with Valter, defining the contract for statute-level grounding. HANDOFF.md added for session continuity across development sessions.',
          summaryPtBr: 'Design spec concluido para integracao do acervo legislativo com o Valter, definindo o contrato para grounding no nivel de norma. HANDOFF.md adicionado para continuidade de sessao entre sessoes de desenvolvimento.',
        },
        {
          date: '2026-03-10',
          title: 'Bulk citation resolution API shipped',
          titlePtBr: 'API bulk de resolucao de citacoes entregue',
          summary: 'POST /api/resolve-dispositivos is live for Valter normalization, with batch deduplication, CPC/73 vs CPC/15 temporal override, and Railway-backed integration tests. Total automated coverage reached 310 tests.',
          summaryPtBr: 'O POST /api/resolve-dispositivos ja esta no ar para normalizacao no Valter, com deduplicacao em batch, override temporal entre CPC/73 e CPC/15 e testes de integracao apoiados no Railway. A cobertura automatizada total chegou a 310 testes.',
        },
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
    focus: 'doctrine',
    focusPtBr: 'doutrina',
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
        'Strategic realignment is done, but the immediate work is still foundational: regularize paths and CLI behavior, keep the local doctrine pipeline reproducible, and establish the baseline before quality gates.',
      summaryPtBr:
        'O realinhamento estrategico foi concluido, mas o trabalho imediato ainda e de fundacao: regularizar paths e CLI, manter o pipeline local de doutrina reproduzivel e estabelecer o baseline antes dos quality gates.',
      now:
        'Regularize paths and CLI behavior, remove creator-machine dependencies, and lock the local pipeline baseline.',
      nowPtBr:
        'Regularizar paths e comportamento de CLI, remover dependencias da maquina do criador e fechar o baseline do pipeline local.',
      next:
        'Measure doctrinal quality for contracts and civil procedure before defining the Valter handoff contract.',
      nextPtBr:
        'Medir a qualidade doutrinaria em contratos e processo civil antes de definir o contrato de handoff para o Valter.',
      blockers: [
        'Paths and CLI behavior still need regularization.',
        'Extraction and retrieval quality still need to be measured, not assumed.',
        'JSON flat artifacts remain transitional rather than a final delivery format.',
      ],
      blockersPtBr: [
        'Paths e comportamento de CLI ainda precisam de regularizacao.',
        'A qualidade de extracao e retrieval ainda precisa ser medida, nao presumida.',
        'Artefatos em JSON flat seguem como formato transitorio, nao entrega final.',
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

export const homeProjectOrder = ['Valter', 'Leci', 'Douto', 'Juca'] as const;

export const ecosystemContent = {
  home: {
    problem:
      "Frontier models reason well but can't generate reliable legal knowledge - they hallucinate citations, miss legal relationships, and offer no audit trail. As AI agents take on legal work, this gap becomes infrastructure-critical.",
    problemPtBr:
      'Modelos de fronteira raciocinam bem, mas nao conseguem gerar conhecimento juridico confiavel - alucinam citacoes, ignoram relacoes juridicas e nao oferecem rastreabilidade. A medida que agentes de IA assumem trabalho juridico, essa lacuna se torna um problema de infraestrutura.',
    answer:
      'sens.legal is that infrastructure. We index 2.2M court decisions across four Brazilian tribunals, expose 50+ REST endpoints and 31 MCP tools for agents, and verify every claim against a real knowledge graph — so no legal answer ships without evidence.',
    answerPtBr:
      'sens.legal e essa infraestrutura. Indexamos 2,2M decisoes de quatro tribunais brasileiros, expomos 50+ endpoints REST e 31 tools MCP para agentes, e verificamos toda alegacao contra um knowledge graph real — nenhuma resposta juridica sai sem evidencia.',
    projectsIntro:
      'Four projects, each handling a different dimension of legal knowledge:',
    projectsIntroPtBr:
      'Quatro projetos, cada um cobrindo uma dimensao diferente do conhecimento juridico:',
    roadmapDisclaimer:
      "Roadmap position is editorial rather than numeric certainty: it combines each project's progress file with roadmap or migration artifacts when those documents define the implementation stages more clearly.",
    roadmapDisclaimerPtBr:
      'A posicao no roadmap e editorial, nao uma porcentagem exata: ela combina o arquivo de progresso de cada projeto com roadmaps ou artefatos de migracao quando esses documentos definem melhor as etapas de implementacao.',
    architectureSummary:
      'The ecosystem connects four projects with Valter at the center of the backend. Juca concentrates the user experience; Leci and Douto provide legislative and doctrinal grounding; and LLM agents can connect through the canonical REST API and MCP surfaces.',
    architectureSummaryPtBr:
      'O ecossistema conecta quatro projetos com o Valter no centro do backend. Juca concentra a experiencia do usuario; Leci e Douto fornecem grounding legislativo e doutrinario; e agentes LLM podem entrar pelas superfices canonicas de REST API e MCP.',
    modelAgnostic:
      "The architecture is model-agnostic: any LLM connects through the same protocols. The value isn't in the model - it's in the traceability, auditability, and legal structure underneath.",
    modelAgnosticPtBr:
      'A arquitetura e model-agnostic: qualquer LLM se conecta pelos mesmos protocolos. O valor nao esta no modelo - esta na rastreabilidade, auditabilidade e estrutura juridica por baixo.',
    jurisdictions:
      'Built on Brazilian Civil Law. Designed to replicate across jurisdictions.',
    jurisdictionsPtBr:
      'Construido sobre o direito brasileiro. Projetado para replicar entre jurisdicoes.',
  },
  roadmap: {
    intro:
      'All projects remain in development. This page uses the same editorial roadmap snapshot shown on the home page, individual project pages, and GitHub landing page.',
    introPtBr:
      'Todos os projetos seguem em desenvolvimento. Esta pagina usa o mesmo snapshot editorial de roadmap que aparece na home, nas paginas individuais e na landing page do GitHub.',
    readingRule:
      "The reading rule is simple: start with each project's progress file, then use roadmap or migration artifacts when they define implementation phases more clearly than the progress log alone.",
    readingRulePtBr:
      'A regra de leitura e simples: comece pelo arquivo de progresso de cada projeto e complemente com roadmap ou artefato de migracao quando esses documentos definirem melhor as etapas de implementacao.',
    principles: [
      'Keep Valter as the canonical backend surface for jurisprudence, reasoning, REST, and MCP.',
      'Keep Juca focused on shell-first frontend workflows while Valter remains the canonical backend owner.',
      'Plug legislative and doctrinal grounding into the central backend through Leci and Douto.',
      'Keep all public surfaces synced to the same editorial snapshot instead of drifting by page.',
    ],
    principlesPtBr: [
      'Manter o Valter como surface canonica de backend para jurisprudencia, reasoning, REST e MCP.',
      'Manter o Juca focado nos fluxos frontend shell-first enquanto o Valter permanece como dono canonico do backend.',
      'Plugar grounding legislativo e doutrinario no backend central via Leci e Douto.',
      'Manter todas as superfices publicas sincronizadas ao mesmo snapshot editorial, sem drift entre paginas.',
    ],
  },
  governance: {
    checklist: [
      'Re-read the canonical progress file for each affected project.',
      'Read roadmap or migration artifacts when they define phases more clearly than the progress log alone.',
      'Update the shared snapshot in portal/src/data/projects.ts first, then review the README, home, roadmap, and project pages.',
      'Build the portal locally before pushing.',
      'Spot-check the published EN and PT-BR pages after deploy.',
    ],
    checklistPtBr: [
      'Reler o arquivo canonico de progresso de cada projeto afetado.',
      'Ler roadmap ou artefatos de migracao quando eles definirem as fases com mais clareza do que o log de progresso.',
      'Atualizar primeiro o snapshot compartilhado em portal/src/data/projects.ts e depois revisar README, home, roadmap e paginas individuais.',
      'Buildar o portal localmente antes do push.',
      'Fazer spot-check nas paginas publicadas em EN e PT-BR depois do deploy.',
    ],
    reviewRoutine: [
      'Trigger a public review whenever a project changes stage, closes a migration phase, or ships a new canonical API surface.',
      'Run a lightweight weekly sweep across Valter, Juca, Leci, and Douto even when no major launch happened.',
      'Treat homepage microcopy and roadmap notes as high-risk drift surfaces and verify them during every sweep.',
    ],
    reviewRoutinePtBr: [
      'Disparar revisao publica sempre que um projeto mudar de etapa, encerrar uma fase de migracao ou publicar uma nova surface canonica de API.',
      'Fazer uma varredura semanal leve em Valter, Juca, Leci e Douto mesmo quando nao houver grande lancamento.',
      'Tratar a microcopy da home e as notas do roadmap como superfices de alto risco para drift e revisa-las em toda varredura.',
    ],
  },
} as const;
