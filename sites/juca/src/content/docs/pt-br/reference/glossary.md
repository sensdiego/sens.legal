---
title: Glossário
description: Definições de termos jurídicos, técnicos e de domínio usados em todo o Juca.
lang: pt-BR
sidebar:
  order: 1
---

# Glossário

> Definições de termos jurídicos, técnicos e de domínio usados em todo o Juca e no ecossistema sens.legal.

## Termos Jurídicos

| Termo | Definição |
|-------|----------|
| **Acórdão** | Decisão de tribunal de segunda instância — o tipo de documento principal no corpus do Juca. Cada acórdão tem uma ementa (resumo), tese e texto completo (íntegra). |
| **Dispositivo Legal** | Uma disposição ou artigo legal específico de uma legislação (ex.: Art. 927 do Código Civil). |
| **Ementa** | Resumo ou cabeçalho de uma decisão judicial. Usado como campo principal de busca na pesquisa híbrida do Juca. |
| **Íntegra** | Texto completo de uma decisão judicial. Acessado via painel SlideOver ou exportado para PDF. |
| **IRAC** | Issue, Rule, Application, Conclusion — framework estruturado de análise jurídica usado pela ferramenta Ratio para extração. |
| **Jurisprudência** | O conjunto de decisões judiciais que formam precedente vinculante ou persuasivo. |
| **Ministro** | Ministro (juiz) do STJ. O Juca rastreia qual ministro foi o relator de cada decisão para análise de divergências. |
| **Parecer** | Opinião jurídica formal — um dos 4 modos de entrega no Briefing Progressivo. |
| **Precedente** | Uma decisão judicial anterior usada como autoridade para sustentar um argumento jurídico. |
| **Ratio Decidendi** | O raciocínio ou princípio jurídico central de uma decisão — o que a torna um precedente. |
| **STJ** | Superior Tribunal de Justiça — o mais alto tribunal do Brasil para matérias federais não constitucionais. O corpus do Juca contém 23.400+ decisões do STJ. |
| **Súmula** | Resumo vinculante de jurisprudência consolidada emitido pelo STJ. Validado pelo sistema anti-alucinação do Juca. |
| **Tese** | Tese jurídica ou argumento extraído de uma decisão. Campo pesquisável no motor de busca do Juca. |
| **Turma** | Divisão ou câmara do STJ que julgou um caso (ex.: 1ª Turma, 2ª Turma). |

## Termos Técnicos

| Termo | Definição |
|-------|----------|
| **Bloco** | Unidade de conteúdo de UI tipada — o bloco de construção fundamental da interface do Juca. 11 tipos: `message`, `progress`, `diagnosis`, `action_prompt`, `precedent`, `precedent_picker`, `summary`, `risk_balance`, `chart`, `delivery`, `exit_card`. |
| **Block Factory** | Funções puras que criam dados de bloco tipados com valores padrão. Localizadas em `src/lib/blocks/types.ts` (ex.: `createDiagnosisData()`, `createRiskBalanceData()`). |
| **Briefing Progressivo** | Sistema de revelação progressiva de 4 fases do Juca: Diagnóstico → Precedentes → Riscos → Entrega. Cada fase revela informações de forma incremental com base na interação do usuário. |
| **Composer** | Componente de input onde os usuários digitam queries e as submetem. Suporta dicas de ferramentas e seleção de modo do pipeline. |
| **Pipeline G,C,R** | Gerar → Criticar → Revisar — padrão de processamento multi-LLM do Juca, onde um gerador cria o conteúdo, críticos o avaliam e um revisor produz o resultado final. |
| **Hub** | O papel arquitetural do Juca: um frontend leve que orquestra agentes de backend (Valter, Leci) em vez de processar dados localmente. |
| **Liquid Legal** | A linguagem de design da UI do Juca. Paleta: `bg-paper` (#F0F0EE), `ink-primary` (#1A161F), `accent` (#FFF06D). |
| **PhaseRail** | Componente visual de navegação que mostra o progresso nas fases do briefing (4 fases como um trilho vertical). |
| **SlideOver** | Painel deslizante para visualizar o texto completo de uma decisão (íntegra) sem sair do contexto atual. |
| **Registro de Ferramentas** | Padrão que roteia intenções do usuário para ferramentas handler especializadas. 5 ferramentas registradas com seleção baseada em prioridade: `analyzer` (9), `juris` (8), `ratio` (7), `compare` (5), `insights` (4). |
| **WorkCanvas** | Área de conteúdo principal que renderiza blocos em sequência. O viewport principal da interface Unified Home. |

## Termos do Ecossistema

| Termo | Definição |
|-------|----------|
| **sens.legal** | A plataforma mãe que engloba Juca, Valter e Leci — um ecossistema de análise jurídica com IA. |
| **Valter** | Agente de backend para jurisprudência do STJ. Serviço Python/FastAPI com 23.400+ decisões, 28 ferramentas MCP, busca BM25 + semântica, grafo de conhecimento Neo4j e pipeline multi-LLM. URL de produção: `https://valter-api-production.up.railway.app`. |
| **Leci** | Agente de backend para legislação federal. TypeScript/Next.js com Drizzle ORM. Atualmente em desenvolvimento inicial (v0.1-pre) com schema de banco de dados pronto, mas ainda sem API pública. |
| **MCP** | Model Context Protocol — interface padronizada para interação de ferramentas de IA. O Valter expõe 28 ferramentas MCP para busca, verificação, análise de grafo e ingestão. |
| **Camada de Adapter** | Abstração planejada (v0.3) que fornece uma interface unificada para o Juca se comunicar com qualquer agente de backend (Valter, Leci, futuros agentes). |
