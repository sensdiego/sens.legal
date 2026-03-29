# Design System — sens.legal

## Product Context
- **What this is:** Documentation and infrastructure site for Silo, a legal knowledge graph
- **Who it's for:** Technical investors (YC), developers/integrators, curious lawyers
- **Space/industry:** Legal tech / AI infrastructure / developer documentation
- **Project type:** Doc site with product hub

## Aesthetic Direction
- **Direction:** Editorial/Refined
- **Decoration level:** Intentional — warm background, subtle borders, no gradients or decoration
- **Mood:** A well-typeset research paper that lives in a modern digital environment. Serious without being heavy. Tech without being generic.

## Typography
- **Product name "Silo":** Silo font Bold 700 — custom font, self-hosted. The ONLY use of this font.
- **Display/Titles (h1, h2, h3):** Instrument Sans Bold 700 / SemiBold 600
- **Body:** Instrument Sans Regular 400
- **UI/Labels/Small:** Instrument Sans SemiBold 600
- **Code:** JetBrains Mono Regular 400
- **Loading:** Instrument Sans + JetBrains Mono via Google Fonts. Silo font self-hosted from portal/public/fonts/
- **Scale:**
  - h1: 2.5rem, weight 700, tracking -0.02em
  - h2: 1.75rem, weight 600
  - h3: 1.25rem, weight 600
  - body: 0.9375rem (15px), weight 400, line-height 1.65
  - small: 0.8125rem (13px), weight 400
  - label: 0.6875rem (11px), weight 600, uppercase, tracking 0.1em

## Color
- **Approach:** Restrained — 1 accent + warm neutrals
- **Background:** #FAFAF8 (warm off-white)
- **Surface:** #F2F1EE (cards, code blocks)
- **Text primary:** #1A1A18 (warm near-black)
- **Text secondary:** #5C5C58
- **Text muted:** #9C9C96
- **Border:** #E4E3DF
- **Border active:** #1A1A18
- **Accent:** #2B579A (Word blue — trust, productivity, familiar to lawyers)
- **Accent hover:** #1E3F70
- **Semantic status badges:**
  - Operational: accent blue (#2B579A bg 10%, border 20%)
  - Functional: blue (#1A5C8A bg 10%, border 20%)
  - Building: amber (#8A6B1A bg 10%, border 20%)
- **Dark mode:** Not implemented. Future: invert surfaces, reduce saturation 10-20%.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** xs(0.25rem/4px) sm(0.5rem/8px) md(1rem/16px) lg(1.5rem/24px) xl(2rem/32px) 2xl(3rem/48px) 3xl(4rem/64px)

## Layout
- **Approach:** Grid-disciplined (sidebar + content, consistent alignment)
- **Sidebar width:** 16rem
- **Content max width:** 42rem
- **Header height:** 3.5rem
- **Border radius:** sm:3px (badges, code), md:4px (cards, inputs), lg:6px (large cards)

## Motion
- **Approach:** Minimal-functional
- **Transitions:** color 0.15s, border-color 0.15s (hover states only)
- **No entrance animations, no scroll-driven effects, no bounce**

## Font Files
- Silo font: portal/public/fonts/Silo-Bold.ttf (only weight needed)
- Instrument Sans: Google Fonts CDN
- JetBrains Mono: Google Fonts CDN

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-29 | Initial design system | Created by /design-consultation. Warm editorial aesthetic for legal infra. |
| 2026-03-29 | Silo font for product name only | Custom font too heavy for body/titles. Instrument Sans for everything else. |
| 2026-03-29 | Word blue accent (#2B579A) | Familiar to lawyers, communicates "productive tool", avoids generic SaaS blue. |
| 2026-03-29 | Warm off-white background | #FAFAF8 reduces fatigue, feels like paper, differentiates from pure white docs. |
