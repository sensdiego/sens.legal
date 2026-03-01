---
title: Glossario
description: Definicoes de termos juridicos, tecnicos e do ecossistema usados na documentacao do Douto.
lang: pt-BR
sidebar:
  order: 1
---

# Glossario

Termos e conceitos que voce encontrara na documentacao do Douto, organizados por dominio.

---

## Termos do Dominio Juridico

### Instituto juridico
Um conceito ou instituto do direito — a unidade fundamental de classificacao doutrinaria. Exemplos: *exceptio non adimpleti contractus* (excecao do contrato nao cumprido), *boa-fe objetiva*, *tutela antecipada*. No Douto, cada chunk e classificado pelo(s) instituto(s) que discute. Este e o principal campo de metadados para busca filtrada e a unidade planejada para notas atomicas.

### Doutrina
Analise e interpretacao academica do direito por juristas e profissionais. Diferentemente da legislacao (a lei em si) ou da jurisprudencia (decisoes judiciais), doutrina representa o entendimento academico e o arcabouco teorico dos conceitos juridicos. O Douto processa exclusivamente doutrina; jurisprudencia fica com Valter/Juca e legislacao com Leci.

### Ramo do direito
Classificacao ampla dos dominios juridicos. O Douto organiza sua knowledge base por ramo. Os ramos reconhecidos atualmente sao:

| Ramo | MOC | Status |
|------|-----|--------|
| Direito Civil | MOC_CIVIL | Ativo (35 livros) |
| Direito Processual Civil | MOC_PROCESSUAL | Ativo (8 livros) |
| Direito Empresarial | MOC_EMPRESARIAL | Ativo (7 livros) |
| Direito do Consumidor | MOC_CONSUMIDOR | Placeholder |
| Direito Tributario | — | Nao criado |
| Direito Constitucional | — | Nao criado |
| Compliance & Governanca | — | Nao criado |
| Sucessoes & Planejamento Patrimonial | — | Nao criado |

### Fontes normativas
Referencias a leis especificas, artigos e dispositivos legais citados na doutrina. Exemplos: "CC art. 476" (Codigo Civil, artigo 476), "CPC art. 300" (Codigo de Processo Civil, artigo 300). Extraidas durante o enriquecimento como campo de metadados para permitir cross-referencing com o servico de legislacao Leci.

### Tipo de conteudo
Classificacao do que um chunk efetivamente contem. Valores usados no enriquecimento:

| Valor | Significado |
|-------|-------------|
| `definicao` | Definicao de um conceito juridico |
| `requisitos` | Requisitos ou elementos de um instituto juridico |
| `exemplo` | Exemplo pratico ou ilustracao de caso |
| `jurisprudencia_comentada` | Decisao judicial comentada |
| `critica_doutrinaria` | Critica doutrinaria ou debate academico |

### Fase processual
Estagio de um processo juridico ou ciclo de vida contratual. Valores: `formacao` (formacao), `execucao` (execucao/cumprimento), `extincao` (extincao/resolucao). Usado nos metadados de enriquecimento para possibilitar filtragem por fase.

### Jurisdicao estrangeira
Quando a doutrina faz referencia a sistemas juridicos de paises que nao o Brasil. Relevante porque o corpus inclui alguns livros de direito comparado internacional.

---

## Termos Tecnicos

### Chunk
Um fragmento semanticamente coerente de um livro juridico, produzido pelo `rechunk_v3.py`. Chunks sao a unidade atomica do pipeline — sao enriquecidos, convertidos em embeddings e buscados individualmente. Um chunk tem frontmatter YAML com metadados e um corpo em markdown. Faixa de tamanho: 1.500-15.000 caracteres de texto real.

### Embedding
Uma representacao vetorial de 768 dimensoes do conteudo semantico de um chunk, gerada pelo modelo Legal-BERTimbau. Embeddings capturam significado em vez de palavras exatas, permitindo busca semantica (encontrar conteudo conceitualmente similar mesmo quando a terminologia e diferente). Armazenados normalizados para calculo de similaridade por cosseno.

### Enriquecimento
O processo de classificar chunks com metadados estruturados usando um LLM (atualmente MiniMax M2.5). Cada chunk e analisado e marcado com `instituto`, `tipo_conteudo`, `ramo`, `fase`, `fontes_normativas` e outros campos. Esses metadados habilitam busca filtrada e sao a base para as features de sintese planejadas.

### Busca hibrida
Abordagem de busca que combina dois metodos de ranqueamento:
- **Busca semantica** — similaridade por cosseno nos embeddings (captura significado)
- **BM25** — ranqueamento probabilistico por palavras-chave (captura termos exatos)

Os scores sao combinados com um peso configuravel (padrao: 0.7 semantico, 0.3 BM25). Isso produz resultados melhores do que qualquer metodo isolado, especialmente para consultas juridicas que misturam intencao conceitual com termos tecnicos especificos.

### MOC (Map of Content)
Um arquivo indice listando todos os livros dentro de um dominio juridico, com metadados e status de processamento. MOCs sao o segundo nivel da hierarquia do skill graph (INDEX -> MOCs -> Livros -> Chunks). Cada MOC corresponde a um ramo do direito. Convencao de nomes: `MOC_{DOMINIO}.md`.

### Skill graph
A estrutura hierarquica de conhecimento mantida pelo Douto:

```
INDEX_DOUTO.md          # Raiz: 8 dominios juridicos
  -> MOC_CIVIL.md       # Indice do dominio: 35 livros
    -> Book directories  # Colecoes de chunks por livro
      -> chunk_001.md   # Chunks individuais enriquecidos
        -> (futuro) notas atomicas  # Uma por instituto juridico
```

Navegavel pela visualizacao de grafo do Obsidian e por wikilinks.

### Nota atomica
Uma nota de conhecimento sobre um unico conceito planejada para o diretorio `knowledge/nodes/` — uma nota por *instituto juridico*, sintetizando informacoes de todos os chunks que discutem aquele conceito em todos os livros.

> **Feature planejada** — Notas atomicas estao no roadmap (F36, v0.5) mas ainda nao implementadas. A decisao D03 (geradas automaticamente vs. curadas manualmente) esta pendente.

### Frontmatter
Bloco de metadados YAML no topo de arquivos markdown, delimitado por marcadores `---`. Contem dados estruturados sobre o chunk (titulo, autor, area do direito, status de enriquecimento, etc.). Parseado por um parser customizado baseado em regex nos scripts do pipeline.

```yaml
---
knowledge_id: "contratos-orlando-gomes-cap05-001"
tipo: chunk
titulo: "Exceptio non adimpleti contractus"
livro_titulo: "Contratos"
autor: "Orlando Gomes"
area_direito: civil
status_enriquecimento: completo
---
```

### Running header
Texto repetido que aparece no topo das paginas de PDF (tipicamente titulo do livro, nome do capitulo ou nome do autor). Sao artefatos do layout do PDF, nao conteudo significativo. O `rechunk_v3.py` os detecta por analise de frequencia e os filtra para evitar chunks falsos.

### Parecer Doutrinario (Doctrine Brief)
Um resumo sintetizado das posicoes de multiplos autores sobre um unico *instituto juridico*. Estruturado para incluir visoes consensuais, posicoes divergentes, evolucao historica e implicacoes praticas.

> **Feature planejada** — O formato de Parecer Doutrinario esta proposto como parte do Motor de Sintese (F43, v0.3.5) mas ainda nao implementado.

---

## Termos do Ecossistema

### sens.legal
A plataforma unificada de pesquisa juridica composta por Douto, Valter, Juca, Leci e Joseph. Tambem referida pelo nome de produto **Jude.md**. Objetivo: fornecer a advogados brasileiros acesso integrado a jurisprudencia, legislacao e doutrina em uma unica interface.

### Valter
Servico de backend do ecossistema sens.legal. Construido com FastAPI, PostgreSQL, Qdrant (banco vetorial), Neo4j (knowledge graph) e Redis. Gerencia jurisprudencia do STJ (23.400+ decisoes) e 28 tools MCP. Principal consumidor dos embeddings doutrinarios do Douto. Repositorio: separado.

### Juca
Hub de frontend do sens.legal. Construido com Next.js. Fornece a interface para advogados, incluindo o sistema de briefing progressivo (4 fases: diagnostico, precedentes, riscos, entrega). Acessa dados doutrinarios atraves do Valter.

### Leci
Servico de legislacao do sens.legal. Construido com Next.js, PostgreSQL e Drizzle ORM. Gerencia base de dados de legislacao federal. Alvo futuro de cross-reference para o Douto (F35 — vinculando comentarios doutrinarios a dispositivos legais especificos).

### Joseph
Agente orquestrador do sens.legal. Coordena trabalho entre Valter, Juca, Leci e Douto. Gerencia casos e workflow.

### Jude.md
Nome de produto da plataforma unificada sens.legal. Juca (jurisprudencia) + Leci (legislacao) + Douto (doutrina) + Valter (backend) = Jude.md. Epic: SEN-368.

### MCP (Model Context Protocol)
Protocolo aberto para expor ferramentas a modelos de IA (desenvolvido pela Anthropic). O Douto planeja expor busca doutrinaria como tools MCP (v0.4, F30), permitindo que Claude Desktop, Claude Code e outros clientes compativeis com MCP consultem doutrina diretamente.

---

## Siglas

| Sigla | Forma completa | Contexto |
|-------|----------------|----------|
| **BM25** | Best Matching 25 | Algoritmo de ranqueamento probabilistico por palavras-chave usado na busca hibrida |
| **BERT** | Bidirectional Encoder Representations from Transformers | Arquitetura por tras do Legal-BERTimbau |
| **STJ** | Superior Tribunal de Justica | Tribunal superior do Brasil — fonte primaria da jurisprudencia do Valter |
| **CPC** | Codigo de Processo Civil | Codigo de Processo Civil Brasileiro (Lei 13.105/2015) |
| **CC** | Codigo Civil | Codigo Civil Brasileiro (Lei 10.406/2002) |
| **CDC** | Codigo de Defesa do Consumidor | Lei 8.078/1990 |
| **ETL** | Extract, Transform, Load | Padrao de processamento de dados — o pipeline do Douto e um sistema ETL |
| **ADR** | Architecture Decision Record | Documento registrando uma decisao arquitetural e sua justificativa |
| **MOC** | Map of Content | Arquivo indice listando recursos dentro de um topico |
| **nDCG** | Normalized Discounted Cumulative Gain | Metrica de qualidade de busca que mede efetividade do ranqueamento |
| **HNSW** | Hierarchical Navigable Small World | Algoritmo de vizinho mais proximo aproximado usado por bancos vetoriais (ex.: Qdrant) |
| **FAISS** | Facebook AI Similarity Search | Biblioteca de busca por similaridade vetorial da Meta |
| **LGPD** | Lei Geral de Protecao de Dados | Lei brasileira de protecao de dados pessoais |
| **MCP** | Model Context Protocol | Protocolo para exposicao de tools de IA (Anthropic) |
| **SSE** | Server-Sent Events | Protocolo de streaming unidirecional servidor-para-cliente |
| **WSL** | Windows Subsystem for Linux | Camada de compatibilidade Linux no Windows — um dos ambientes com paths hardcoded |
