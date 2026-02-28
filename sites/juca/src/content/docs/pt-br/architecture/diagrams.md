---
title: "Diagramas de Arquitetura"
description: "Diagramas visuais da arquitetura do Juca, fluxos de dados e relacionamentos entre componentes usando Mermaid."
lang: pt-BR
sidebar:
  order: 4
---

# Diagramas de Arquitetura

Todos os diagramas usam sintaxe Mermaid e renderizam nativamente no Starlight. Cada diagrama foca em um aspecto do sistema.

## Visão Geral do Ecossistema

O ecossistema sens.legal com seus três projetos:

```mermaid
graph LR
    subgraph "Voltado ao Usuário"
        Juca["🖥️ Juca<br/>Hub Frontend<br/>Next.js 16 · React 19"]
    end
    subgraph "Agentes Backend"
        Valter["⚖️ Valter<br/>Jurisprudência STJ<br/>FastAPI · 23.4K decisões"]
        Leci["📜 Leci<br/>Legislação Federal<br/>Next.js · Drizzle"]
    end
    subgraph "Infraestrutura"
        Railway["Railway<br/>(hospedagem)"]
        Neo4j["Neo4j Aura<br/>(KG)"]
        Qdrant["Qdrant<br/>(vetores)"]
        PG["PostgreSQL"]
        Redis["Redis<br/>(cache)"]
    end

    Juca -->|"/v1/retrieve<br/>/v1/verify<br/>/v1/graph/*"| Valter
    Juca -.->|"futuro"| Leci
    Valter --> Neo4j
    Valter --> Qdrant
    Valter --> PG
    Valter --> Redis
    Leci -.-> PG
    Juca --> Railway
    Valter --> Railway
```

## Ciclo de Vida de uma Consulta

O que acontece quando um usuário envia uma consulta:

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Composer
    participant SA as Server Action
    participant ID as Detector de Intenção
    participant TR as Tool Registry
    participant V as Valter API
    participant BF as Block Factory
    participant DB as SQLite
    participant SSE as SSE Stream
    participant WC as WorkCanvas

    U->>C: Digita consulta jurídica
    C->>SA: Envia via Server Action
    SA->>ID: Classifica intenção
    ID->>TR: Direciona para tool (ex.: JurisTool)
    TR->>V: POST /v1/retrieve
    V-->>TR: Resultados da busca
    TR->>BF: Transforma em blocks
    BF->>DB: Persiste blocks
    BF->>SSE: Transmite eventos de block
    SSE-->>WC: Renderização em tempo real
    WC-->>U: Vê resultados estruturados
```

## Fluxo do Briefing Progressivo

O sistema de divulgação progressiva em 4 fases:

```mermaid
flowchart TD
    P0["Fase 0: Chat<br/>blocks de mensagem"]
    P1["Fase 1: Diagnóstico<br/>blocks diagnosis + action_prompt"]
    P2["Fase 2: Precedentes<br/>blocks precedent + precedent_picker"]
    P3["Fase 3: Riscos<br/>block risk_balance"]
    P4["Fase 4: Entrega<br/>blocks delivery + exit_card"]

    P0 -->|"Usuário descreve o caso"| P1
    P1 -->|"chooseSituation()"| P2
    P2 -->|"evaluatePrecedent()"| P3
    P3 -->|"advanceToPhase3()"| P4
    P4 -->|"generateDelivery()"| PDF["Exportar PDF"]

    V1["/v1/retrieve"] -.-> P1
    V2["/v1/retrieve<br/>/v1/similar_cases"] -.-> P2
    V3["/v1/graph/optimal-argument<br/>/v1/graph/divergencias"] -.-> P3

    style P0 fill:#f5f5f5,stroke:#333
    style P1 fill:#e8f4fd,stroke:#0066cc
    style P2 fill:#e8f4fd,stroke:#0066cc
    style P3 fill:#e8f4fd,stroke:#0066cc
    style P4 fill:#e8f4fd,stroke:#0066cc
```

## Hierarquia de Tipos do Block System

Os 11 tipos de block e qual fase do briefing os produz:

```mermaid
graph TD
    BS["Block System<br/>(11 tipos)"]

    BS --> Chat["Blocks de Chat"]
    BS --> Briefing["Blocks de Briefing"]
    BS --> Meta["Blocks Meta"]

    Chat --> message["message"]
    Chat --> progress["progress"]

    Briefing --> diagnosis["diagnosis<br/>(Fase 1)"]
    Briefing --> action_prompt["action_prompt<br/>(Fase 1)"]
    Briefing --> precedent["precedent<br/>(Fase 2)"]
    Briefing --> precedent_picker["precedent_picker<br/>(Fase 2)"]
    Briefing --> risk_balance["risk_balance<br/>(Fase 3)"]
    Briefing --> chart["chart<br/>(Fase 3)"]
    Briefing --> delivery["delivery<br/>(Fase 4)"]

    Meta --> summary["summary"]
    Meta --> exit_card["exit_card<br/>(Fase 4)"]
```

## Arquitetura de Deploy

```mermaid
graph LR
    Dev["Desenvolvedor"]
    GH["GitHub"]
    CI["GitHub Actions<br/>lint + build + testes"]
    Rail["Railway<br/>Deploy Docker"]
    Prod["Produção<br/>juca no Railway"]
    VProd["Valter API<br/>Railway"]

    Dev -->|"git push"| GH
    GH -->|"no push/PR"| CI
    GH -->|"no merge para main"| Rail
    Rail --> Prod
    Prod -->|"REST API"| VProd
```

## Prioridade do Tool Registry

Como o orquestrador seleciona qual tool trata uma consulta:

```mermaid
graph LR
    Query["Consulta do Usuário"] --> ID["Detector de Intenção"]
    ID --> TR["Tool Registry"]
    TR --> A["AnalyzerTool<br/>prioridade: 9"]
    TR --> J["JurisTool<br/>prioridade: 8"]
    TR --> R["RatioTool<br/>prioridade: 7"]
    TR --> C["CompareTool<br/>prioridade: 5"]
    TR --> I["InsightsTool<br/>prioridade: 4"]

    style A fill:#ff6b6b,color:#fff
    style J fill:#ffa94d,color:#fff
    style R fill:#ffd43b,color:#333
    style C fill:#69db7c,color:#333
    style I fill:#74c0fc,color:#333
```
