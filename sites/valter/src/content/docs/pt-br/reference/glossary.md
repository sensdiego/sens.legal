---
title: Glossario
description: Termos do dominio juridico e conceitos tecnicos usados na documentacao e no codebase do Valter.
lang: pt-BR
sidebar:
  order: 1

---

# Glossario

Termos essenciais do dominio juridico brasileiro e da arquitetura tecnica do Valter. Compreender estes termos e fundamental para trabalhar com o codebase e ler a documentacao.

## Dominio Juridico

### A

**Acordao**
Decisao colegiada (coletiva) de um tribunal, proferida por um colegiado de ministros e nao por um juiz singular. A maioria das decisoes do STJ indexadas pelo Valter sao acordaos.

### C

**Criterio**
Criterio ou padrao juridico aplicado pelo tribunal para decidir um caso. No knowledge graph, criterios sao nos que conectam multiplas decisoes que aplicam o mesmo teste juridico.

### D

**Desembargador**
Magistrado de um tribunal regional (TRF). Relevante para a expansao multi-tribunal na v2.0. Equivalente a "juiz" em nivel de apelacao.

**Dispositivo Legal**
Dispositivo legal -- um artigo, paragrafo ou inciso especifico de uma lei ou regulamento citado em uma decisao judicial. No knowledge graph, dispositivos conectam decisoes que aplicam o mesmo texto legal.

**Divergencia**
Desacordo entre ministros ou turmas sobre como aplicar um criterio juridico. O analitico de grafo do Valter pode detectar e rastrear divergencias ativas, que sao valiosas para identificar areas do direito ainda nao pacificadas.

### E

**Ementa**
Resumo oficial ou cabecalho de uma decisao judicial. E o texto mais comumente indexado no corpus do Valter. A maioria dos ~23.400 documentos possui ao menos uma ementa; menos possuem o texto completo (integra).

### F

**Fase**
Fase processual ou estagio em um processo (ex: peticao inicial, defesa, julgamento). Usada no pipeline do PROJUDI para classificar tipos de documentos dentro de um processo.

### I

**Integra**
Texto completo de uma decisao judicial, em oposicao a apenas a ementa (resumo). Baixar e indexar integras melhora a qualidade da busca e permite analises mais profundas.

**IRAC**
Issue, Rule, Application, Conclusion -- um framework padrao de analise juridica. O Valter usa IRAC para estruturar a analise de decisoes judiciais, decompondo cada uma em seus passos constitutivos de raciocinio. Implementado em `models/irac.py`.

### J

**Jurisprudencia**
Conjunto de decisoes judiciais sobre um tema. O dominio principal do Valter e a jurisprudencia do STJ em materias de direito federal.

### M

**Ministro**
Magistrado de um tribunal superior (STJ, STF). O Valter rastreia padroes de voto, especializacoes e divergencias dos ministros.

**Ministro Relator**
O ministro relator -- o magistrado designado para um caso que redige a decisao e a apresenta ao colegiado. A identidade do relator e um campo de metadata essencial para toda decisao indexada.

### N

**Numero de Registro**
Numero de registro de uma decisao no sistema interno do tribunal. Usado como identificador unico ao vincular aos registros publicos do STJ.

### P

**Precedente**
Decisao judicial anterior usada como base para um argumento juridico. No knowledge graph, relacoes de precedentes formam cadeias de citacao que o motor de raciocinio percorre.

**PROJUDI** (Processo Judicial Digital)
Sistema de processo judicial eletronico usado nos tribunais estaduais do Parana (PR). O Valter possui um pipeline especifico (`core/projudi_pipeline.py`) para extrair e classificar documentos de processos do PROJUDI.

### R

**REsp** (Recurso Especial)
Recurso especial ao STJ sobre materias de interpretacao de lei federal. REsps sao o tipo mais comum de decisao no corpus do Valter.

### S

**Secao**
Secao do tribunal, composta por duas turmas. O STJ possui tres secoes: 1a Secao (1a + 2a Turma), 2a Secao (3a + 4a Turma) e 3a Secao (5a + 6a Turma). Secoes julgam casos quando as turmas divergem.

**seqDocumento**
Identificador sequencial de documento no sistema interno do STJ. Usado para vincular diretamente a decisoes especificas no portal do STJ.

**STF** (Supremo Tribunal Federal)
Supremo Tribunal Federal do Brasil. Trata de materias constitucionais. Planejado para a expansao multi-tribunal na v2.0.

**STJ** (Superior Tribunal de Justica)
Superior Tribunal de Justica do Brasil. Responsavel por unificar a interpretacao da lei federal. Fonte de dados primaria e atualmente unica do Valter.

**Sumula**
Enunciado juridico vinculante emitido por um tribunal superior (STJ ou STF) que consolida o entendimento do tribunal sobre uma questao juridica especifica. Sumulas sao numeradas (ex: Sumula 123/STJ) e possuem peso precedencial significativo.

### T

**TRF** (Tribunal Regional Federal)
Tribunais Regionais Federais em nivel de apelacao. O Brasil possui seis TRFs. Planejados como primeiro alvo de expansao na v2.0.

**TST** (Tribunal Superior do Trabalho)
Tribunal Superior do Trabalho. Trata de recursos em materia trabalhista. Planejado para v2.0.

**Turma**
Colegiado ou divisao de ministros que julga casos. O STJ possui seis turmas. Cada ministro pertence a uma turma. A designacao de turma afeta quais casos um ministro julga e pode revelar padroes no comportamento de voto.

---

## Termos Tecnicos

### A

**ARQ** (Async Redis Queue)
Biblioteca Python para processamento de jobs em background usando Redis como broker. O Valter usa ARQ para tarefas de ingestao assincronas em `workers/`.

### B

**BM25** (Best Matching 25)
Algoritmo probabilistico de ranking de texto usado para busca lexica (baseada em palavras-chave). Uma das duas estrategias de recuperacao na busca hibrida do Valter, junto com a busca vetorial semantica.

### C

**Canary Rollout**
Estrategia de deploy onde uma pequena porcentagem do trafego e gradualmente direcionada a um novo sistema para valida-lo antes da migracao completa. Aplicado ao armazenamento de artefatos R2 em `stores/artifact_storage.py`.

**Circuit Breaker**
Padrao de resiliencia que para de chamar um servico que esta falhando apos falhas repetidas, permitindo que ele se recupere. Planejado para v1.1 para prevenir que travamentos do Neo4j bloqueiem todas as requests.

**Cross-Encoder**
Modelo neural que codifica conjuntamente uma query e um documento para scoring de relevancia refinado. Usado na etapa de reranking da busca, apos a recuperacao inicial por BM25 e busca semantica.

### D

**Dual-Vector**
Estrategia de codificacao que cria embeddings separados para fatos e tese juridica dentro de um documento, permitindo recuperacao mais direcionada. Implementado em `core/dual_vector_retriever.py`.

### F

**FRBR** (Functional Requirements for Bibliographic Records)
Modelo conceitual para registros bibliograficos, adaptado como ontologia para o knowledge graph Neo4j do Valter. Estrutura como decisoes, dispositivos e conceitos se relacionam entre si.

### K

**KG Boost** (Knowledge Graph Boost)
Incremento de relevancia aplicado a resultados de busca com base em sua conectividade no knowledge graph Neo4j. Documentos com mais citacoes, criterios compartilhados e conexoes no grafo recebem scores mais altos. Configuravel via `VALTER_KG_BOOST_BATCH_ENABLED`.

### M

**MCP** (Model Context Protocol)
Padrao aberto para integracao LLM-para-ferramenta. Permite que modelos de linguagem como Claude e ChatGPT usem ferramentas externas atraves de definicoes estruturadas de tools com JSON Schema. O Valter suporta dois transportes MCP: stdio (local, para Claude Desktop) e HTTP/SSE (remoto, para ChatGPT e outros consumidores).

### R

**RRF** (Reciprocal Rank Fusion)
Metodo para combinar listas ranqueadas de diferentes estrategias de recuperacao em um unico ranking. O Valter usa RRF para mesclar resultados lexicos BM25 com resultados vetoriais semanticos, produzindo uma lista ranqueada hibrida.

### S

**structlog**
Biblioteca de logging estruturado para Python. O Valter usa structlog para logs formatados em JSON com `trace_id` por request para rastreamento de requests atraves do sistema.
