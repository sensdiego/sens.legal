# Silo Portal — Content Pass Session Protocol

**Date:** 2026-04-08
**Author:** Diego (with Claude as co-writer)
**Tracks:** sensdiego/sens.legal#8
**Status:** active

## Purpose

Author the final copy for the 37 `<TodoBlock>` slots that the gated portal
shipped with in PR #7. This spec records the protocol we agreed to follow
when running live interactive writing sessions with Claude — it is not a
one-shot implementation plan. It applies to every session until the 37
slots are closed.

## Scope

In scope:

- All 37 `<TodoBlock>` slots across 9 files: `index.astro`, `about.astro`,
  and the 7 `/inside/*` chapters.
- Removing `<TodoBlock>` imports and components as each file is completed.
- Editorial discipline enforcement on every slot (see Guardrails below).

Out of scope for the writing session itself:

- Rendering the Mermaid diagram to SVG (mechanical; done separately).
- Adding a `source` field to `proofPoints` in `constants.ts` (small
  structural change; can land in the same PR but does not need Diego's
  interactive input).
- Phases 5-8 of the portal launch runbook (Vercel teardown, DNS cleanup,
  silo-site archival).

## Chapter order

Writing order follows the reviewer's DD journey, not file order:

1. `inside/thesis.astro` — the bet (3 slots)
2. `inside/system.astro` — architecture minus diagram (5 slots)
3. `inside/proof.astro` — what runs today (4 slots)
4. `inside/depth.astro` — engineering deep dives (6 slots)
5. `inside/decisions.astro` — ADRs and premortems (5 slots)
6. `inside/roadmap.astro` — phases, risks, kill criteria (3 slots)
7. `inside/team.astro` — team and cadence (4 slots)
8. `about.astro` — public about page (3 slots)
9. `index.astro` — public landing polishing (4 slots)

## Per-slot protocol

For each slot Claude executes this loop:

1. Read the slot, its surrounding section, and the corpus reference (if any).
2. Classify the slot into one of three input modes:
   - **Factual:** Claude asks concrete specific questions, Diego gives short
     answers, Claude drafts alone in editorial voice.
   - **Narrative/personal:** Claude asks open questions, Diego speaks freely
     (long, unstructured, PT-BR ok), Claude distills.
   - **Creative:** Diego drafts a rough first pass (1-3 minutes), Claude
     refines for voice, tone, length.
3. Ask the question in the agreed mode.
4. Wait for Diego's response.
5. Edit the `.astro` file directly, removing the `<TodoBlock>` and writing
   the final copy inline.
6. Wait for Diego to approve or request an adjustment.
7. Move to the next slot.

## Editorial guardrails (enforced on every slot)

- EN-only. No PT-BR anywhere in the output.
- Restraint over marketing. No empty adjectives.
- Functional names only (main interface, intelligence engine, legislative
  grounding, document intelligence, evaluation layer). Never use internal
  codenames (Valter, Juca, Leci, Douto).
- No emoji.
- "What this document does not cover" sections, where present, keep their
  form.
- Target ~30 minutes total reading time across the 7 `/inside` chapters
  (rough average of 4 minutes per chapter).

## Git and PR discipline

- New branch: `content/silo-portal-pass`.
- Commit per completed chapter, not per slot (keeps history clean).
- At the end of each session — even if incomplete — open/update a single PR
  with what is ready. Unfinished slots are listed explicitly in the PR body
  as a living checklist.
- The PR stays open across multiple sessions until all 37 slots are closed.
- No partial merges to main.

## Stop criteria per session

- If a chapter finishes and Diego's attention is fading, stop there with a
  clean commit. One polished chapter beats seven shallow ones.
- If the session is flowing, continue until Diego's energy or focus drops.

## Definition of done (overall)

- All 37 `<TodoBlock>` slots replaced with final copy.
- All `<TodoBlock>` imports and component usages removed from the 9 files.
- Mermaid diagram rendered to SVG and committed at
  `portal/public/diagrams/silo-system.svg` (separate task).
- Manual smoke test in production: read the 7 `/inside` chapters in order,
  verify reading time is ~30 minutes.
- One final editorial review pass against the guardrails above before
  merging the PR.
