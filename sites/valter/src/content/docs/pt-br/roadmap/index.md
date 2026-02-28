---
title: Roadmap
description: Visao de produto, direcao estrategica e posicionamento competitivo do Valter como motor de raciocinio juridico.
lang: pt-BR
sidebar:
  order: 1

---

# Roadmap

A evolucao do Valter de backend de busca juridica para motor de raciocinio juridico -- visao estrategica, posicionamento competitivo e planejamento orientado a riscos.

## Visao de Produto

O Valter sera o **motor de raciocinio juridico** para LLMs e advogados. O diferencial nao e busca -- e a capacidade de **compor argumentos juridicos verificados** a partir de um knowledge graph contendo ~28.000 decisoes do STJ e 207.000 relacoes.

A plataforma combina seis capacidades que nao existem juntas em nenhum outro produto de legal tech:

1. **Verificacao anti-alucinacao** contra dados reais do tribunal
2. **Inteligencia temporal** -- ponderacao por recencia, deteccao de tendencias na jurisprudencia
3. **Perfil de ministros** -- analise de delta por ministro, rastreamento de divergencias ativas
4. **Knowledge graph** -- decisoes conectadas por criterios, dispositivos legais e precedentes
5. **Arquitetura MCP-nativa** -- qualquer LLM (Claude, ChatGPT) pode usar o Valter como ferramenta
6. **Composicao de argumentos** -- montagem de cadeias de raciocinio juridico multi-etapas a partir de padroes do grafo

A serie v1.x estabiliza producao, adiciona resiliencia e lanca o Legal Reasoning Chain (a feature principal). A serie v2.x expande para multiplos tribunais, integra produtos-irmao (Leci, Juca) e estabelece presenca publica via ChatGPT App Directory.

## Posicionamento Competitivo

| Dimensao | Outros | Valter |
|---|---|---|
| **Busca** | Busca por palavra-chave | Busca hibrida com KG boost e reranking via cross-encoder |
| **Resultados** | Lista de casos similares | Composicao de argumentos a partir de padroes de sucesso no grafo |
| **Citacoes** | "A jurisprudencia diz..." | "REsp X diz Y, verificado, citado Z vezes no grafo" |
| **Ponderacao** | Trata todas as decisoes igualmente | Inteligencia temporal -- pesos por recencia, deteccao de tendencias |
| **Julgadores** | Ignora quem julga | Perfil de ministros -- delta por ministro, divergencias ativas |
| **Acuracia** | Alucina referencias | Verificacao anti-alucinacao contra dados reais do tribunal |
| **Integracao** | Sistemas fechados | MCP-nativo -- qualquer LLM pode usar como ferramenta |
| **Modelo de dados** | Documentos como blocos de texto | Knowledge graph -- decisoes conectadas por criterios, dispositivos, precedentes |

## Estado Atual

Em fevereiro de 2026, o Valter possui:

- **33 features implementadas** abrangendo busca, analitico de grafo, servidor MCP, ingestao, verificacao, observabilidade e CI/CD
- **3 features em andamento**: preparacao para App Directory (~70%), armazenamento canary R2 (~90%), fluxo de download de integras faltantes (~80%)
- **18 features planejadas** distribuidas entre v1.0 e v1.2
- **11 ideias** em avaliacao para v2.0+

O sistema indexa ~23.400 decisoes do STJ no PostgreSQL, com ~3.700 vetorizadas no Qdrant e ~28.000 nos com ~207.000 relacionamentos no Neo4j.

:::note
Veja [Milestones](./milestones) para o detalhamento de cada versao, e [Changelog](./changelog) para o historico de features entregues.
:::

## Analise Premortem

Oito cenarios de falha foram analisados para identificar riscos antes que se materializem. Cada cenario mapeia para um milestone especifico que o endereca.

| # | Cenario de Falha | Premissa Falsa | Mitigacao | Milestone |
|---|---|---|---|---|
| 1 | Redis cai, todas as requests bloqueadas | "Redis vai estar sempre no ar" | Rate limiter fail-open para API keys validas | v1.0 |
| 2 | Neo4j retorna dados obsoletos silenciosamente | "Dados do grafo estao sempre atualizados" | Endpoint de health check, alertas de obsolescencia | v1.0 |
| 3 | Estagnacao de dados -- corpus para de crescer | "23K docs sao suficientes" | Ingestao cron via ARQ, fechamento de gap de indexacao | v1.0 / v1.1 |
| 4 | Query do Neo4j trava, bloqueia toda a request | "Neo4j sempre responde a tempo" | Circuit breaker com timeout de 5s | v1.1 |
| 5 | Multi-tribunal e muito mais dificil do que o esperado | "E so adicionar mais dados" | Spike de TRF na v1.2 antes de comprometer com v2.0 | v1.2 |
| 6 | App Directory gera baixo ROI | "Usuarios do ChatGPT vao nos encontrar" | Rebaixado de v1.2 para v2.1, foco no produto principal | v2.1 |
| 7 | Desenvolvedor unico fica indisponivel | "Diego sempre pode resolver" | Runbook de ausencia, procedimentos operacionais documentados | v1.0 |
| 8 | Problemas com Docker Compose em novos ambientes | "Funciona na minha maquina" | Setup documentado, versoes fixadas, validacao via CI | v1.0 |

## Decisoes Pendentes

Nove decisoes arquiteturais e de produto permanecem em aberto. Cada uma sera resolvida antes ou durante seu milestone-alvo.

| # | Decisao | Opcoes em Consideracao | Alvo |
|---|---|---|---|
| 1 | Timing de ativacao do canary R2 | Ativar na v1.0 vs esperar mais dados de trafego | v1.0 |
| 2 | Sunset de rotas legadas | Remocao imediata vs periodo de depreciacao com avisos | v1.0 |
| 3 | Autoria de politica de privacidade / termos de uso | Escrever internamente vs contratar consultoria juridica | v1.0 |
| 4 | Modelo de integracao com Leci | Biblioteca embarcada vs chamadas API vs banco compartilhado | v2.0 |
| 5 | Nivel de integracao com Juca | Consumidor somente leitura vs sincronizacao bidirecional | v2.0 |
| 6 | Ponto de partida multi-tribunal | TRF-4 (mais dados) vs TST (schema mais simples) vs STF (maior impacto) | v2.0 |
| 7 | Escopo de doutrina | Indexar textos doutrinarios vs apenas linkar fontes externas | v2.0+ |
| 8 | Migracao de modelo de embedding | Manter Legal-BERTimbau 768d vs upgrade para modelo 1024d | v1.1 |
| 9 | Reasoning chain sincrono vs assincrono | Endpoint sincrono vs job em background com polling | v1.2 |
