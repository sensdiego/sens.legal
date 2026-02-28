---
title: "Introdução"
description: "O que é o Valter, por que ele existe, quem usa, e o que o diferencia de todas as outras plataformas jurídicas."
lang: pt-BR
sidebar:
  order: 1
---

# Introdução

O Valter é um backend de conhecimento jurídico que serve jurisprudência do STJ (Superior Tribunal de Justiça) através de uma API REST e um servidor MCP (Model Context Protocol). Ele transforma decisões judiciais brutas em raciocínio jurídico estruturado, verificado e composível — permitindo que LLMs e advogados consultem precedentes, analisem divergências entre ministros e componham argumentos respaldados por um grafo de conhecimento.

O Valter faz parte do ecossistema [sens.legal](https://sens.legal), junto com o Leci (legislação) e o Juca (frontend para advogados).

## Por que o Valter existe

LLMs são assistentes de pesquisa jurídica poderosos, mas têm um problema fundamental: **alucinam referências legais**. Um LLM vai citar com convicção uma Súmula que não existe, atribuir uma decisão ao ministro errado ou inventar um número de processo que nunca foi protocolado.

O Valter existe para resolver isso. Em vez de deixar LLMs gerarem conhecimento jurídico a partir dos dados de treinamento, o Valter fornece um backend de conhecimento estruturado onde cada referência é rastreável a dados reais do tribunal. Quando um LLM usa o Valter como ferramenta (via MCP), ele pode:

- **Buscar** jurisprudência com retrieval híbrido (lexical + semântico + grafo de conhecimento)
- **Verificar** que qualquer referência legal realmente existe antes de apresentá-la ao usuário
- **Compor** argumentos a partir de padrões de sucesso encontrados no grafo de conhecimento
- **Entender** quem julga o quê e como as posições divergem ao longo do tempo

## O que o Valter sabe

A base de conhecimento do Valter é construída a partir de dados públicos do STJ:

| Store | Registros | O que contém |
|-------|-----------|-------------|
| PostgreSQL | ~23.400 decisões | Texto integral, ementas, metadados, features extraídas por IA |
| Neo4j | ~28.500 nós, ~207.000 arestas | Decisões conectadas por critérios, dispositivos, precedentes |
| Qdrant | ~3.700 vetores (768-dim) | Embeddings semânticos para busca por similaridade |
| PostgreSQL | ~810.000 registros de metadados | Metadados brutos do tribunal STJ |

:::note
O gap de cobertura vetorial (3.700 de 23.400 documentos) é um problema conhecido sendo endereçado no milestone v1.0. Veja o [Roadmap](/roadmap/) para detalhes.
:::

## Quem usa o Valter

O Valter atende três tipos de consumidores através de dois protocolos:

### Consumidores REST API (porta 8000)

O **Juca** é um frontend Next.js para advogados que consome a API REST do Valter diretamente. Ele oferece uma interface amigável para buscar jurisprudência, analisar processos e revisar insights gerados por IA.

### Consumidores MCP

O **Claude Desktop e Claude Code** conectam via MCP stdio — uma conexão direta em nível de processo que não requer rede. A configuração é uma única entrada no `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "cwd": "/caminho/para/Valter"
    }
  }
}
```

O **ChatGPT** conecta via MCP remoto — um servidor HTTP/SSE rodando na porta 8001 com autenticação HMAC. Ele é deployado no Railway junto com a API principal.

Os três consumidores acessam as mesmas 28 tools MCP e os mesmos data stores.

## O que diferencia o Valter

A maioria das plataformas de legal tech são motores de busca com um skin jurídico. O Valter é um **grafo de conhecimento com uma camada de raciocínio**. Veja como essa diferença se manifesta:

| O que os outros fazem | O que o Valter faz |
|----------------------|-------------------|
| Busca por palavras-chave | Busca híbrida: BM25 lexical + vetores semânticos + boost por grafo de conhecimento + reranking com cross-encoder |
| Lista de casos similares | Composição de argumentos a partir de padrões de sucesso no grafo — quais critérios levam a quais resultados, com qual taxa de sucesso |
| "A jurisprudência diz..." | "O REsp 1.234.567 diz X, verificado contra dados do tribunal, citado 14 vezes no grafo, aplicado pelo Ministro Y em 73% dos casos da categoria Z" |
| Tratam todas as decisões como iguais | Inteligência temporal — decisões recentes pesam mais, detecção de tendência (crescente, declinante, estável) |
| Ignoram quem julga | Perfis de ministros — taxas de sucesso por ministro, divergências ativas, padrões comportamentais |
| Alucinam referências | Verificação anti-alucinação: cada súmula, nome de ministro, número de processo e referência legislativa checados contra dados reais |
| Sistemas fechados e proprietários | MCP-native — qualquer LLM compatível com MCP pode usar o Valter como ferramenta |
| Documentos como blobs de texto | Grafo de conhecimento — decisões conectadas por critérios, dispositivos, precedentes e legislação em uma ontologia baseada em FRBR |

## Capacidades principais

As capacidades do Valter são organizadas em seis domínios:

### Busca e retrieval

O pipeline de busca combina cinco estratégias em um único fluxo. Uma requisição de busca executa BM25 lexical e similaridade semântica Qdrant em paralelo, combina resultados via pontuação ponderada ou Reciprocal Rank Fusion (RRF), eleva scores usando conectividade do grafo Neo4j, e reordena os top resultados com um cross-encoder. Query expansion via Groq LLM pode gerar até 3 variantes da query para melhor recall.

**Endpoints:** `POST /v1/retrieve`, `POST /v1/similar_cases`, `POST /v1/search/features`, `POST /v1/factual/dual-search`

### Analytics do grafo de conhecimento

Doze endpoints expõem o grafo de conhecimento Neo4j para raciocínio jurídico. Você pode detectar divergências ativas entre ministros, encontrar o caminho de argumento ótimo para uma categoria, rastrear como a aplicação de critérios evolui ao longo do tempo, e gerar perfis abrangentes de ministros.

**Endpoints:** `POST /v1/graph/*` (12 endpoints)

### Verificação e enriquecimento

O sistema de verificação checa referências legais contra dados reais do tribunal — súmulas, nomes de ministros, números de processo e legislação. O sistema de enriquecimento adiciona análise IRAC (Issue, Rule, Application, Conclusion) e contexto do grafo de conhecimento a qualquer decisão.

**Endpoints:** `POST /v1/verify`, `POST /v1/enrich`, `POST /v1/factual/extract`

### Ingestão de documentos

Um workflow completo de análise de caso processa PDFs desde o upload até a análise jurídica revisada. O pipeline PROJUDI extrai e segmenta o documento, a análise de fases identifica estágios processuais, e o matching de jurisprudência encontra precedentes relevantes para cada fase. Uma state machine garante transições auditáveis, e revisão humana permite aprovação ou rejeição em cada etapa.

**Endpoints:** `POST /v1/ingest/*` (17 endpoints)

### Integração MCP

Vinte e oito tools MCP expõem todas as capacidades do Valter para LLMs. As tools são organizadas em categorias de knowledge, graph e workflow. Os transportes stdio (Claude) e HTTP/SSE (ChatGPT) são suportados, com autenticação por API key e HMAC respectivamente.

### Observabilidade

Logging JSON estruturado via structlog com trace IDs em cada request, 30+ métricas Prometheus e tracing OpenTelemetry fornecem visibilidade sobre o comportamento do sistema.

## Arquitetura resumida

O Valter é um **monolito modular com quatro runtimes** — todos compartilhando o mesmo codebase Python:

| Runtime | Comando | Porta | Propósito |
|---------|---------|-------|-----------|
| REST API | `make dev` | 8000 | Endpoints HTTP para Juca e consumidores diretos |
| MCP stdio | `python -m valter.mcp` | — | Conexão local para Claude Desktop/Code |
| MCP HTTP/SSE | `make mcp-remote` | 8001 | Conexão remota para ChatGPT |
| ARQ Worker | `make worker-ingest` | — | Processamento em background de ingestão de PDFs |

O codebase segue uma arquitetura de camadas estrita: `api/` → `core/` → `models/`, com `stores/` implementando interfaces de protocolo de `core/protocols.py`. A lógica de negócio nunca importa stores diretamente — tudo flui via injeção de dependência.

Para um mergulho profundo na arquitetura, veja [Visão Geral da Arquitetura](/architecture/overview/).

## Próximos passos

- **[Quickstart](/getting-started/quickstart/)** — Rode o Valter localmente em menos de 5 minutos
- **[Instalação](/getting-started/installation/)** — Guia completo de setup com todos os bancos e opções
- **[Referência da API](/api/)** — Documentação completa de endpoints
- **[Tools MCP](/api/mcp-tools/)** — Todas as 28 tools MCP com parâmetros e exemplos
