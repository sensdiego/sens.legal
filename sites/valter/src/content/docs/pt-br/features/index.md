---
title: Funcionalidades
description: Matriz completa de funcionalidades do Valter com status de implementacao, organizada por dominio.
sidebar:
  order: 1
lang: pt-BR
---

# Funcionalidades

O Valter conta com 33 funcionalidades implementadas abrangendo busca, analise de grafo, integracao com LLMs, processamento de documentos, verificacao e infraestrutura. Esta pagina apresenta a matriz completa e links para a documentacao detalhada de cada dominio.

## Matriz de Funcionalidades

| Funcionalidade | Status | Endpoint / Modulo | Docs |
|----------------|--------|--------------------|------|
| Busca Hibrida | Implementado | `POST /v1/retrieve` | [Busca Hibrida](hybrid-search/) |
| Graph Analytics (12 endpoints) | Implementado | `POST /v1/graph/*` | [Graph Analytics](graph-analytics/) |
| MCP Server (28 tools) | Implementado | stdio + HTTP/SSE | [MCP Server](mcp-server/) |
| Workflow de Ingestao (17 endpoints) | Implementado | `POST /v1/ingest/*` | [Workflow de Ingestao](ingestion-workflow/) |
| Verificacao e Enriquecimento | Implementado | `POST /v1/verify`, `/v1/enrich` | [Verificacao e Enriquecimento](verification-enrichment/) |
| Observabilidade | Implementado | `/metrics`, structlog, OTel | [Observabilidade](observability/) |
| Cadeia de Raciocinio Juridico | Planejado (v1.2) | `POST /v1/reasoning-chain` | [Cadeia de Raciocinio](reasoning-chain/) |

## Por Dominio

### Busca e Retrieval

A busca e a interface principal de consulta do Valter. Ela combina multiplas estrategias em um unico pipeline que supera abordagens baseadas apenas em palavras-chave ou apenas em vetores.

- **Busca Hibrida** -- BM25 lexical + vetores semanticos (Qdrant) + boost de KG (Neo4j), com estrategias de merge ponderado e RRF. Endpoint: `POST /v1/retrieve`.
- **Busca Dual-Vector** -- Codifica fatos e tese separadamente, produzindo um relatorio de divergencia. Endpoint: `POST /v1/factual/dual-search`.
- **Query Expansion** -- RAG multi-query via Groq LLM gera ate 3 variantes de termos juridicos por consulta. Integrado ao retriever.
- **Cross-Encoder Reranking** -- Reordena os melhores resultados usando um modelo cross-encoder (local ou hospedado no Railway). Integrado ao retriever.
- **Feature Search** -- 9 filtros combinaveis sobre 21 campos extraidos por IA (categorias, resultado, tipo_decisao, argumento_vencedor, etc.). Endpoint: `POST /v1/search/features`.
- **Paginacao Cursor-Based** -- Paginacao com cursor opaco nos endpoints de listagem.

Veja [Busca Hibrida](hybrid-search/) para detalhes completos do pipeline.

### Knowledge Graph

O knowledge graph no Neo4j contem decisoes, criterios, dispositivos legais, precedentes, ministros e categorias conectados por tipos de relacionamento como CITA, APLICA, DIVERGE_DE e RELATOR_DE.

- **12 endpoints de graph analytics** sob `POST /v1/graph/*`
- **Deteccao de divergencias** entre ministros sobre criterios juridicos especificos
- **Composicao de argumento otimo** com taxas de sucesso por categoria e resultado
- **Rastreamento de evolucao temporal** de criterios ao longo do tempo com analise de tendencia
- **Perfil de ministro** com padroes de decisao, divergencias e principais precedentes
- **PageRank, comunidades, citacoes** para analise estrutural do grafo
- **Similaridade estrutural, caminho mais curto, graph embeddings** para comparacao avancada de casos

Veja [Graph Analytics](graph-analytics/) para a referencia completa de endpoints.

### Integracao com LLMs (MCP)

O Valter expoe todas as suas capacidades como 28 tools do Model Context Protocol, permitindo que qualquer LLM compativel com MCP atue como assistente de pesquisa juridica.

- **28 MCP tools** organizadas em dominios de conhecimento, grafo e workflow
- **stdio server** para Claude Desktop e Claude Code (`python -m valter.mcp`)
- **HTTP/SSE remote server** para ChatGPT e outros clientes remotos (`make mcp-remote`, porta 8001)
- **Autenticacao por API key + HMAC** para transporte remoto
- **Rate limiting** por API key com limites por minuto configuraveis

Veja [MCP Server](mcp-server/) para categorias de tools e instrucoes de setup.

### Processamento de Documentos

O workflow de ingestao transforma um PDF bruto de processo em uma analise juridica estruturada com identificacao de fases, matching de jurisprudencia e sugestoes revisadas por humanos.

- **Workflow completo de caso** com 17 endpoints sob `/v1/ingest/*`
- **Pipeline PROJUDI** para extracao de processos de primeira instancia (segmentacao, classificacao, scoring de confianca)
- **Analise de fases** via 5 modulos centrais (interpreter, matcher, rules, recommender, jurisprudence)
- **Maquina de estados** com transicoes validadas e eventos auditaveis em formato JSONL
- **Revisao human-in-the-loop** nos niveis de fase e final, com reprocessamento imutavel
- **Armazenamento de artefatos** via filesystem local ou Cloudflare R2 com rollout canary deterministico

Veja [Workflow de Ingestao](ingestion-workflow/) para a descricao completa do pipeline.

### Verificacao e Inteligencia

Essas funcionalidades garantem que as referencias juridicas usadas por LLMs e frontends sejam precisas e contextualmente enriquecidas.

- **Verificacao anti-alucinacao** valida sumulas (STJ/STF), nomes de ministros, numeros de processo (formato CNJ) e referencias legislativas contra datasets conhecidos
- **Analise IRAC** classifica o texto da decisao em Issue, Rule, Application e Conclusion usando padroes heuristicos de regex
- **Enriquecimento via KG** adiciona criterios, dispositivos legais, precedentes e legislacao a partir do grafo Neo4j
- **Extracao factual** via Groq LLM produz resumos factuais estruturados e tese juridica para busca dual-vector
- **Validade temporal** verifica se as normas juridicas referenciadas ainda estao em vigor

Veja [Verificacao e Enriquecimento](verification-enrichment/) para detalhes de implementacao.

### Infraestrutura

- **Autenticacao por API key + escopos + auditoria** com chaves em hash, permissoes por path e logging de auditoria persistente
- **Rate limiting** via Redis sliding window por API key (tanto na REST API quanto no MCP)
- **Observabilidade** com logging JSON via structlog, 30+ metricas Prometheus e tracing OpenTelemetry
- **CI/CD** via GitHub Actions (lint, test, validacao Aura)
- **Deploy no Railway** para API, worker e MCP remote server
- **Memoria de sessao** com armazenamento key-value com TTL (60s a 30 dias) no PostgreSQL

Veja [Observabilidade](observability/) para detalhes de monitoramento.
