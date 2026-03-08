---
title: "Introdução"
description: "O que é o Valter, por que ele existe, quem o consome e como o graph-led retrieval muda o sistema."
lang: pt-BR
sidebar:
  order: 1
---

# Introdução

O Valter é o backend de jurisprudência e reasoning do ecossistema sens.legal. Ele serve jurisprudência do STJ por REST API e MCP, e existe para transformar decisões brutas em fluxos de retrieval, verificação e reasoning ancorados em dados reais do tribunal.

## Por que o Valter existe

LLMs genéricos são assistentes úteis, mas são pouco confiáveis quando ficam sozinhos com referências jurídicas. Eles alucinam decisões, atribuem ministros errados e achatam estruturas complexas de precedente em resumos vagos.

O Valter existe para resolver esse problema tornando o conhecimento jurídico explícito e consultável. Em vez de pedir a um modelo que improvise em cima do próprio treino, os consumidores pedem ao Valter que recupere, verifique, compare e explique com base em jurisprudência real.

## Quem consome o Valter

O Valter atende três grandes grupos de consumidores:

- **Juca**, o hub frontend que chama o Valter por REST enquanto responsabilidades de backend saem do frontend
- **clientes MCP** como Claude e ChatGPT, que usam o Valter como superfície de ferramentas jurídicas
- **fluxos internos do ecossistema**, que dependem do Valter como camada central de jurisprudência e reasoning

## O que mudou no modelo de retrieval

O paradigma atual de retrieval é **graph-led retrieval**.

Isso significa:
- o grafo jurídico é um caminho primário de descoberta e explicação;
- busca lexical e semântica continuam importantes, mas como sinais complementares e caminhos de fallback;
- o sistema não deve mais ser descrito como "busca híbrida com boost de knowledge graph".

Essa distinção importa porque muda a forma de explicar relevância. A saída deixa de ser apenas "este score é alto" e passa a ser "esta decisão está conectada por entidades, critérios, estrutura de precedentes e evidência adicional de search".

## Capacidades centrais

As principais capacidades do Valter se agrupam em cinco áreas:

### Retrieval
Recuperar jurisprudência, casos similares e conjuntos filtrados de resultados sobre dados do STJ.

### Verificação
Checar se referências, citações e afirmações realmente mapeiam para material do tribunal.

### Reasoning e explicabilidade
Expor caminhos argumentativos orientados a grafo, visões de divergência e explicações no estilo reasoning chain.

### Ingestão e enriquecimento
Sustentar os workflows que mantêm a camada de jurisprudência estruturada e consultável.

### Acesso externo
Expor o mesmo backend por REST e MCP para que frontends e clientes LLM consumam a mesma camada de conhecimento jurídico.

## Onde o Valter se encaixa

Dentro do sens.legal:

| Projeto | Responsabilidade |
|---------|------------------|
| **Juca** | Hub frontend |
| **Valter** | Retrieval de jurisprudência, reasoning, verificação, MCP |
| **Leci** | Grounding legislativo |
| **Douto** | Artefatos de doutrina fornecidos ao Valter |

O Valter é, portanto, ao mesmo tempo um backend standalone e um ponto de convergência da estratégia de migração de backend do ecossistema.

## Arquitetura resumida

O Valter é um monólito modular com múltiplos runtimes:

- REST API para frontends e serviços
- transportes MCP para clientes LLM com uso de tools
- workers em background para ingestão e enriquecimento

O codebase é organizado para que retrieval, lógica de grafo, verificação e interfaces externas vivam no mesmo backend, em vez de serem duplicados pelo ecossistema.
