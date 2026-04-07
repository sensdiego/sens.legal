# Project History

Language: [pt-BR](pt-br/project-history.md) | `English`

This page explains how **Silo** emerged as one product from several
specialized gears. It is broader than a repository changelog and narrower than
the private implementation backlog.

## Sources

This history is grounded in:

- this public repository
- the internal histories already maintained in sibling repositories
- the public product docs in this repo

The most important sibling surfaces behind this narrative are five specialized
internal layers: the primary lawyer-facing interface, the central intelligence
engine, the legislation layer, the doctrine layer, and the document
intelligence and prioritization layer.

## Scope and reading rules

- Evidence window covered here: `2026-01-23` to `2026-03-30` (as of this writing)
- There are no semantic versions or git tags in this repository today
- Pre-public history is included because the product existed before this public
  docs repository was created
- This page stays at product level and does not try to expose private service
  contracts or internal backlog details

## Release map

| Stage | Date | What changed |
|-------|------|--------------|
| Pre-public build | `2026-01-23` to `2026-03-29` | The product shape converged across specialized layers for interface, engine, legislation, doctrine, and document intelligence |
| Public docs baseline | `2026-03-30` | The Silo repository was created as the public documentation home for the unified product |

## Era 0: The product starts before the public repo exists

### `2026-01-23` to early February 2026

The earliest visible part of the story begins in the primary lawyer-facing
interface.

At that stage, the product was still much closer to a fullstack legal
application than to a cleanly separated system of modules. Interface concerns,
legal reasoning, and supporting backend behavior were much more tightly
coupled.

This matters because Silo did not begin as a documentation-first or branding
exercise. It began as a working product effort that later had to separate its
responsibilities more clearly.

## Era 1: The engine splits out

### February 2026

The next major turn is the emergence of a dedicated intelligence engine as a
separate layer.

That split made the product structure more legible:

- the interface layer could narrow toward the main experience for the lawyer
- the engine layer could own retrieval, reasoning, graph-backed intelligence,
  and system-facing contracts

This is the point where Silo starts to become one product with specialized
internal gears rather than one codebase doing everything at once.

## Era 2: The support layers arrive

### Late February to March 2026

Three other layers become visible as first-class parts of the product shape:

- a legislation grounding layer
- a doctrine layer
- an upstream document intelligence and prioritization layer

These layers do not all arrive on the same day, and they do not all have the
same maturity level yet. But together they show the product becoming more
modular and more intentional.

Instead of pushing every legal workflow concern into one place, Silo starts to
organize the work by function:

- main interface
- central intelligence engine
- legislation support
- doctrine support
- document intelligence and signals

That modularity is the real historical precursor to the public Silo narrative.

## Era 3: Convergence under one product name

### `2026-03-30`

By the end of March, the product direction had become clear enough to justify a
public-facing home.

This repository begins on `2026-03-30` with a short but meaningful sequence of
documentation commits:

- bootstrap the public repo
- clarify that the implementation remains private
- add English docs
- make English the primary public docs language

The important point is not the number of commits. It is what they represent:

- one product name: `Silo`
- one public narrative
- several specialized internal gears
- a clearer distinction between public explanation and private implementation

## High-signal timeline

| Date | Why it matters |
|------|----------------|
| `2026-01-23` | The earliest visible product surface begins in the main interface |
| February 2026 | The intelligence engine becomes a clearly separate layer |
| `2026-02-27` onward | The legislation layer strengthens |
| Late February to March 2026 | The doctrine and document-intelligence layers fill their roles more explicitly |
| `2026-03-30` | The public Silo repository is created as the documentation home for the unified product |

## In one sentence

Silo did not start as a standalone public repo; it emerged when a growing set
of specialized product layers had matured enough to be described, externally,
as one coherent legal intelligence system.
