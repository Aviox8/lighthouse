# Project Brief

## Design Intent
A dense, engineering-grade instrument for OpenStreetMap infrastructure
intelligence — Palantir-terminal restraint, not a website with a theme. Strict
monochrome in dark and light, restrained 8/12px corners, type-and-hairline
structure with no decorative color anywhere: severity and emphasis come from
weight, spacing, and copy — never from hue. Dense where it needs to be (lists,
filters, coords, tables), quiet everywhere else.

## Audience
Infrastructure analysts, OSINT researchers, and enthusiasts on desktop and mobile.
They care about data fidelity, speed, and honesty about what the map shows. They do
not want marketing treatment, decoration, or "AI dashboard" energy.

## Voice and Tone
Direct and factual. No marketing fluff. Error states name the likely cause. Warnings
say exactly what is incomplete (e.g. the 5,000-feature result cap). AI summaries are
labeled as such with their provider, and never present as measured fact. The
landing page states numbers that exist (230+ types from ASSET_TYPE_MAP, 5,000 cap,
1 req/s geocoding) — nothing is promised that the code doesn't do.

## Constraints
- Dark and light monochrome themes share one semantic token set; the map and
  marker colors are intentionally theme-exempt.
- One accent per theme: white on black, black on white. No gradients, no glows,
  no glassmorphism, no color coding.
- 6px tiny chips, 8px controls, 12px panels. No pills for interactive controls
  and no mixed radius scale invented per component.
- Focus-visible outlines everywhere; `prefers-reduced-motion` honored; WCAG AA
  contrast on all text (muted tier was bumped to 0.55 alpha for this).
- Map (Leaflet/react-leaflet) stays keyless; popups lazy-rendered; 5,000+ marker
  traffic served by the native marker layer. Mapillary previews are optional,
  server-token-gated, and always fall back to an external link.
- Body scroll is locked for the workbench; landing (`.home`) and docs
  (`.static-shell`) scroll inside their own shells.
- Aggregate-only AI summaries; no individual asset records sent to providers.

## Surfaces
- Workbench (`/workbench`): 3-column panel grid (filters / results / map),
  resizable results column, mobile tab switching.
- Landing (`/`): hairline-grid hero around a real command input, system readout,
  open-data strip, feature grid, query-language table, CTA band.
- Docs shell (`/docs`, `/about`, `/types`, `/dev`, `/license`, `/legal`,
  `/terms`, `/privacy`): sticky site sidebar (section groups + auto "On this
  page" TOC), article column with bordered tables, code blocks, callouts.
