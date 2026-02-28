---
title: Referencia de MCP Tools
description: Referencia completa para todas as 28 MCP tools — parametros, tipos de retorno e exemplos de uso para integracao com Claude e ChatGPT.
lang: pt-BR
sidebar:
  order: 7

---

# Referencia de MCP Tools

Referencia completa para todas as 28 MCP tools expostas pelo servidor Model Context Protocol do Valter.

## Visao Geral

O Valter registra 28 tools em seu servidor MCP, disponiveis em dois modos de transporte:

| Transporte | Cliente | Protocolo |
|---|---|---|
| **stdio** | Claude Desktop, Claude Code | JSON-RPC via stdin/stdout |
| **HTTP/SSE** | ChatGPT (via MCP remoto), clientes customizados | HTTP POST com Server-Sent Events |

Cada tool possui nome, descricao, definicao de input via JSON Schema e um handler assincrono. As tools sao rate-limited por `VALTER_MCP_RATE_LIMIT_PER_MINUTE` (padrao: 60).

A autenticacao depende do transporte: API key para modo stdio, HMAC para modo HTTP.

## Tools de Search

### search_jurisprudence

Recuperacao de jurisprudencia via texto livre sobre decisoes do STJ usando busca hibrida BM25 + semantica. Comece por esta tool quando precisar de casos candidatos antes de chamar outras tools.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `query` | `string` | sim | -- | Consulta juridica em linguagem natural em portugues |
| `top_k` | `integer` | nao | `10` | Numero de resultados (1-100) |
| `strategy` | `string` | nao | `"weighted"` | Scoring: `weighted`, `rrf`, `bm25`, `semantic` |
| `include_kg` | `boolean` | nao | `false` | Aplicar boost de relevancia via knowledge graph |
| `rerank` | `boolean` | nao | `false` | Aplicar reranking com cross-encoder |
| `expand_query` | `boolean` | nao | `true` | Expandir query com variantes juridicas geradas por LLM (+500-1500ms) |
| `ministro` | `string` | nao | -- | Filtro por nome do ministro (normalizado para maiusculas, pos-recuperacao) |
| `data_inicio` | `string` | nao | -- | Filtro de data inicial (YYYYMMDD, pos-recuperacao) |
| `data_fim` | `string` | nao | -- | Filtro de data final (YYYYMMDD, pos-recuperacao) |
| `include_stj_metadata` | `boolean` | nao | `false` | Incluir metadados do STJ via consulta extra ao PostgreSQL |
| `page_size` | `integer` | nao | -- | Tamanho da pagina para paginacao por cursor (1-50, <= top_k) |
| `cursor` | `string` | nao | -- | Cursor de continuacao da pagina anterior |

**Retorna:** Decisoes ranqueadas com scores, total_found, latencia, status de cache.

**Mapeia para:** `POST /v1/retrieve`

### verify_legal_claims

Valida referencias juridicas em texto contra dados de referencia locais. Usa extracao por regex e indices de referencia em memoria.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `text` | `string` | sim | -- | Texto contendo referencias juridicas a verificar |
| `check_sumulas` | `boolean` | nao | `true` | Validar sumulas contra dados de referencia STJ/STF |
| `check_ministros` | `boolean` | nao | `true` | Validar nomes de ministros |
| `check_processos` | `boolean` | nao | `true` | Validar apenas o formato de numero de processo CNJ |
| `check_legislacao` | `boolean` | nao | `true` | Extrair/classificar mencoes a legislacao |

**Retorna:** Resultados de verificacao por referencia e metricas de risco de alucinacao.

**Mapeia para:** `POST /v1/verify`

### get_irac_analysis

Executa analise IRAC heuristica (baseada em regex) e carrega contexto do knowledge graph para um documento juridico.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `document_id` | `string` | sim | ID do documento (obtenha via `search_jurisprudence` primeiro) |

**Retorna:** Labels IRAC (Issue, Rule, Application, Conclusion) e contagens de entidades do KG.

**Mapeia para:** `POST /v1/context/enrich`

### find_similar_cases

Encontra casos similares a uma decisao usando 70% semantica + 30% sobreposicao estrutural do KG.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `document_id` | `string` | sim | -- | ID do documento de origem |
| `top_k` | `integer` | nao | `10` | Numero de casos similares (1-100) |
| `include_structural` | `boolean` | nao | `true` | Incluir similaridade estrutural do KG |

**Retorna:** Casos similares ranqueados com scores. Em caso de timeout com modo estrutural, faz retry apenas com semantica.

**Mapeia para:** `POST /v1/similar_cases`

### get_document_integra

Recupera o texto completo (inteiro teor) de uma decisao especifica do STJ.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `document_id` | `string` | sim | ID do documento (obtenha via search primeiro) |

**Retorna:** ementa, tese, razoes_decidir e texto_completo (quando disponivel). Verifique `has_integra` nos resultados de search antes de chamar.

### search_features

Busca estruturada sobre features de documentos extraidas por IA com filtros combinados via AND. `categorias` usa semantica OR/ANY; a maioria dos filtros escalares sao exatos e case-sensitive; `argumento_vencedor`/`argumento_perdedor` usam matching parcial case-insensitive.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `categorias` | `string[]` | nao | -- | Filtro de categorias (semantica OR) |
| `dispositivo_norma` | `string` | nao | -- | Filtro de dispositivo legal |
| `resultado` | `string` | nao | -- | Filtro de resultado (exato) |
| `unanimidade` | `boolean` | nao | -- | Filtro de decisao unanime |
| `tipo_decisao` | `string` | nao | -- | Tipo de decisao (exato) |
| `tipo_recurso` | `string` | nao | -- | Tipo de recurso (exato) |
| `ministro_relator` | `string` | nao | -- | Ministro relator (exato) |
| `argumento_vencedor` | `string` | nao | -- | Texto do argumento vencedor (ILIKE) |
| `argumento_perdedor` | `string` | nao | -- | Texto do argumento perdedor (ILIKE) |
| `limit` | `integer` | nao | `20` | Maximo de resultados (1-100) |
| `offset` | `integer` | nao | `0` | Offset de paginacao |

**Retorna:** Features completas e campos de resumo do documento.

**Mapeia para:** `POST /v1/search/features`

## Tools de Graph

### get_divergencias

Encontra criterios juridicos com resultados divididos, computa `divergence_score = minority / total` e classifica clusters.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `categoria_id` | `string` | nao | -- | Filtro exato por ID de categoria |
| `limit` | `integer` | nao | `10` | Maximo de clusters (1-50) |

**Retorna:** Clusters de divergencia ranqueados por score (divisoes equilibradas recebem o score mais alto).

### get_turma_divergences

Analisa resultados divididos para criterios que correspondem a um tema juridico, agregados por ministro.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `tema` | `string` | sim | Match por substring do tema nos nomes de criterios (case-insensitive) |

**Retorna:** Contagens de resultados por ministro para criterios correspondentes.

### get_optimal_argument

Computa taxas de sucesso de argumentos (criterios, dispositivos, precedentes) para uma categoria e resultado desejado.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `categoria_id` | `string` | sim | -- | ID da categoria juridica |
| `resultado_desejado` | `string` | nao | `"provido"` | Resultado alvo |
| `tipo_argumento` | `string` | nao | `"all"` | Filtro: `criterio`, `dispositivo`, `precedente`, `all` |
| `min_decisions` | `integer` | nao | `2` | Minimo de decisoes de suporte (piso: 2) |
| `top_k` | `integer` | nao | `10` | Maximo de argumentos retornados (1-50, maximo efetivo ~11) |

**Retorna:** Cadeia de argumentos com taxas de sucesso por tipo de argumento.

### get_optimal_argument_by_ministro

Compara taxas de sucesso especificas do ministro com as medias da categoria.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `categoria_id` | `string` | sim | -- | ID da categoria juridica |
| `ministro` | `string` | sim | -- | Nome do ministro (auto-maiusculas) |
| `resultado_desejado` | `string` | nao | `"provido"` | Resultado alvo |
| `tipo_argumento` | `string` | nao | `"all"` | Filtro de tipo de argumento |
| `min_decisions` | `integer` | nao | `1` | Minimo de decisoes do ministro |
| `min_category_decisions` | `integer` | nao | `2` | Minimo de suporte na categoria (piso: 2) |
| `top_k` | `integer` | nao | `10` | Maximo de argumentos (1-50, maximo efetivo ~20) |

**Retorna:** Delta por argumento, recommended_arguments (delta > 0), avoid_arguments (delta < -0.1).

### get_ministro_profile

Carrega o perfil de comportamento judicial de um ministro a partir do knowledge graph.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `ministro` | `string` | sim | -- | Nome do ministro (auto-maiusculas) |
| `include_divergencias` | `boolean` | nao | `true` | Incluir divergencias com pares |
| `include_precedentes` | `boolean` | nao | `true` | Incluir decisoes mais citadas |
| `limit_criterios` | `integer` | nao | `10` | Limite de criterios na resposta (limite do store: 10) |

**Retorna:** Total de decisoes, intervalo de datas, principais criterios, distribuicao de resultados, divergencias com pares, decisoes mais citadas.

### get_temporal_evolution

Agrega contagens de jurisprudencia ao longo do tempo para um criterio juridico.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `criterio` | `string` | sim | -- | Criterio juridico a analisar |
| `granularity` | `string` | nao | `"year"` | `year` ou `month` |
| `periodo_inicio` | `string` | nao | -- | Inicio do periodo (`YYYY` ou `YYYY-MM`) |
| `periodo_fim` | `string` | nao | -- | Fim do periodo (`YYYY` ou `YYYY-MM`) |

**Retorna:** Buckets por periodo com divisao provido/improvido e label heuristico de tendencia.

### get_citation_chain

Rastreia arestas de citacao de saida a partir de uma decisao raiz atraves de saltos CITA_PRECEDENTE.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `decisao_id` | `string` | sim | -- | ID da decisao raiz |
| `max_depth` | `integer` | nao | `3` | Maximo de saltos de citacao (1-5) |

**Retorna:** Nodes/edges de citacao e flag `max_depth_reached`. Nao inclui citacoes de entrada.

### get_pagerank

Classifica decisoes influentes usando PageRank simplificado: `in_citations * 10 + second_order * 3`.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `limit` | `integer` | nao | `20` | Top-N resultados (1-100) |
| `min_citations` | `integer` | nao | `0` | Filtro de minimo de citacoes diretas (pos-processamento) |

**Retorna:** Decisoes ranqueadas com score de influencia e contagens de citacoes.

### get_communities

Retorna pares de decisoes com alta sobreposicao baseada em criterios juridicos compartilhados. Co-ocorrencia par a par, nao deteccao completa de comunidades.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `min_shared` | `integer` | nao | `3` | Minimo de criterios compartilhados por par |
| `limit` | `integer` | nao | `20` | Maximo de comunidades (1-100) |

**Retorna:** Pares de decisoes com contagem e nomes dos criterios compartilhados.

### get_structural_similarity

Compara duas decisoes em cinco dimensoes do grafo usando scoring Jaccard ponderado.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `source_id` | `string` | sim | ID da primeira decisao |
| `target_id` | `string` | sim | ID da segunda decisao |

**Retorna:** Estatisticas por dimensao (criterios, fatos, provas, dispositivos, precedentes) e `weighted_score` em [0, 1].

### get_shortest_path

Encontra o caminho mais curto bidirecional entre duas decisoes usando todos os tipos de relacionamento.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `source_id` | `string` | sim | -- | ID da decisao de origem |
| `target_id` | `string` | sim | -- | ID da decisao de destino |
| `max_depth` | `integer` | nao | `10` | Profundidade maxima do caminho (1-20) |

**Retorna:** Nodes e edges do caminho com tipos de relacionamento reais, ou `found: false`.

### get_graph_embeddings

Computa vetores estruturais de 7 dimensoes por decisao (contagens de criterios/fatos/provas/dispositivos, citacoes de entrada/saida, resultado codificado).

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `decisao_ids` | `string[]` | nao | -- | IDs especificos de decisoes (maximo 500) |
| `limit` | `integer` | nao | `100` | Tamanho da amostra quando `decisao_ids` e omitido (1-500) |

**Retorna:** Vetores de embedding estrutural por decisao. Cacheados por 1 hora.

## Tools de Workflow

### submit_case_pdf_analysis

Inicia um workflow assincrono de analise de PDF via bridge HTTP da API do Valter.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `filename` | `string` | nao | `"processo.pdf"` | Override do nome do arquivo |
| `pdf_base64` | `string` | nao | -- | PDF em base64 (modo JSON, arquivos pequenos) |
| `local_path` | `string` | nao | -- | Caminho do arquivo para upload multipart (recomendado) |
| `source_system` | `string` | nao | `"projudi"` | Label do sistema de origem |
| `source_mode` | `string` | nao | `"chat_attachment"` | Label de proveniencia da entrada |
| `rules_version` | `string` | nao | -- | Override da versao do conjunto de regras |
| `min_precedent_score` | `number` | nao | -- | Score minimo de precedente (0-100) |
| `max_matches_per_phase` | `integer` | nao | -- | Limite por fase (1-10) |
| `reason` | `string` | nao | -- | Nota do operador para auditoria |
| `strict_infra_required` | `boolean` | nao | `true` | Falhar se infra estiver ausente |

**Retorna:** `workflow_id` e status inicial para polling.

:::note
Requer que `MCP_API_BASE_URL` esteja acessivel. Forneca `local_path` (multipart, recomendado) ou `pdf_base64` (modo JSON, melhor para payloads pequenos).
:::

### get_case_pdf_analysis_status

Consulta o status de um workflow de analise de PDF submetido anteriormente.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow retornado por `submit_case_pdf_analysis` |

**Retorna:** Estado atual, progresso e eventuais erros.

### get_case_pdf_analysis_result

Recupera o resultado consolidado de um workflow de analise de PDF concluido.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow retornado por `submit_case_pdf_analysis` |

**Retorna:** Resultado completo da analise, ou payload de nao-pronto/erro enquanto ainda em execucao.

### review_case_phase

Submete aprovacao/rejeicao humana para uma fase especifica do workflow.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow |
| `phase_label` | `string` | sim | Identificador da fase a revisar |
| `approved` | `boolean` | sim | Decisao de aprovacao |
| `reviewer` | `string` | nao | Identidade do revisor para auditoria |
| `notes` | `string` | nao | Notas da revisao |

### review_case_final

Submete aprovacao/rejeicao humana final para o resultado do workflow.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow |
| `approved` | `boolean` | sim | Decisao final de aprovacao |
| `reviewer` | `string` | nao | Identidade do revisor para auditoria |
| `notes` | `string` | nao | Notas da revisao final |

### reprocess_case_analysis

Inicia uma nova execucao imutavel para um workflow existente. Nao altera execucoes anteriores.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow existente |
| `rules_version` | `string` | nao | Override da versao do conjunto de regras |
| `min_precedent_score` | `number` | nao | Score minimo de precedente (0-100) |
| `max_matches_per_phase` | `integer` | nao | Limite por fase (1-10) |
| `reason` | `string` | nao | Motivo para trilha de auditoria |
| `strict_infra_required` | `boolean` | nao | Override do requisito estrito de infra |

### get_case_workflow_artifacts

Lista artefatos versionados do workflow (PDF, JSON, Markdown, logs).

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow |

**Retorna:** Lista de artefatos com IDs, tipos e metadados.

### get_case_artifact_signed_url

Gera uma URL de download temporaria e assinada para um artefato do workflow.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `workflow_id` | `string` | sim | ID do workflow |
| `artifact_id` | `string` | sim | ID do artefato obtido via `get_case_workflow_artifacts` |

**Retorna:** URL assinada com acesso por tempo limitado.

## Tools de Memoria

### remember

Armazena ou atualiza uma memoria chave-valor com escopo de sessao no PostgreSQL com TTL.

| Parametro | Tipo | Obrigatorio | Padrao | Descricao |
|---|---|---|---|---|
| `session_id` | `string` | sim | -- | Identificador de sessao |
| `key` | `string` | sim | -- | Chave da memoria (upsert por session_id + key) |
| `value` | `string` | sim | -- | Payload do valor da memoria |
| `ttl_seconds` | `integer` | nao | `86400` | TTL em segundos (60 a 2.592.000) |

### recall

Recupera uma memoria com escopo de sessao por chave.

| Parametro | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `session_id` | `string` | sim | Identificador de sessao |
| `key` | `string` | sim | Chave da memoria a recuperar |

**Retorna:** `found: true` com o valor armazenado, ou `found: false` com `value: null` quando a chave esta ausente ou expirada.

## Invocacao de Tools

### Modo stdio (Claude Desktop / Claude Code)

1. O cliente envia uma mensagem `tool_use` com o nome da tool e parametros.
2. O servidor MCP do Valter processa a request via handler registrado.
3. O servidor retorna um `tool_result` com o payload de resposta.

### Modo HTTP/SSE (ChatGPT / clientes remotos)

1. O cliente chama o endpoint MCP remoto com nome da tool e parametros.
2. O Valter faz bridge da request via httpx para a API REST.
3. A resposta da API REST e formatada e retornada como resultado da MCP tool.

### Tratamento de erros

Todas as tools retornam respostas de erro estruturadas com `trace_id` para correlacao com logs. Condicoes de erro comuns:

| Erro | Descricao |
|---|---|
| Backend timeout | Consulta ao Neo4j, Qdrant ou PostgreSQL excedeu o tempo limite |
| Service unavailable | Servico backend inacessivel |
| Validation error | Parametros invalidos ou obrigatorios ausentes |
| Not found | Documento ou workflow referenciado nao existe |

## Resumo de Tools

| Dominio | Tool | Parametros obrigatorios |
|---|---|---|
| Search | `search_jurisprudence` | `query` |
| Search | `verify_legal_claims` | `text` |
| Search | `get_irac_analysis` | `document_id` |
| Search | `find_similar_cases` | `document_id` |
| Search | `get_document_integra` | `document_id` |
| Search | `search_features` | (pelo menos um filtro) |
| Graph | `get_divergencias` | -- |
| Graph | `get_turma_divergences` | `tema` |
| Graph | `get_optimal_argument` | `categoria_id` |
| Graph | `get_optimal_argument_by_ministro` | `categoria_id`, `ministro` |
| Graph | `get_ministro_profile` | `ministro` |
| Graph | `get_temporal_evolution` | `criterio` |
| Graph | `get_citation_chain` | `decisao_id` |
| Graph | `get_pagerank` | -- |
| Graph | `get_communities` | -- |
| Graph | `get_structural_similarity` | `source_id`, `target_id` |
| Graph | `get_shortest_path` | `source_id`, `target_id` |
| Graph | `get_graph_embeddings` | -- |
| Workflow | `submit_case_pdf_analysis` | -- |
| Workflow | `get_case_pdf_analysis_status` | `workflow_id` |
| Workflow | `get_case_pdf_analysis_result` | `workflow_id` |
| Workflow | `review_case_phase` | `workflow_id`, `phase_label`, `approved` |
| Workflow | `review_case_final` | `workflow_id`, `approved` |
| Workflow | `reprocess_case_analysis` | `workflow_id` |
| Workflow | `get_case_workflow_artifacts` | `workflow_id` |
| Workflow | `get_case_artifact_signed_url` | `workflow_id`, `artifact_id` |
| Memory | `remember` | `session_id`, `key`, `value` |
| Memory | `recall` | `session_id`, `key` |
