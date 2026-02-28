---
title: Registros de Decisoes de Arquitetura
description: Decisoes arquiteturais chave tomadas durante o desenvolvimento do Valter, com contexto, opcoes consideradas e justificativas.
lang: pt-BR
sidebar:
  order: 3
---

# Registros de Decisoes de Arquitetura

> Decisoes arquiteturais significativas, documentadas com contexto, alternativas consideradas e justificativas.

## O que sao ADRs?

Architecture Decision Records capturam o "por que" por tras de escolhas tecnicas que sao custosas de reverter. Cada ADR documenta o contexto que levou a uma decisao, as alternativas consideradas e as consequencias — tanto positivas quanto negativas. Quando um futuro contribuidor perguntar "por que o Valter usa quatro bancos de dados ao inves de um?", o ADR fornece a resposta sem exigir escavacoes arqueologicas no historico de commits.

Os ADRs do Valter seguem uma estrutura simples: contexto, decisao, alternativas, consequencias e status. Eles sao armazenados em `docs/adr/` como arquivos Markdown.

## Indice de ADRs

| # | Decisao | Status | Data |
|---|---------|--------|------|
| 001 | MCP Remote Transport (streamable-HTTP + HMAC) | Aceito | 2026-02-21 |
| 002 | Conectividade para Consumidores Externos | Aceito | 2026-02-27 |
| 003 | Quatro Data Stores | Aceito | 2026-02 |
| 004 | Injecao de Dependencia Baseada em Protocols | Aceito | 2026-02 |
| 005 | Adiamento do App Directory para v2.1 | Aceito | 2026-02 |

## ADR-001: MCP Remote Transport

**Documento completo:** [`docs/adr/0001-mcp-remoto-https.md`](/adr/0001-mcp-remoto-https)

### Contexto

O servidor MCP do Valter originalmente operava apenas via `stdio` para uso local com Claude Desktop e Claude Code. Para permitir que ChatGPT Apps consumissem as 28 tools MCP do Valter, era necessario um transporte remoto sobre HTTPS — sem quebrar o modo local existente.

Dois modos operacionais ja existiam: tools que executam logica localmente no processo MCP, e tools que fazem bridge para a REST API via HTTP. A decisao precisava evitar regressao no modo `stdio` e evitar acoplamento forte entre o contrato MCP e o contrato interno da REST API.

### Decisao

Adotar um **servico MCP remoto dedicado sobre HTTPS** com transporte **Streamable HTTP** (compativel com SSE), rodando em um entry point separado (porta 8001). O modo `stdio` permanece como padrao para desenvolvimento local.

Escolhas-chave do design:

- **Transporte dual sem regressao** — `python -m valter.mcp` continua funcionando via `stdio`. O modo remoto usa um entry point separado (`remote_server.py`).
- **Separacao de responsabilidades** — o servico MCP remoto expoe contratos de tools para clientes externos. A REST API permanece como backend de dominio interno. A camada MCP faz bridge para a API quando necessario, sem expor detalhes internos.
- **Seguranca deny-by-default** — o endpoint remoto requer autenticacao HMAC. Sem credencial significa 401. Credenciais invalidas ou revogadas produzem entradas de log auditaveis.
- **Observabilidade** — logs estruturados com `trace_id` por request, metricas de latencia e erro por tool, endpoints de health para readiness e liveness.

### Alternativas Rejeitadas

- **REST-only para consumidores externos** — nao satisfaria o requisito do protocolo MCP e forcaria clientes a integrar um contrato REST customizado.
- **Processo unico para API + MCP remoto + stdio** — menor overhead inicial, mas maior acoplamento, rollback mais dificil e risco de regressao no `stdio`.

### Consequencias

O sistema agora tem um terceiro runtime para operar, monitorar e proteger. Mas o contrato MCP esta isolado do contrato da REST API, o `stdio` permanece totalmente operacional como modo de desenvolvimento e fallback, e consumidores externos ganham um caminho de integracao governado.

---

## ADR-002: Conectividade para Consumidores Externos

**Documento completo:** [`docs/adr/0002-conectividade-consumidores-externos.md`](/adr/0002-conectividade-consumidores-externos)

### Contexto

Com o endpoint HTTPS no ar, autenticacao por API key habilitada, rate limiting ativo e observabilidade basica operacional, o proximo desafio era tornar o consumo externo previsivel para integradores. Sem uma politica clara, os riscos incluiam: quebra de contratos para consumidores ja onboardados, regressao silenciosa na qualidade de ranking do knowledge graph, custo operacional de incidentes evitaveis e onboarding lento por falta de guias e exemplos.

### Decisao

Adotar um modelo de conectividade externa orientado a contratos com sete pilares:

1. **Classificacao de estabilidade** por endpoint (experimental, beta, stable)
2. **Versionamento e deprecacao formais** para mudancas de payload
3. **Autenticacao por API key** com escopos minimos e rotacao controlada
4. **Observabilidade operacional** com SLOs e sinais de erro
5. **Kit de DX** para onboarding em menos de um dia
6. **Governanca** com testes de contrato obrigatorios no CI
7. **Paridade producao-avaliacao** para logica de knowledge graph (mesmo scoring em producao e em benchmarks de avaliacao)

### Consequencias

O onboarding externo se torna mais rapido e previsivel. O custo e maior disciplina: manutencao de changelog, atualizacao de testes de contrato e revisao obrigatoria para PRs que impactam contratos voltados ao exterior.

---

## ADR-003: Quatro Data Stores

### Contexto

Dados juridicos possuem quatro padroes de acesso fundamentalmente diferentes:

- **Queries relacionais** — documentos com metadados, features, jobs, audit logs. Necessita integridade transacional, filtragem flexivel e migracoes de schema.
- **Busca semantica** — encontrar decisoes por significado, nao apenas por palavras-chave. Requer similaridade vetorial de alta dimensionalidade com latencia sub-segundo.
- **Travessia de grafo** — seguir relacoes entre decisoes, criterios, dispositivos legais, precedentes e ministros. Necessita queries multi-hop, path finding e deteccao de comunidades.
- **Cache efemero** — resultados de queries com TTL curto, contadores de rate limiting e filas de jobs em background. Necessita acesso sub-milissegundo.

### Decisao

Usar quatro bancos de dados especializados, cada um no seu papel ideal:

| Store | Carga de Trabalho |
|-------|-------------------|
| PostgreSQL 16 | Dados relacionais: documentos, features, metadados, jobs, memoria, auth |
| Qdrant | Similaridade vetorial: embeddings 768-dim com filtragem por payload |
| Neo4j 5.x / Aura | Grafo: ontologia FRBR com ~28K nos e ~207K arestas |
| Redis 7 | Cache: resultados de queries (TTL 180s), rate limiting, fila de jobs ARQ |

### Alternativas Consideradas

- **PostgreSQL + pgvector** — consolidaria dois bancos em um. Rejeitado porque o pgvector na epoca nao tinha filtragem por payload e o overhead operacional de um banco vetorial dedicado era minimo com Docker Compose.
- **PostgreSQL unico para tudo** — queries de grafo exigiriam CTEs recursivas custosas ao inves de travessia nativa de grafo. As queries multi-hop do knowledge graph (cadeias de citacao de profundidade 5, deteccao de comunidades, PageRank) nao sao praticas em SQL.
- **Solucoes apenas gerenciadas** — aumentaria custo e introduziria vendor lock-in em um estagio inicial.

### Consequencias

A complexidade operacional e maior (quatro servicos para manter). Mas cada store entrega performance otima para sua carga de trabalho, e o Docker Compose abstrai a complexidade para desenvolvimento local. Em producao, o Railway gerencia os servicos com health checks.

---

## ADR-004: Injecao de Dependencia Baseada em Protocols

### Contexto

A logica de negocio do core (retriever, enricher, verifier) precisa chamar data stores, mas deve permanecer testavel e substituivel. Se modulos do core importassem classes concretas de stores diretamente, testes exigiriam conexoes live com bancos de dados e trocar uma implementacao de store exigiria modificar logica do core.

### Decisao

Definir **classes `Protocol` runtime-checkable** em `core/protocols.py`. Cada protocol especifica a interface que um store deve satisfazer (assinaturas de metodos com type hints). Stores concretos em `stores/` implementam esses protocols. O mecanismo `Depends()` do FastAPI conecta instancias concretas nos route handlers via `api/deps.py`.

```python
# core/protocols.py
from typing import Protocol, runtime_checkable

@runtime_checkable
class DocStore(Protocol):
    async def get_document(self, doc_id: str) -> Document | None: ...
    async def search_documents(self, query: str, limit: int) -> list[Document]: ...

# stores/postgres_doc_store.py
class PostgresDocStore:  # No explicit inheritance needed
    async def get_document(self, doc_id: str) -> Document | None:
        ...  # Concrete implementation
```

### Alternativas Consideradas

- **Classes base abstratas (ABCs)** — funcionariam, mas exigem heranca explicita, o que adiciona acoplamento. Protocols usam subtipagem estrutural (duck typing com type safety).
- **Imports diretos** — abordagem mais simples, mas torna testes impossiveis sem bancos de dados live e impede a troca de implementacoes.
- **Frameworks de DI (ex.: dependency-injector)** — adiciona uma dependencia de terceiros para um problema ja resolvido pelo `Depends()` do FastAPI.

### Consequencias

Modulos do core tem zero acoplamento com implementacoes concretas de stores. Testes usam mock stores que satisfazem o mesmo protocol. Trocar um store (por exemplo, substituir `QdrantVectorStore` por um banco vetorial diferente) requer apenas implementar o protocol e atualizar `deps.py` — nenhuma mudanca no codigo do core.

---

## ADR-005: Adiamento do App Directory

### Contexto

A submissao do Valter ao ChatGPT App Directory estava planejada para v1.2. Um exercicio de premortem revelou que, com uma estimativa de ~200 chamadas de tools ao longo de 3 meses via descoberta pelo App Directory, o custo de conformidade (HTTPS obrigatorio, politicas de privacidade/termos publicadas, empacotamento de metadados, auditoria de seguranca) nao se justificaria pelo uso esperado.

### Decisao

Adiar a submissao ao App Directory para **v2.1**. No curto prazo, priorizar o atendimento a usuarios diretos (1-2 escritorios de advocacia) e a construcao da funcionalidade Reasoning Chain (v1.2), que oferece maior diferenciacao do que visibilidade no marketplace.

### Consequencias

Visibilidade reduzida no curto prazo no ecossistema ChatGPT. Mas recursos sao redirecionados para o Legal Reasoning Chain — a funcionalidade que transforma o Valter de um backend de busca em um motor de raciocinio, que e o real diferencial competitivo.

---

## Decisoes Pendentes

As seguintes decisoes estao em aberto e serao resolvidas conforme o projeto evolui:

| # | Decisao | Contexto |
|---|---------|----------|
| 1 | Cronograma de ativacao do canary R2 | Atualmente em 0%. Quando passar para 5%, depois 100%? Necessita validacao E2E. |
| 2 | Sunset de rotas legadas | Rotas com header `Sunset: 2026-06-30`. Quando remove-las completamente? |
| 3 | Autoria de privacidade e termos | Necessario para App Directory e consumidores externos. Quem redige e hospeda? |
| 4 | Modelo de integracao do Leci | Como o backend de legislacao se conectara ao Valter? Banco compartilhado, chamadas de API ou federacao de grafo? |
| 5 | Nivel de integracao do Juca | Quao acoplado o frontend deve ser a API do Valter? SDK, cliente OpenAPI ou HTTP direto? |
| 6 | Multi-tribunal: qual tribunal primeiro | TRFs, TST ou STF? Cada um tem formatos de dados, metadados e regras de verificacao diferentes. |
| 7 | Escopo de doutrina | Doutrina juridica foi adiada para um repositorio separado. Qual seu escopo e como se relaciona com o Valter? |
| 8 | Modelo de embedding: manter ou migrar | Modelo atual e Legal-BERTimbau (768-dim). O Valter deveria migrar para um modelo maior? Re-indexar ~23K documentos nao e trivial. |
| 9 | Reasoning chain: sincrono vs async vs streaming | O Legal Reasoning Chain (v1.2) orquestra 7 queries. Deveria executar de forma sincrona, como job async ou com streaming de resultados parciais? |
