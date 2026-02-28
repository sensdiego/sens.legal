---
title: FAQ
description: Perguntas frequentes sobre a arquitetura, decisoes de design e uso do Valter.
lang: pt-BR
sidebar:
  order: 2

---

# Perguntas Frequentes

Perguntas comuns de desenvolvedores, contribuidores e agentes de IA que trabalham com o Valter.

## Arquitetura

### Por que o Valter usa 4 bancos de dados?

Cada banco e otimizado para uma carga de trabalho fundamentalmente diferente:

| Banco de Dados | Funcao | Por que nao PostgreSQL? |
|---|---|---|
| **PostgreSQL** | Integridade relacional, metadata de documentos, armazenamento JSONB, maquina de estados de ingestao | N/A -- este e o store relacional |
| **Qdrant** | Busca vetorial dedicada com similaridade por cosseno, indexacao HNSW | pgvector existe, mas nao tem a filtragem, performance em escala e operacoes vetoriais dedicadas do Qdrant |
| **Neo4j** | Travessia nativa de grafo, queries Cypher, modelo de dados orientado a relacionamentos | CTEs recursivas no PostgreSQL nao conseguem igualar a performance nativa de grafo para travessias multi-hop em 207K+ relacionamentos |
| **Redis** | Cache sub-milissegundo, rate limiting, fila de jobs em background (ARQ) | PostgreSQL e lento demais para rate limiting e cache por request |

A alternativa considerada foi uma unica instancia PostgreSQL com pgvector e CTEs recursivas. Isso foi rejeitado porque queries de grafo (caminho mais curto entre decisoes, deteccao de divergencias em cadeias de citacao) e busca vetorial de alto throughput sao cargas de trabalho fundamentalmente diferentes que se beneficiam de engines dedicados.

:::tip
Todos os quatro bancos degradam graciosamente. A busca funciona sem Neo4j (sem KG boost). A busca funciona sem Redis (sem cache, mas o rate limiting atualmente falha fechado -- veja o guia de [Solucao de Problemas](./troubleshooting)). Apenas o PostgreSQL e estritamente obrigatorio.
:::

### Por que um monolito em vez de microsservicos?

Tres razoes:

1. **Tamanho da equipe** -- O Valter e construido por um desenvolvedor auxiliado por agentes de IA. O overhead operacional de multiplos servicos (deploys separados, service discovery, tracing distribuido) desaceleraria o desenvolvimento sem beneficio proporcional.
2. **Logica de negocio compartilhada** -- O mesmo codigo de retriever, verifier e enricher roda em 4 contextos (servidor API, MCP stdio, MCP remote, worker ARQ). Um monolito compartilha esse codigo naturalmente. Microsservicos exigiriam duplica-lo ou adicionar uma camada de servico interna.
3. **Estrutura modular** -- O codebase segue regras estritas de camadas (`api/ -> core/ -> models/`, stores implementam protocols) que permitiriam extracao futura em servicos se a escala exigir.

### Por que MCP em vez de uma API customizada para LLMs?

MCP (Model Context Protocol) e um padrao aberto. Os beneficios sobre uma API customizada:

- **Qualquer LLM compativel com MCP pode usar o Valter** sem trabalho de integracao. Claude e ChatGPT suportam MCP hoje.
- **Definicoes estruturadas de tools** com JSON Schema significam que o LLM entende parametros, tipos e descricoes sem engenharia de prompt customizada.
- **Dois transportes para diferentes casos de uso**: stdio para uso local no Claude Desktop (baixa latencia, sem rede), e HTTP/SSE para acesso remoto (ChatGPT, outros consumidores).
- **Nenhum SDK de cliente necessario** -- o protocolo cuida de serializacao, reporte de erros e descoberta de tools.

O tradeoff e que tools MCP tem um padrao fixo de request-response. Para operacoes de longa duracao (como a reasoning chain planejada), o endpoint pode precisar retornar resultados intermediarios ou usar polling assincrono.

### Qual a diferenca entre MCP stdio e remote?

| Aspecto | stdio (local) | HTTP/SSE (remoto) |
|---|---|---|
| **Transporte** | Pipes de entrada/saida padrao | HTTP POST + Server-Sent Events |
| **Caso de uso** | Claude Desktop na mesma maquina | ChatGPT, clientes remotos, qualquer consumidor via rede |
| **Autenticacao** | Nao necessaria (processo local) | API key + verificacao HMAC |
| **Inicializacao** | `python -m valter.mcp.stdio_server` | `make mcp-remote` |
| **Latencia** | Mais baixa (sem rede) | Dependente da rede |
| **Configuracao** | `claude_desktop_config.json` | Variavel de ambiente `VALTER_MCP_SERVER_API_KEYS` |

Ambos os transportes expoe o mesmo conjunto de tools MCP. As definicoes de tools, parametros e respostas sao identicos independente do transporte.

---

## Busca

### Como funciona o KG Boost?

KG Boost e um incremento de relevancia pos-recuperacao baseado na conectividade do knowledge graph. O fluxo:

1. **Recuperacao inicial** -- Busca hibrida (BM25 + semantica) retorna uma lista ranqueada de documentos candidatos
2. **Consulta ao grafo** -- Cada documento candidato e verificado no Neo4j quanto a conexoes no grafo (citacoes recebidas, criterios compartilhados com outros resultados, conexao com precedentes conhecidos)
3. **Ajuste de score** -- Documentos com conectividade mais forte no grafo recebem um incremento de score configuravel
4. **Re-ranking** -- O ranking final reflete tanto relevancia textual quanto importancia estrutural na rede de jurisprudencia

Propriedades principais:

- **Configuravel** via `VALTER_KG_BOOST_BATCH_ENABLED` e `VALTER_KG_BOOST_MAX_CONCURRENCY`
- **Degradacao graciosa** -- Se o Neo4j estiver indisponivel, resultados de busca ainda retornam sem o boost. Nenhum erro e exibido ao usuario.
- **Em lote** -- Consultas ao grafo sao feitas em lote para performance em vez de consultar um documento por vez

### Por que Legal-BERTimbau e nao um modelo maior?

O modelo de embedding `rufimelo/Legal-BERTimbau-sts-base` foi escolhido por tres razoes:

1. **Especifico do dominio** -- Fine-tuned em texto juridico portugues, especificamente para similaridade textual semantica (STS). Um modelo multilingue de proposito geral (ex: `all-MiniLM-L6-v2`) performa mensuralmente pior em portugues juridico.
2. **768 dimensoes** -- Um bom equilibrio entre qualidade versus custo de armazenamento e computacao. Cada um dos ~23.400 documentos requer um vetor de 768 floats. Dobrar a dimensao dobra o armazenamento e o tempo de busca.
3. **Open source** -- Disponivel no Hugging Face, pode ser baixado e executado localmente sem dependencias de API.

:::note
Decisao pendente: se migrar para um modelo de 1024 dimensoes para melhor qualidade. Isso exigiria re-indexar todos os documentos e esta rastreado como decisao #8 no [Roadmap](../roadmap/).
:::

---

## Dados

### Como funciona a verificacao anti-alucinacao?

O verificador (`core/verifier.py`) checa que decisoes citadas realmente existem e contem o que e alegado. O processo:

1. **Extracao de referencias** -- Parsear numeros de decisao (REsp, AgRg, etc.) do texto
2. **Verificacao de existencia** -- Verificar que cada decisao citada existe no corpus PostgreSQL
3. **Validacao de conteudo** -- Confirmar que a decisao citada realmente discute o ponto juridico alegado
4. **Referencia cruzada de metadata** -- Checar ministro, turma, data e outras metadata contra registros publicos do STJ

Se uma referencia nao pode ser verificada, ela e sinalizada. Isso previne que LLMs citem decisoes inexistentes ou atribuam posicoes juridicas incorretamente -- um problema comum e serio em trabalho juridico assistido por IA.

### O que e analise IRAC?

IRAC (Issue, Rule, Application, Conclusion) e um framework padrao para estruturar analise juridica:

- **Issue** -- A questao juridica que o tribunal esta decidindo
- **Rule** -- O estatuto, regulamento ou principio juridico aplicavel
- **Application** -- Como o tribunal aplica a regra aos fatos especificos
- **Conclusion** -- A decisao do tribunal

O Valter usa IRAC para decompor decisoes judiciais em componentes estruturados (`models/irac.py`). Essa estrutura permite busca mais precisa (buscar por issue ou rule, nao apenas texto completo) e alimenta a feature de reasoning chain planejada.

### O Valter consegue lidar com tribunais alem do STJ?

Ainda nao, mas esta planejado para v2.0.

O codebase atual tem premissas especificas do STJ em varios pontos: o verificador checa contra o portal publico do STJ, o store de metadata e especifico do STJ (`stores/stj_metadata.py`), e o pipeline de ingestao parseia formatos de documento do STJ.

A abordagem para expansao multi-tribunal:

1. **Spike de TRF na v1.2** -- Ingerir 50 decisoes de TRF para identificar exatamente o que quebra
2. **Abstracao na v2.0** -- Fatorar logica especifica de tribunal atras de interfaces
3. **Rollout incremental** -- Adicionar TRF primeiro, depois TST, depois STF

:::caution
Multi-tribunal e o item de maior risco no roadmap. O spike de TRF na v1.2 existe especificamente para validar viabilidade antes de comprometer com v2.0.
:::

### Como funciona o workflow de ingestao?

O pipeline de ingestao transforma documentos brutos de tribunais em conhecimento pesquisavel e conectado em grafo. As etapas:

1. **Extracao de PDF** -- Extrair texto de PDFs de decisoes judiciais (`core/pdf_extraction.py`). Faz fallback para OCR via pytesseract para documentos escaneados.
2. **Processamento de texto** -- Limpar, normalizar e segmentar o texto extraido. Tratar problemas de encoding, remocao de cabecalho/rodape e artefatos de quebra de pagina.
3. **Parsing de metadata** -- Extrair metadata estruturada: numero da decisao, ministro, turma, data, dispositivos legais citados.
4. **Extracao de features** -- Identificar features juridicas: componentes IRAC, argumentos-chave, precedentes citados.
5. **Geracao de embedding** -- Gerar embeddings vetoriais usando Legal-BERTimbau para busca semantica.
6. **Insercao no grafo** -- Criar nos e relacionamentos no Neo4j seguindo a ontologia baseada em FRBR.
7. **Rastreamento de estado** -- A maquina de estados do workflow (`core/workflow_state_machine.py`) rastreia cada documento atraves dessas etapas, permitindo retry em caso de falha.

O pipeline pode ser acionado manualmente via endpoint da API de ingestao ou automaticamente via workers ARQ em background.

---

## Operacoes

### O que acontece se o Redis cair?

Atualmente, o rate limiter e **fail-closed** -- se o Redis estiver indisponivel, todas as requests sao bloqueadas, mesmo de API keys validas. Este e um problema conhecido (premortem #1) e e a correcao de maior prioridade para v1.0.

A correcao planejada: fail-open para requests com API keys validas quando o Redis estiver inacessivel. O rate limiting sera best-effort em vez de um portao rigido.

Outras features dependentes de Redis (cache, fila de jobs ARQ) degradam de forma mais graciosa: cache misses simplesmente consultam o banco diretamente, e jobs em background aguardam ate o Redis se recuperar.

### Que monitoramento o Valter possui?

Estado atual:

- **30+ metricas Prometheus** instrumentadas em endpoints de API, latencia de busca, queries de grafo e ingestao
- **Logging JSON via structlog** com `trace_id` em cada request para rastreamento
- **OpenTelemetry tracing** com console exporter (traces visiveis nos logs)

Lacunas sendo endrecadas na v1.0:

- Nenhum servidor Prometheus coletando as metricas (metricas sao expostas mas nao coletadas)
- Nenhum dashboard (Grafana ou similar)
- Nenhum despachante de alertas (alertas ainda nao conectados ao Slack ou PagerDuty)
