# Project Brief

## Design Intent
A calm, high-signal instrument for OpenStreetMap infrastructure intelligence. Dense
where it needs to be (lists, filters, coords), quiet everywhere else. The beacon
(amber) is used sparingly — active states, key counts, primary actions. It is not a
dashboard; it is a precise tool.

## Audience
Infrastructure analysts, OSINT researchers, and enthusiasts on desktop and mobile.
They care about data fidelity, speed, and honesty about what the map shows. They do
not want marketing treatment, decoration, or "AI dashboard" energy.

## Voice and Tone
Direct and factual. No marketing fluff. Error states name the likely cause. Warnings
say exactly what is incomplete (e.g. the 5,000-feature result cap). AI summaries are
labeled as such with their provider, and never present as measured fact.

## Constraints
- Dark-only interface (no light theme yet). Deep slate surfaces, not pure black.
- One accent (amber, #f0b429) plus semantic info/success/error colors. No gradients
  for decoration, no glow effects, no glassmorphism.
- Focus-visible rings everywhere; `prefers-reduced-motion` honored; WCAG AA text
  contrast on all surfaces.
- Map (Leaflet) must stay fast with 5,000+ markers; popups are lazy-rendered.
- Aggregate-only AI summaries; no individual asset records sent to providers.
