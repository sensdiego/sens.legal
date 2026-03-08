---
title: "FAQ"
description: "Perguntas frequentes sobre escopo, setup, status de roadmap e expectativas de integração no Leci."
lang: pt-BR
sidebar:
  order: 2
---


# FAQ

## O Leci já é um produto completo de busca jurídica?
Não. O Leci ainda não deve ser enquadrado como um produto amplo de busca para usuário final. Ele é uma engine legislativa document-first voltada a grounding confiável, mas também já não é "só schema": o repositório já tem `/api/search`, shell funcional e validação com dados reais.

## Posso confiar no caminho de mutação de dados legais?
Sim, desde que as mudanças respeitem o invariante de revisão. Atualizações em texto legal devem passar por `leci.apply_revision()` para preservar auditabilidade.

## Existe API disponível hoje?
Sim. Já existe uma superfície baseline de API no repositório: `GET /api/search`. Grupos mais amplos de endpoints e fluxos de grounding mais ricos são a próxima camada de trabalho.

## Os testes já são abrangentes?
Não. Já existe uma superfície inicial de testes em torno do contrato de busca, mas cobertura ampla de integração e E2E ainda está no roadmap.

## Por onde começo como contribuidor?
Comece por:
1. `getting-started/quickstart`
2. `getting-started/installation`
3. `development/setup`
4. `development/conventions`

## Por que algumas seções estão marcadas como planejadas ou não verificadas?
Essa marcação é intencional para evitar que linguagem de roadmap seja confundida com comportamento implementado, especialmente num projeto em que o baseline de busca já existe, mas os fluxos legislativos mais profundos ainda estão em construção.
