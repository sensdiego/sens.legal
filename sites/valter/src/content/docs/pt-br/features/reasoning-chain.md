---
title: Cadeia de Raciocinio Juridico
description: Funcionalidade principal planejada para v1.2 -- orquestrador server-side que compoe argumentos juridicos verificados a partir do knowledge graph com rastreamento de proveniencia.
sidebar:
  order: 7
lang: pt-BR
---

# Cadeia de Raciocinio Juridico

:::caution
Esta e uma funcionalidade planejada para v1.2. O design esta finalizado e todas as capacidades pre-requisito estao implementadas, mas o orquestrador em si ainda nao foi construido. Pre-requisito: v1.1 (circuit breaker, connection pools) deve ser concluida primeiro, ja que a cadeia de raciocinio executa multiplas queries de grafo concorrentes.
:::

A Cadeia de Raciocinio Juridico e a funcionalidade que transforma o Valter de um backend de busca em um motor de raciocinio juridico. Em vez de retornar uma lista de casos similares, ele compoe um argumento juridico verificado com proveniencia -- cada afirmacao rastreavel ate um no especifico no knowledge graph.

## Visao

Nenhum concorrente no espaco de legal tech brasileiro faz composicao de argumentos a partir de um knowledge graph. As ferramentas existentes ou retornam listas de casos por palavras-chave ou geram texto nao verificado. A cadeia de raciocinio preenche essa lacuna orquestrando 7 capacidades existentes do Valter em uma unica resposta que um advogado pode citar com confianca.

O orquestrador residira em `core/reasoning_chain.py` e nao requer novas queries de grafo -- ele encadeia endpoints existentes que ja estao testados em producao.

## Entrada / Saida

### Entrada

```json
{
  "fatos": "Passageiro teve voo cancelado sem aviso previo, ficou 18h no aeroporto sem assistencia",
  "pergunta": "Cabe indenizacao por dano moral por cancelamento de voo?",
  "ministro": "NANCY ANDRIGHI",
  "turma": "3a Turma"
}
```

| Campo | Obrigatorio | Descricao |
|-------|-------------|-----------|
| `fatos` | Sim | Fatos do caso em linguagem natural |
| `pergunta` | Sim | Questao juridica a responder |
| `ministro` | Nao | Filtrar composicao de argumento para um ministro especifico |
| `turma` | Nao | Filtrar por turma do tribunal |

### Saida

```json
{
  "argument_steps": [
    {
      "fact": "cancelamento sem aviso previo",
      "criterion": "dano moral em transporte aereo",
      "success_rate": 0.87,
      "dispositivo": "CDC art. 14",
      "supporting_decisions": ["REsp 1.584.465/SP", "REsp 1.734.946/RJ"]
    }
  ],
  "counter_arguments": [
    {
      "criterion": "excludente de responsabilidade por caso fortuito",
      "dissenting_ministers": ["MINISTRO X"],
      "divergence_score": 0.35
    }
  ],
  "temporal_strength": [
    {
      "criterion": "dano moral em transporte aereo",
      "trend": "growing",
      "recent_decisions_count": 42
    }
  ],
  "anchor_decision": {
    "processo": "REsp 1.584.465/SP",
    "ministro": "NANCY ANDRIGHI",
    "ementa": "...",
    "kg_score": 0.92,
    "citation_count": 15,
    "verified": true
  },
  "overall_strength": 0.83,
  "provenance": [
    {
      "claim_index": 0,
      "graph_node_id": "criterio_dano_moral_transporte",
      "graph_node_type": "Criterio",
      "source_decision": "decisao_REsp_1584465"
    }
  ]
}
```

O array `provenance` e o diferencial critico: cada afirmacao no argumento pode ser rastreada ate um no especifico no knowledge graph, tornando a saida auditavel.

## Capacidades Orquestradas

A cadeia de raciocinio nao introduz novas queries. Ela orquestra endpoints existentes e testados em producao:

| Componente de Raciocinio | Endpoint Existente | O Que Fornece |
|--------------------------|-------------------|---------------|
| Fato para criterio com taxa de sucesso | `get_optimal_argument` | Mapeia fatos para criterios e calcula taxas de sucesso |
| Criterio para dispositivo legal | `get_optimal_argument` | A cadeia inclui dispositivos (leis) |
| Deteccao de contra-argumento | `get_divergencias` + `get_ministro_profile` | Encontra desacordos ativos nos criterios usados |
| Delta do ministro vs categoria | `get_optimal_argument_by_ministro` | Mostra como um ministro especifico diverge da media |
| Tendencia temporal | `get_temporal_evolution` | Se o criterio esta ganhando ou perdendo tracao |
| Decisao ancora verificada | `search_jurisprudence` + `verify_legal_claims` | A decisao mais forte para citar, verificada contra dados de referencia |
| Similaridade estrutural | `find_similar_cases` | Casos com topologia de grafo similar |

## Endpoints Planejados

| Verbo | Rota | Descricao |
|-------|------|-----------|
| POST | `/v1/reasoning-chain` | Endpoint REST API para composicao de argumentos |
| MCP | `compose_legal_argument` | MCP tool para Claude Desktop/Code e ChatGPT |

## Criterios de Conclusao

O milestone v1.2 define criterios claros de aceitacao:

- `POST /v1/reasoning-chain` retorna um argumento com pelo menos 3 passos verificados
- Toda afirmacao na saida tem uma entrada em `provenance` vinculando a um no do grafo
- A MCP tool `compose_legal_argument` esta funcional no Claude Desktop
- Latencia p95 para a cadeia completa esta abaixo de 5 segundos
- Um spike de 50 decisoes do TRF e executado e documentado para avaliar a complexidade multi-tribunal

## Decisao em Aberto: Sincrono vs Assincrono

O modelo de execucao para a cadeia de raciocinio ainda nao foi definido:

| Opcao | Pros | Contras |
|-------|------|---------|
| **Sincrono** | Implementacao simples, bom para latencia alvo < 5s | Bloqueia a thread da requisicao; falha se qualquer sub-query for lenta |
| **Assincrono com polling** | Tolera execucao > 10s; cliente faz polling do resultado | Adiciona complexidade (fila de jobs, endpoint de status, polling client-side) |
| **Streaming via SSE** | Resultados parciais em tempo real; melhor UX | Mais complexo; requer suporte a SSE em todos os consumidores |

A decisao depende da latencia medida das queries orquestradas uma vez que circuit breakers e connection pools (v1.1) estejam implementados.
