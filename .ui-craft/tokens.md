# Design Tokens

## Colors
- Accent: #fff (hover/active identical); soft wash rgba(255,255,255,.08); on-accent text #000
- Surfaces: #000 (bg), #0a0a0a (panels/elevated), #141414 (raised/inputs), #1a1a1a (hover)
- Borders: #2a2a2a (primary), #1a1a1a (hairline/secondary), #3a3a3a (strong/hover)
- Text: #fff (primary), rgba(255,255,255,.6) (secondary), rgba(255,255,255,.55) (muted)
- Semantic: info/success/error/warning are all #fff with rgba(255,255,255,.08) soft
  washes — severity is communicated by copy and context, never by hue
- Selection: rgba(255,255,255,.2)

## Typography
- UI: Inter (next/font, --font-sans), 14px body, 13–13.5px controls, 10–11px mono labels
- Mono: JetBrains Mono (next/font, --font-mono) for coords, counts, query params,
  kbd chips, sidebar labels, table headers
- Weights: 400 body, 500–600 labels/buttons, 650 headings (semibold, not bold)
- Numeric: tabular-nums on mono counters
- Eyebrows/labels: uppercase, letter-spacing 0.09–0.16em

## Spacing
4px base grid. Component padding: 8px (dense list rows), 12px (rows/cards),
16px (panel padding/gutters), 22–26px (section/article padding); 1px-gap hairline
grids on feature grids (gap shows the border color).

## Radius
Zero everywhere — --radius-sm/--radius/--radius-lg are all 0, and nothing
(menus, popups, chips, map controls) is exempted. Corner radius is never used
for emphasis or polish.

## Shadows
--shadow-lg: 0 24px 64px rgba(0,0,0,.8) — popovers/modals only; leaflet zoom
box-shadow. Depth otherwise comes from surface and border tokens.

## Motion
--transition: 150ms cubic-bezier(0.4,0,0.2,1). No bounce/elastic easings.
prefers-reduced-motion collapses all animation/transition durations to ~0.
