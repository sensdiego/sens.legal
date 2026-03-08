---
title: "Introdução ao Leci"
description: "O que é o Leci, para quem ele serve e o que já está operacional na engine legislativa atual."
lang: pt-BR
sidebar:
  order: 10
---

# Introdução ao Leci

> Esta página explica o que é o Leci, por que ele existe, quem ele atende dentro do ecossistema sens.legal e o que já está operacional hoje.

## O Leci é a autoridade legislativa do ecossistema
O Leci é uma engine legislativa document-first focada em legislação federal brasileira. O seu papel não é ser um chatbot jurídico genérico nem um backend indefinido do futuro; o seu papel é tornar a recuperação de texto legal estruturada, rastreável e confiável o suficiente para grounding em Juca e Valter.

Na prática, ele ataca três problemas persistentes:
- encontrar o documento legal certo e o nó estrutural correto, em vez de devolver apenas páginas soltas;
- preservar rastreabilidade quando o texto legal muda ou precisa de correção;
- expor legislação em formato seguro para grounding por sistemas downstream.

## O que já está implementado hoje
A implementação atual já passou da fase de fundações apenas.

### Baseline de API de busca
O Leci já expõe `GET /api/search`, com parâmetros validados, metadados de paginação e campos enriquecidos de norma na resposta. Essa é a superfície mínima atual de recuperação legislativa.

### Shell funcional de busca
A camada web já inclui uma shell funcional de busca que suporta estado da consulta na URL, navegação de resultados, painel de contexto e carregamento incremental, e não apenas uma landing page estática.

### Validação com dados reais
O baseline atual já foi exercitado com dados reais, o que importa porque este projeto precisa ser confiável como camada de grounding, e não apenas descrito como tal.

### Auditabilidade e modelo de dados estruturado
A camada de banco continua central: o schema modela normas e `document_nodes` explicitamente, os vetores de busca vivem no nível do nó documental e a mutação de texto legal é restringida por primitivas de revisão e auditoria.

:::danger
Não atualize `document_nodes.content_text` diretamente via SQL ou código de aplicação. O invariante do projeto exige uso de `leci.apply_revision(...)` para manter auditabilidade.
:::

## O que o Leci não é
Esses limites importam:

- O Leci **não** é o produto final voltado ao usuário do ecossistema.
- O Leci **não** é o dono de busca de jurisprudência, grafo de reasoning ou argumentação ampla.
- O Leci **não** é apenas um backend-placeholder sem API.

Seu papel é mais estreito e mais importante: retrieval legislativo confiável e grounding.

## Relação com o ecossistema sens.legal
O Leci é um dos quatro projetos do sens.legal:

| Projeto | Responsabilidade |
|---------|------------------|
| **Juca** | Hub frontend voltado ao usuário |
| **Valter** | Backend central de jurisprudência e reasoning |
| **Leci** | Engine legislativa document-first e autoridade de grounding |
| **Douto** | Pipeline local de doutrina que alimenta o Valter |

Isso significa que o Leci deve ser descrito como fornecedor de contexto legislativo confiável para o restante do ecossistema, especialmente Valter e Juca.

## O que vem a seguir
A próxima camada de trabalho é sobre profundidade, não sobre existência:

- resolução canônica de referências como nome, sigla e número/ano;
- leitura mais rica por dispositivo e contexto normativo;
- contratos de grounding mais amplos para consumidores downstream como o Valter.

## Para quem esta documentação foi feita
Esta documentação atende quatro públicos:

- donos do projeto e decisores que precisam de clareza de execução;
- contribuidores que precisam de setup e restrições arquiteturais;
- responsáveis por integração que precisam entender fronteiras de grounding;
- agentes de IA que precisam de distinções explícitas entre o que existe e o que ainda é planejado.

:::tip
Se você vai integrar um agente de IA, comece pelo `/api/search` atual e pelo modelo de `document_nodes`, depois adicione comportamentos mais ricos de grounding.
:::

## Como usar esta seção de docs
Siga a seção `getting-started` nesta ordem:
1. `quickstart.md` para subir rapidamente.
2. `installation.md` para setup completo e padrão reproduzível.
3. `development/setup.md` para fluxo diário de contribuição.
