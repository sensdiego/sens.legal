---
title: "Interface Web"
description: "Shell atual de busca e a próxima camada de UX para descoberta e leitura legislativa."
lang: pt-BR
sidebar:
  order: 5
---


# Interface Web

## A UI atual já é uma shell funcional
O Leci já não entrega apenas uma landing page mínima. A superfície web atual é uma shell de busca que valida o loop de recuperação legislativa ponta a ponta.

## Comportamento já implementado
A UI atual já inclui:
- experiência de busca montada a partir de `src/app/page.tsx`
- estado da consulta refletido na URL
- canvas central de resultados
- trilhos/painéis de contexto e navegação
- carregamento incremental de resultados adicionais

## Para que essa interface existe
A shell atual não existe para "embelezar" o produto antes da hora. O papel dela é validar que retrieval legislativo, enquadramento de resultados e contexto documental podem ser exercitados de forma confiável.

## O que ainda vem a seguir
A próxima camada de UX inclui:
- lookup mais forte de normas e referências conhecidas;
- fluxos de leitura estrutural mais ricos no nível de dispositivo/artigo;
- contexto de grounding mais claro para consumidores downstream como o Valter.

## UX quality constraints
Usuários jurídicos precisam de previsibilidade, clareza de fonte e contexto estrutural explícito.

:::caution
Não apresente respostas geradas ou inferidas sem contexto claro de evidência. A UI do Leci deve continuar grounding-first, não answer-first.
:::
