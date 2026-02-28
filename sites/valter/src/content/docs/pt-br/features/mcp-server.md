---
title: MCP Server
description: 28 tools do Model Context Protocol que permitem ao Claude e ChatGPT consultar conhecimento juridico, analisar casos e compor argumentos.
sidebar:
  order: 4
lang: pt-BR
---

# MCP Server

O Valter expoe 28 MCP tools via dois modos de transporte -- stdio para Claude Desktop/Code e HTTP/SSE para ChatGPT -- permitindo que qualquer LLM compativel com MCP atue como assistente de pesquisa juridica respaldado por dados reais de jurisprudencia.

## O Que e MCP?

O Model Context Protocol (MCP) e um padrao aberto para comunicacao estruturada entre LLMs e ferramentas externas. Em vez de construir integracoes de API customizadas para cada provedor de LLM, o MCP fornece uma unica interface que qualquer cliente compativel pode consumir.

Para o Valter, isso significa que Claude Desktop, Claude Code, ChatGPT e qualquer futuro cliente MCP podem usar as mesmas 28 tools sem trabalho de integracao separado.

## Modos de Transporte

### stdio (Claude Desktop / Claude Code)

O transporte stdio roda como um subprocesso que se comunica via JSON-RPC sobre entrada/saida padrao. Nenhuma configuracao de rede e necessaria.

```bash
# Start the MCP server in stdio mode
python -m valter.mcp
```

Os logs sao direcionados para stderr para nao interferirem com o protocolo JSON-RPC no stdout.

### HTTP/SSE (ChatGPT e Clientes Remotos)

O transporte remoto roda uma aplicacao ASGI Starlette que aceita requisicoes Streamable HTTP com autenticacao HMAC, implantada junto com a REST API no Railway.

```bash
# Start the remote MCP server on port 8001
make mcp-remote
```

Arquitetura: o MCP remote server (porta 8001) faz ponte com a REST API (porta 8000) via httpx. O servidor remoto trata autenticacao, rate limiting e framing do protocolo MCP, enquanto a API executa as operacoes de dados.

A configuracao de runtime e definida em `MCPRemoteRuntimeConfig`:

```python
# From mcp/remote_server.py
@dataclass(frozen=True)
class MCPRemoteRuntimeConfig:
    transport: str          # "stdio" or "streamable-http"
    host: str
    port: int
    path: str
    auth_mode: str          # "none" or "api_key"
    api_keys: tuple[str, ...]
    rate_limit_per_minute: int  # default 60
    # ...
```

## Categorias de Tools

### Knowledge Tools (7 tools)

Essas tools cobrem busca, verificacao, enriquecimento e retrieval de documentos.

| Tool | Descricao |
|------|-----------|
| `search_jurisprudence` | Busca hibrida BM25 + semantica com KG boost opcional, reranking, query expansion e paginacao por cursor. Comece por aqui ao buscar casos candidatos. |
| `verify_legal_claims` | Valida sumulas, nomes de ministros, numeros de processo e referencias legislativas contra dados de referencia. Retorna metricas de risco de alucinacao. |
| `get_irac_analysis` | Analise IRAC heuristica (baseada em regex) e contexto do knowledge graph para um documento. Requer um document_id conhecido. |
| `find_similar_cases` | Encontra casos similares usando 70% semantico + 30% sobreposicao estrutural de KG. Faz fallback para apenas semantico em caso de timeout. |
| `get_document_integra` | Recupera o texto completo (inteiro teor) de uma decisao especifica do STJ. Verifique `has_integra` nos resultados de busca antes de chamar. |
| `remember` | Armazena uma memoria key-value de escopo de sessao no PostgreSQL com TTL configuravel (60s a 30 dias). |
| `recall` | Recupera uma memoria de sessao previamente armazenada por chave. Retorna `found=false` quando ausente ou expirada. |

### Graph Tools (10 tools)

Essas tools consultam o knowledge graph Neo4j para insights analiticos.

| Tool | Descricao |
|------|-----------|
| `get_divergencias` | Encontra criterios com resultados divididos (provido vs improvido), rankeados por score de divergencia. |
| `get_turma_divergences` | Analisa resultados divididos por ministro para uma substring de tema. |
| `get_optimal_argument` | Calcula taxas de sucesso de argumentos (criterios, dispositivos, precedentes) para uma categoria e resultado desejado. |
| `get_optimal_argument_by_ministro` | Compara taxas de sucesso especificas do ministro vs medias da categoria, com delta e recomendacoes. |
| `get_ministro_profile` | Perfil completo do ministro: decisoes, criterios, distribuicao de resultados, divergencias com pares. |
| `get_temporal_evolution` | Agrega contagens de jurisprudencia ao longo do tempo com divisao provido/improvido e rotulo de tendencia. |
| `search_features` | Busca estruturada sobre 21 features extraidas por IA com 9 filtros combinaveis. |
| `get_citation_chain` | Rastreia citacoes de saida a partir de uma decisao raiz ate 5 saltos. |
| `get_pagerank` | Rankeia as decisoes mais influentes por pontuacao baseada em citacoes. |
| `get_communities` | Retorna pares de decisoes com alta sobreposicao baseada em criterios juridicos compartilhados. |

### Structural Analysis Tools (3 tools)

| Tool | Descricao |
|------|-----------|
| `get_structural_similarity` | Compara duas decisoes em 5 dimensoes do grafo (criterios, fatos, provas, dispositivos, precedentes) com score Jaccard ponderado. |
| `get_shortest_path` | Encontra o caminho mais curto bidirecional entre duas decisoes usando todos os tipos de relacionamento. |
| `get_graph_embeddings` | Calcula vetores estruturais 7D por decisao (contagens de criterios/fatos/provas/dispositivos, citacoes, resultado codificado). |

### Workflow Tools (8 tools)

Essas tools gerenciam o workflow completo de analise de caso, do envio do PDF ate a revisao humana.

| Tool | Descricao |
|------|-----------|
| `submit_case_pdf_analysis` | Inicia um workflow assincrono de analise de PDF. Aceita local_path (multipart) ou pdf_base64 (JSON). |
| `get_case_pdf_analysis_status` | Consulta o status do workflow para uma analise previamente submetida. |
| `get_case_pdf_analysis_result` | Busca o resultado consolidado de um workflow concluido. |
| `review_case_phase` | Submete aprovacao/rejeicao humana para uma fase especifica do workflow. |
| `review_case_final` | Submete aprovacao/rejeicao humana final para o resultado do workflow. |
| `reprocess_case_analysis` | Cria uma nova execucao imutavel para um workflow existente. Execucoes anteriores sao preservadas. |
| `get_case_workflow_artifacts` | Lista artefatos versionados do workflow (PDF, JSON, markdown, logs). |
| `get_case_artifact_signed_url` | Gera uma URL assinada temporaria para download de um artefato. |

## Autenticacao

### Modo stdio

Nenhuma autenticacao e necessaria para o transporte stdio. O servidor roda como subprocesso local com as mesmas permissoes do processo chamador.

### Modo Remoto (HTTP/SSE)

O servidor remoto suporta autenticacao por API key. As chaves sao configuradas via `VALTER_MCP_SERVER_API_KEYS` (lista separada por virgulas). Falhas de autenticacao sao rastreadas pelo contador Prometheus `valter_mcp_auth_failures_total`.

A configuracao de runtime tambem suporta uma taxa maxima de falhas de autenticacao (`auth_max_failures_per_minute`, padrao 10) para defesa contra tentativas de forca bruta.

## Rate Limiting

Requisicoes MCP tem rate limiting independente da REST API. O limite e configuravel via `VALTER_MCP_RATE_LIMIT_PER_MINUTE` (padrao: 60 requisicoes por minuto por API key).

O estado do rate limit e armazenado no Redis usando uma sliding window. Requisicoes bloqueadas sao contabilizadas pelo contador Prometheus `valter_mcp_rate_limit_blocks_total`. O endpoint `/metrics` do MCP remote server tem acesso restrito por IP via `VALTER_METRICS_IP_ALLOWLIST`.

## Guia de Setup

### Claude Desktop

Adicione o seguinte ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"],
      "env": {
        "VALTER_DATABASE_URL": "postgresql://...",
        "VALTER_QDRANT_URL": "http://localhost:6333",
        "VALTER_NEO4J_URI": "bolt://localhost:7687"
      }
    }
  }
}
```

### Claude Code

Adicione o seguinte ao seu `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "valter": {
      "command": "python",
      "args": ["-m", "valter.mcp"]
    }
  }
}
```

### ChatGPT (Remoto)

Configure a URL do servidor remoto nas configuracoes do GPT customizado no ChatGPT, apontando para o endpoint MCP remoto implantado (ex.: `https://valter.legal:8001/mcp`). A chave de autenticacao HMAC deve corresponder ao `VALTER_MCP_SERVER_API_KEYS` configurado.
