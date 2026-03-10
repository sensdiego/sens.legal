---
title: "Architecture Diagrams"
description: "Visual diagrams of Juca's architecture, data flows, and component relationships using Mermaid."
lang: en
sidebar:
  order: 4
---

# Architecture Diagrams

All diagrams use Mermaid syntax and render natively in Starlight. Each diagram focuses on one aspect of the system.

## Ecosystem Overview

The three-project sens.legal ecosystem:

```mermaid
graph LR
    subgraph "User-Facing"
        Juca["🖥️ Juca<br/>Frontend Hub<br/>Next.js 16 · React 19"]
    end
    subgraph "Backend Agents"
        Valter["⚖️ Valter<br/>STJ Jurisprudence<br/>FastAPI · 23.4K decisions"]
        Leci["📜 Leci<br/>Federal Legislation<br/>Next.js · Drizzle"]
    end
    subgraph "Infrastructure"
        Railway["Railway<br/>(hosting)"]
        Neo4j["Neo4j Aura<br/>(KG)"]
        Qdrant["Qdrant<br/>(vectors)"]
        PG["PostgreSQL"]
        Redis["Redis<br/>(cache)"]
    end

    Juca -->|"/v1/retrieve<br/>/v1/verify<br/>/v1/graph/*"| Valter
    Juca -.->|"future"| Leci
    Valter --> Neo4j
    Valter --> Qdrant
    Valter --> PG
    Valter --> Redis
    Leci -.-> PG
    Juca --> Railway
    Valter --> Railway
```

## Query Lifecycle

What happens when a user submits a query:

```mermaid
sequenceDiagram
    participant U as User
    participant C as Composer
    participant SA as Server Action
    participant ID as Intent Detector
    participant TR as Tool Registry
    participant V as Valter API
    participant BF as Block Factory
    participant DB as SQLite
    participant SSE as SSE Stream
    participant WC as WorkCanvas

    U->>C: Types legal query
    C->>SA: Submit via Server Action
    SA->>ID: Classify intent
    ID->>TR: Route to tool (e.g., JurisTool)
    TR->>V: POST /v1/retrieve
    V-->>TR: Search results
    TR->>BF: Transform to blocks
    BF->>DB: Persist blocks
    BF->>SSE: Stream block events
    SSE-->>WC: Real-time render
    WC-->>U: Sees structured results
```

## Briefing Progressivo Flow

The 4-phase progressive disclosure system:

```mermaid
flowchart TD
    P0["Phase 0: Chat<br/>message blocks"]
    P1["Phase 1: Diagnosis<br/>diagnosis + action_prompt blocks"]
    P2["Phase 2: Precedents<br/>precedent + precedent_picker blocks"]
    P3["Phase 3: Risks<br/>risk_balance block"]
    P4["Phase 4: Delivery<br/>delivery + exit_card blocks"]

    P0 -->|"User describes case"| P1
    P1 -->|"chooseSituation()"| P2
    P2 -->|"evaluatePrecedent()"| P3
    P3 -->|"advanceToPhase3()"| P4
    P4 -->|"generateDelivery()"| PDF["PDF Export"]

    V1["/v1/retrieve"] -.-> P1
    V2["/v1/retrieve<br/>/v1/similar_cases"] -.-> P2
    V3["/v1/graph/optimal-argument<br/>/v1/graph/divergencias"] -.-> P3

    style P0 fill:#f5f5f5,stroke:#333
    style P1 fill:#e8f4fd,stroke:#0066cc
    style P2 fill:#e8f4fd,stroke:#0066cc
    style P3 fill:#e8f4fd,stroke:#0066cc
    style P4 fill:#e8f4fd,stroke:#0066cc
```

## Block System Type Hierarchy

The 11 block types and which briefing phase produces them:

```mermaid
graph TD
    BS["Block System<br/>(11 types)"]

    BS --> Chat["Chat Blocks"]
    BS --> Briefing["Briefing Blocks"]
    BS --> Meta["Meta Blocks"]

    Chat --> message["message"]
    Chat --> progress["progress"]

    Briefing --> diagnosis["diagnosis<br/>(Phase 1)"]
    Briefing --> action_prompt["action_prompt<br/>(Phase 1)"]
    Briefing --> precedent["precedent<br/>(Phase 2)"]
    Briefing --> precedent_picker["precedent_picker<br/>(Phase 2)"]
    Briefing --> risk_balance["risk_balance<br/>(Phase 3)"]
    Briefing --> chart["chart<br/>(Phase 3)"]
    Briefing --> delivery["delivery<br/>(Phase 4)"]

    Meta --> summary["summary"]
    Meta --> exit_card["exit_card<br/>(Phase 4)"]
```

## Deployment Architecture

```mermaid
graph LR
    Dev["Developer"]
    GH["GitHub"]
    CI["GitHub Actions<br/>lint + build + test"]
    Rail["Railway<br/>Docker Deploy"]
    Prod["Production<br/>juca on Railway"]
    VProd["Valter API<br/>Railway"]

    Dev -->|"git push"| GH
    GH -->|"on push/PR"| CI
    GH -->|"on merge to main"| Rail
    Rail --> Prod
    Prod -->|"REST API"| VProd
```

## Tool Registry Priority

How the orchestrator selects which tool handles a query:

```mermaid
graph LR
    Query["User Query"] --> ID["Intent Detector"]
    ID --> TR["Tool Registry"]
    TR --> A["AnalyzerTool<br/>priority: 9"]
    TR --> J["JurisTool<br/>priority: 8"]
    TR --> R["RatioTool<br/>priority: 7"]
    TR --> C["CompareTool<br/>priority: 5"]
    TR --> I["InsightsTool<br/>priority: 4"]

    style A fill:#ff6b6b,color:#fff
    style J fill:#ffa94d,color:#fff
    style R fill:#ffd43b,color:#333
    style C fill:#69db7c,color:#333
    style I fill:#74c0fc,color:#333
```
