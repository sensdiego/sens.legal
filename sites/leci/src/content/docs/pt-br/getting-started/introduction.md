---
title: "Introdução ao Leci"
description: "O que é o Leci, para quem ele serve e o que já está implementado versus planejado."
lang: pt-BR
sidebar:
  order: 10
---

# Introdução ao Leci

> Esta página explica o que é o Leci, por que ele existe, quem deve usar esta documentação e como interpretar a maturidade atual do projeto.

## O Leci resolve problemas de confiança e estrutura na busca jurídica
O Leci é uma plataforma de informação jurídica focada em legislação federal brasileira, construída para tornar a recuperação de texto legal mais estruturada, rastreável e pronta para consumo por pessoas e por agentes de IA. O código já reflete esse objetivo no modelo de dados: normas são representadas como nós hierárquicos, com base para busca full-text e vetorial, além de trilha de auditoria de revisões.

Na prática, ele ataca três dores comuns:
- Encontrar o conteúdo legal certo com estrutura, e não só páginas soltas.
- Preservar rastreabilidade quando um texto legal precisa de correção/revisão.
- Preparar a base legal para consumo por APIs, agentes e produtos futuros sem reconstruir tudo do zero.

## O objetivo do Leci é ser infraestrutura jurídica confiável, não só interface
A arquitetura atual mostra uma escolha consciente de estratégia "DB-first": schema, indexação e segurança de revisão foram priorizados antes de uma camada rica de produto. Isso fica evidente nos artefatos implementados:
- `src/db/schema.ts` define entidades centrais como `regulations`, `document_nodes`, `embeddings`, `suggestions` e `revisions`.
- `drizzle/0001_init.sql` cria o mesmo modelo no PostgreSQL e já inclui índices para FTS e vetores.
- `scripts/migrate.ts` entrega execução determinística de migrations em ordem.

Essa decisão importa porque produto jurídico quebra rápido quando a integridade dos dados é fraca. Hoje o Leci prioriza integridade e evolução segura.

## O que já está implementado hoje (verificável em código)
A implementação atual é intencionalmente enxuta e verificável.

### Fundação de banco está implementada
O schema PostgreSQL no namespace `leci` já existe com:
- tipos canônicos de norma;
- metadados de normas;
- nós hierárquicos de texto legal;
- suporte de índice full-text (`tsvector` + GIN);
- armazenamento vetorial (`vector(768)` + IVFFlat);
- sugestões e histórico de revisão.

### Primitiva de segurança de revisão está implementada
Existe um invariante crítico em nível de banco: alterações de texto legal devem passar por `leci.apply_revision(...)`, garantindo registro de valor anterior/novo e histórico de revisão.

:::danger
Não atualize `document_nodes.content_text` diretamente via SQL ou código de aplicação. O invariante do projeto exige uso de `leci.apply_revision(...)` para manter auditabilidade.
:::

### Superfície web é mínima
A aplicação Next.js hoje renderiza uma homepage simples (`src/app/page.tsx`) e ainda não expõe rotas internas de API para busca jurídica.

### Linha de tooling existe
`package.json` já traz scripts de desenvolvimento, build, lint e teste (`node --test`, ainda sem suites no momento).

## O que está planejado versus disponível agora
O roadmap contém capacidades importantes que ainda não estão implementadas neste repositório.

> 🚧 **Planned Feature** — Camada interna de busca/API para recuperação jurídica está no roadmap, não no código atual.

> 🚧 **Planned Feature** — Fluxos web completos (buscar, navegar, ler) estão planejados; hoje a UI é só landing page.

> 🚧 **Planned Feature** — Ingestão de fontes legais (ex.: Planalto/LexML) aparece no planejamento, mas ainda não existe no código.

Ao escrever ou consumir documentação técnica, sempre diferencie:
- **comportamento atual** (verificado no código), de
- **comportamento planejado** (aprovado no roadmap, ainda futuro).

## Para quem esta documentação foi feita
Esta documentação atende quatro públicos com objetivos diferentes.

### Dono do projeto e decisores
Você precisa de clareza de execução: o que está pronto, o que é risco e o que priorizar.

### Investidores e stakeholders estratégicos
Você precisa de sinais confiáveis: fundamentos técnicos, disciplina de roadmap e mitigação de risco.

### Desenvolvedores futuros
Você precisa de setup reproduzível, restrições arquiteturais e fluxo seguro de contribuição.

### Agentes de IA e sistemas de automação
Você precisa de documentação estável, parseável e explícita sobre o que é fato versus plano.

:::tip
Se você vai integrar um agente de IA, comece pelas seções verificadas em código (setup, schema, invariantes) e avance gradualmente para capacidades planejadas.
:::

## Relação com o ecossistema sens.legal
Pelo contexto do projeto, o Leci faz parte de um conjunto de 3 projetos do domínio sens.legal e tende a ocupar o papel de camada legal/dados nesse ecossistema.

> ⚠️ **Unverified** — Contratos exatos de integração, sequência de adoção e fronteiras de responsabilidade com os outros dois projetos ainda precisam de validação com o dono.

<!-- NEEDS_INPUT: Informar nomes oficiais e contratos de integração dos outros dois projetos do domínio sens.legal, incluindo responsabilidades de dados/API. -->

Até essa validação, esta documentação trata o Leci como produto standalone com integração multi-projeto planejada.

## Como usar esta seção de docs
Siga a seção `getting-started` nesta ordem:
1. `quickstart.md` para subir rapidamente.
2. `installation.md` para setup completo e padrão reproduzível.
3. `development/setup.md` para fluxo diário de contribuição.
