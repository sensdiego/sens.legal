---
title: "Registros de Decisao Arquitetural"
description: "Decisoes arquiteturais chave do Douto -- contexto, justificativa, trade-offs e questoes pendentes."
lang: pt-BR
sidebar:
  order: 3
---

# Registros de Decisao Arquitetural

Esta pagina documenta o "por que" por tras das escolhas arquiteturais do Douto. Cada ADR segue um formato consistente: contexto, decisao, consequencias e status atual.

## ADR-001: Legal-BERTimbau como Modelo de Embedding

**Status:** Aceito (avaliacao pendente)

**Contexto:** O Douto precisa de um modelo de embedding em portugues otimizado para texto juridico. O modelo deve produzir embeddings adequados para busca por similaridade cosseno.

**Opcoes consideradas:**
- `rufimelo/Legal-BERTimbau-sts-base` -- BERT juridico em portugues, 768 dimensoes, treinado em corpora juridicos
- `multilingual-e5-large` -- Multilingual, 1024 dimensoes, proposito geral
- `Cohere embed-multilingual-v3.0` -- Comercial, excelente desempenho multilingual
- `text-embedding-ada-002` (OpenAI) -- Comercial, proposito geral

**Decisao:** Legal-BERTimbau. E o unico modelo treinado especificamente em texto juridico em portugues, e gratuito e roda localmente sem chamadas de API.

**Consequencias:**
- Limite de 512 tokens significa que chunks com mais de ~2.000 caracteres sao truncados
- Treinado em PT-PT (Portugal), nao PT-BR (Brasil) -- possiveis divergencias sutis
- Nao existe comparacao de benchmark para o dominio especifico do Douto
- A avaliacao esta planejada como [F40](../roadmap/milestones#v05--knowledge-graph--automation)

## ADR-002: MiniMax M2.5 para Enriquecimento de Chunks

**Status:** Aceito (em revisao -- veja [D06](#decisoes-pendentes))

**Contexto:** Cada chunk precisa de classificacao com metadados juridicos estruturados (instituto, tipo_conteudo, ramo, etc.). Isso exige um LLM capaz de compreender conceitos juridicos e produzir JSON valido.

**Decisao:** MiniMax M2.5, acessado via o SDK Python da Anthropic com um `base_url` customizado:

```python
# enrich_chunks.py line 30-31
MINIMAX_BASE_URL = "https://api.minimax.io/anthropic"
MINIMAX_MODEL = "MiniMax-M2.5"
```

**Consequencias:**
- Custo baixo comparado a Claude ou GPT-4
- Usa uma **camada de compatibilidade nao documentada** -- o SDK da Anthropic nao foi projetado para se comunicar com a MiniMax
- Nenhuma validacao de qualidade foi realizada sobre o output de enriquecimento
- Mudancas no SDK da Anthropic ou na API da MiniMax podem quebrar silenciosamente o enriquecimento

## ADR-003: Arquivos JSON Flat em Vez de Banco de Dados Vetorial

**Status:** Aceito (migracao planejada para v0.4)

**Contexto:** O pipeline produz embeddings que precisam ser armazenados e consultados. O Valter (servico backend) ja roda Qdrant como banco de dados vetorial.

**Decisao:** Serializar tudo como arquivos JSON em disco:
- `embeddings_{area}.json` -- vetores como arrays aninhados
- `search_corpus_{area}.json` -- metadados como array de objetos
- `bm25_index_{area}.json` -- documentos tokenizados como array de strings

**Consequencias:**
- Zero dependencia de infraestrutura -- nenhum banco de dados para manter
- Portavel -- arquivos podem ser copiados para qualquer lugar
- **Nao escala** -- todos os dados carregados em memoria a cada consulta (~1 GB para 31.500 chunks)
- Sem indexacao HNSW ou FAISS -- busca e forca bruta O(n) por similaridade cosseno
- Migracao para Qdrant planejada como [M12](../roadmap/milestones#v04--senslegal-integration)

## ADR-004: Implementacao Customizada de BM25

**Status:** Aceito (otimizacao planejada)

**Contexto:** A busca hibrida precisa de um componente de palavras-chave alem da busca semantica. As opcoes incluiam a biblioteca `rank-bm25`, Elasticsearch ou uma implementacao propria.

**Decisao:** BM25 implementado manualmente em `search_doutrina_v2.py` com parametros `k1=1.5, b=0.75`.

**Consequencias:**
- Sem dependencia externa
- Frequencias de documentos sao **recalculadas a cada consulta** -- O(N x T) onde N=documentos, T=termos da query
- Com 31.500 documentos, cada consulta recalcula frequencias de tokens em todo o corpus
- Pre-computacao do indice invertido planejada como [M13](../roadmap/milestones#v04--senslegal-integration)

## ADR-005: Chunking Inteligente em Cinco Passadas

**Status:** Aceito

**Contexto:** Livros juridicos possuem estrutura complexa que o chunking ingenu (por contagem de tokens ou paragrafos) destroi. Running headers da extracao de PDF, notas de rodape separadas do texto, artigos de lei separados de seus comentarios -- tudo isso degrada a qualidade da busca.

**Decisao:** Um algoritmo de cinco passadas em `rechunk_v3.py` (890 linhas):

1. **Divisao por Secao** -- detectar secoes usando 14 padroes regex (headers markdown, capitulos, artigos, etc.)
2. **Classificacao** -- identificar tipo do bloco: ruido, bibliografia, sumario, running header, conteudo
3. **Fusao de Pequenos** -- combinar chunks subdimensionados (< 1.500 caracteres) com vizinhos
4. **Divisao de Grandes** -- quebrar chunks acima de 15.000 caracteres em limites de sentenca
5. **Limpeza** -- remover chunks vazios, normalizar espacos em branco

**Consequencias:**
- Chunks de alta qualidade que preservam o contexto juridico
- 890 linhas de codigo complexo baseado em regex com **0% de cobertura de testes**
- Deteccao de running headers usa analise de frequencia -- heuristica, nao deterministica
- Agregacao de notas de rodape e preservacao de artigos de lei sao especificas do dominio e frageis

## ADR-006: Knowledge Base no Estilo Obsidian

**Status:** Aceito

**Contexto:** A knowledge base precisa ser navegavel por humanos (no Obsidian) e por agentes de IA (via leitura de arquivos).

**Decisao:** Arquivos markdown com frontmatter YAML, wikilinks (`[[target]]`) e estrutura hierarquica de MOCs.

**Consequencias:**
- Legivel por humanos e versionavel
- Compativel com Obsidian para navegacao visual
- Sem camada de consulta programatica -- busca requer leitura de arquivos ou uso da busca do pipeline
- Frontmatter parseado por um parser regex customizado (nao PyYAML), que e fragil com caracteres especiais

## ADR-007: Repositorio Separado vs. Modulo do Valter

**Status:** PENDENTE -- bloqueia v0.4

**Contexto:** O Douto pode existir como modulo dentro do Valter (que ja possui Qdrant, Neo4j e infraestrutura de busca) ou permanecer como repositorio separado com seu proprio servidor MCP.

**Opcoes:**
- **(A)** Repositorio separado com servidor MCP proprio
- **(B)** Modulo em `valter/stores/doutrina/` dentro do Valter
- **(C)** Repositorio separado, mas Valter faz proxy de todas as consultas

Esta decisao ainda nao foi tomada. Veja [D02](#decisoes-pendentes).

## Decisoes Pendentes

Estas decisoes estao bloqueando ou influenciando milestones futuros:

| # | Questao | Opcoes | Bloqueia |
|---|---------|--------|----------|
| D01 | Protocolo de integracao: MCP stdio, MCP HTTP/SSE, REST ou arquivos JSON? | A) MCP stdio B) MCP HTTP C) REST D) Manter JSON | v0.4 |
| D02 | Repositorio separado ou modulo do Valter? | A) Separado + MCP B) valter/stores/doutrina/ C) Separado + proxy | v0.4 |
| D03 | Notas atomicas: geradas automaticamente ou curadas? | A) Auto B) Manual C) Hibrido | v0.5 |
| D04 | Rastreamento de issues: Linear (SEN-XXX) ou GitHub Issues? | A) Linear B) GitHub C) Ambos | -- |
| D05 | Schema Neo4j para nos de doutrina? | A) No Doctrine B) Authority + DoctrineClaim C) Reutilizar Criterion | v1.0 |
| D06 | Manter MiniMax M2.5 ou migrar modelo de enriquecimento? | A) Manter B) Claude C) Modelo local D) Avaliar depois | -- |
| D07 | Prioridades reais do dono do projeto? | Roadmap e inteiramente inferido -- precisa validacao | Todos |
| D08 | Qual LLM para o Synthesis Engine? | A) Claude B) MiniMax C) Outro | v0.3.5 |
| D09 | Doctrine Briefs: sob demanda ou pre-computados? | A) Sob demanda B) Pre-computados C) Hibrido | v0.3.5 |
