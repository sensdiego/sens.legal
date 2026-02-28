---
title: Milestones
description: Plano detalhado de milestones da v1.0 (estabilidade em producao) ate v2.1 (escala e presenca publica).
lang: pt-BR
sidebar:
  order: 2

---

# Milestones

Plano sequencial de milestones: v1.0 ate v2.1. Cada milestone depende do anterior estar completo. O cronograma estimado vai de marco de 2026 ate o final de 2026.

## v1.0 -- Producao Estavel

**Objetivo:** Estabilizar producao, corrigir vulnerabilidades do premortem, prevenir degradacao silenciosa.

**Pre-requisito:** Nenhum (estado atual).

**Esforco estimado:** 2-3 semanas.

### Features

| Feature | Prioridade | Descricao |
|---|---|---|
| Rate limiter fail-open | P0 | Quando o Redis estiver fora, permitir requests de API keys validas em vez de bloquear todo o trafego |
| Fechamento de gap de indexacao | P0 | Indexar em lote os ~19.700 documentos somente-ementa sem embeddings (3.673 -> 20.000+ vetores) |
| Configuracao de alertas | P1 | Conectar logs do Railway ao Slack para erros criticos e alertas de degradacao |
| Correcao HTTPS | P1 | Resolver problemas de validacao de certificado no dominio de producao |
| Merge de PRs pendentes | P1 | Fechar pull requests abertos que bloqueiam trabalho downstream |
| Politica de privacidade / termos | P1 | Adicionar paginas legais obrigatorias para submissao ao App Directory |
| Migracao de datetime | P2 | Migrar campos datetime ingenuos para timezone-aware (`datetime` -> `datetime(timezone.utc)`) |
| Atualizacao do README | P2 | Atualizar README para refletir o estado atual e instrucoes de setup |
| Runbook de ausencia | P2 | Documentar procedimentos operacionais para quando o desenvolvedor principal estiver indisponivel |
| Ativacao do canary R2 | P2 | Ativar rollout canary para armazenamento de artefatos R2 (atualmente em ~90% de implementacao) |

### Criterios de Conclusao

- Rate limiter permite requests quando o Redis esta fora (fail-open para keys validas)
- Qdrant contem >= 20.000 vetores indexados
- Alertas no Slack disparando para erros criticos
- Certificado HTTPS valido no dominio de producao
- Zero `DeprecationWarning` de uso de datetime ingenuo

---

## v1.1 -- Resiliencia + Qualidade de Busca

**Objetivo:** Resiliencia a falhas parciais de infraestrutura e melhorias mensuraveis na qualidade de busca.

**Pre-requisito:** v1.0 completa.

**Esforco estimado:** 2-3 semanas.

### Features

| Feature | Prioridade | Descricao |
|---|---|---|
| Circuit breaker | P0 | Parar de chamar Neo4j apos falhas/timeouts repetidos (>5s), permitir recuperacao sem bloquear requests |
| Configuracao de connection pool | P1 | Ajustar pools de conexao de PostgreSQL, Neo4j e Redis para padroes de carga em producao |
| Ingestao cron via ARQ | P1 | Jobs agendados em background para verificar novas decisoes do STJ e ingerir automaticamente |
| Fallback extraction para core | P1 | Mover logica de extracao fallback de `stores/` para `core/` (camada correta) |
| Externalizacao de mapas heuristicos | P2 | Mover heuristicas de classificacao hardcoded para arquivos de configuracao |
| Unificacao de stopwords | P2 | Fonte unica de stopwords compartilhada entre BM25 e expansao de query |
| Metricas de fallback | P2 | Contadores Prometheus para frequencia de uso dos caminhos de fallback |
| Testes unitarios de store | P2 | Cobertura de testes unitarios para a camada `stores/` (atualmente subtestada) |

### Criterios de Conclusao

- Circuit breaker ativo: travamento do Neo4j > 5s abre o circuito, requests prosseguem sem features de grafo
- Pools de conexao configurados com limites e timeouts explicitos
- ARQ verifica novas decisoes ao menos semanalmente
- Logica de extracao fallback reside em `core/`, nao em `stores/`

---

## v1.2 -- Legal Reasoning Chain

**Objetivo:** Transformar o Valter de backend de busca em **motor de raciocinio**. Esta e a feature principal.

**Pre-requisito:** v1.1 completa (circuit breaker e pools de conexao necessarios para queries pesadas multi-store).

**Esforco estimado:** 2-3 semanas.

### Features

| Feature | Prioridade | Descricao |
|---|---|---|
| Orquestrador `core/reasoning_chain.py` | P0 | Orquestrador server-side que compoe argumentos juridicos verificados a partir de caminhos no knowledge graph |
| Endpoint `POST /v1/reasoning-chain` | P0 | Endpoint REST expondo a reasoning chain para frontends |
| Tool MCP `compose_legal_argument` | P0 | Tool MCP permitindo que LLMs solicitem argumentos juridicos compostos com proveniencia |
| Rastreamento de proveniencia | P0 | Cada etapa da reasoning chain vincula-se a decisoes especificas, com contagem de citacoes e posicao no grafo |
| Integracao de inteligencia temporal | P1 | Reasoning chain pondera decisoes recentes com mais peso, sinaliza precedentes superados |
| Spike de TRF (50 decisoes) | P1 | Ingerir 50 decisoes de TRF para testar viabilidade multi-tribunal antes de comprometer com v2.0 |

### Como Funciona

O orquestrador da reasoning chain segue este fluxo:

1. **Expansao de query** -- analisar a questao juridica, identificar criterios e dispositivos legais relevantes
2. **Recuperacao multi-estrategia** -- busca hibrida (BM25 + semantica + KG boost) para decisoes relevantes
3. **Travessia do grafo** -- seguir caminhos de citacao, criterios compartilhados e cadeias de precedentes no Neo4j
4. **Composicao de argumento** -- montar um argumento juridico multi-etapas a partir dos caminhos mais fortes do grafo
5. **Verificacao** -- toda decisao citada e verificada contra dados reais do STJ (anti-alucinacao)
6. **Anexacao de proveniencia** -- cada etapa inclui a decisao-fonte, contagem de citacoes, recencia e score de conectividade no grafo

### Criterios de Conclusao

- Reasoning chain retorna >= 3 etapas verificadas com proveniencia completa
- Tool MCP funcional e testada com Claude e ChatGPT
- Latencia p95 < 5s para requests de reasoning chain
- Spike de TRF concluido com breakpoints documentados e avaliacao de viabilidade

---

## v2.0 -- Plataforma Multi-Tribunal

**Objetivo:** Expandir alem do STJ para outros tribunais brasileiros.

**Pre-requisito:** v1.2 completa (spike de TRF executado, breakpoints multi-tribunal documentados).

**Esforco estimado:** 2-3 meses (escopo depende dos resultados do spike da v1.2).

:::caution
Este milestone e significativamente mais complexo do que parece. O codebase atual -- `core/verifier.py`, `pipeline/`, `stores/stj_metadata.py` -- tem premissas especificas do STJ em varios pontos. O spike de TRF na v1.2 identificara exatamente o que precisa mudar.
:::

### Features

| Feature | Prioridade | Descricao |
|---|---|---|
| Arquitetura multi-tribunal | P0 | Abstrair logica especifica de tribunal atras de interfaces, suportar multiplos tribunais no mesmo deploy |
| Suporte a TRF | P0 | Tribunais Regionais Federais -- comecando pelo tribunal identificado no spike da v1.2 |
| Suporte a TST | P1 | Tribunal Superior do Trabalho |
| Suporte a STF | P1 | Supremo Tribunal Federal (materias constitucionais) |
| Integracao com Leci | P1 | Integracao com Leci (produto-irmao) para analise juridica enriquecida |
| Integracao com Juca | P1 | Integracao com Juca (frontend) para experiencia de usuario fluida |
| Pipeline de ingestao automatica | P1 | Ingestao continua de multiplos portais de tribunais sem intervencao manual |

### Criterios de Conclusao

- Ao menos 1 tribunal adicional com dados pesquisaveis e verificados
- Reasoning chain funciona entre tribunais (ex: decisao do STJ citando precedente de TRF)
- Pipeline de ingestao rodando para >= 2 tribunais

---

## v2.1 -- Escala + Presenca Publica

**Objetivo:** Plataforma multi-consumidor com garantias de SLA e presenca publica no ChatGPT App Directory.

**Pre-requisito:** v2.0 completa (multi-tribunal funcionando, estavel o suficiente para usuarios externos).

**Esforco estimado:** Depende da demanda e do cronograma de revisao do App Directory.

:::note
A submissao ao App Directory era originalmente planejada para v1.2, mas foi rebaixada para v2.1 com base na analise premortem (#6: risco de baixo ROI se submetido antes do produto estar maduro o suficiente).
:::

### Features

| Feature | Prioridade | Descricao |
|---|---|---|
| Submissao ao ChatGPT App Directory | P1 | Submeter o Valter como tool MCP publica no ChatGPT App Directory |
| Hardening do MCP | P0 | Rate limiting por consumidor, validacao de requests, prevencao de abuso |
| Multi-tenancy | P1 | Suportar multiplas organizacoes com dados e billing isolados |
| Garantias de SLA | P1 | Metas documentadas de uptime, latencia e disponibilidade |
| Teste de carga | P0 | Validar que o sistema suporta a carga concorrente alvo |
| Cobertura de testes de store > 80% | P2 | Cobertura abrangente de testes para todas as implementacoes de store |

### Criterios de Conclusao

- Ao menos 1 usuario externo (alem do desenvolvedor) usando o sistema ativamente
- Submissao ao App Directory concluida (pendente revisao)
- Testes de carga validam metas de SLA sob carga concorrente

---

## Cronograma

```
2026-03       v1.0 — Producao Estavel (~2-3 semanas)
                |
2026-03/04    v1.1 — Resiliencia + Qualidade de Busca (~2-3 semanas)
                |
2026-04       v1.2 — Legal Reasoning Chain (~2-3 semanas) *** PRINCIPAL ***
                |
2026-05-07    v2.0 — Plataforma Multi-Tribunal (~2-3 meses, escopo do spike)
                |
2026-H2       v2.1 — Escala + Presenca Publica (depende da demanda)
```

:::tip
A serie v1.x e projetada para um unico desenvolvedor + agentes de IA trabalhando em sprints de 2-3 semanas. O cronograma da v2.0 e deliberadamente mais amplo porque a complexidade multi-tribunal e o item de maior risco no roadmap.
:::
