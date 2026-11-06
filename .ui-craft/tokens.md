# Design Tokens

## Colors

The same semantic tokens resolve differently under `data-theme="dark"` (the
default) and `data-theme="light"`. Components consume tokens only; map tiles
and marker badges are intentionally exempt.

### Dark
- Accent: #fff (hover/active identical); soft wash rgba(255,255,255,.08); on-accent text #000
- Surfaces: #000 (bg), #0a0a0a (panels/elevated), #141414 (raised/inputs), #1a1a1a (hover)
- Borders: #2a2a2a (primary), #1a1a1a (hairline/secondary), #3a3a3a (strong/hover)
- Text: #fff (primary), rgba(255,255,255,.6) (secondary), rgba(255,255,255,.55) (muted)
- Semantic: info/success/error/warning are all #fff with rgba(255,255,255,.08) soft
  washes — severity is communicated by copy and context, never by hue
- Selection: rgba(255,255,255,.22); nav shadow rgba(0,0,0,.55)

### Light
- Accent: #000; on-accent text #fff; soft wash rgba(0,0,0,.07)
- Surfaces: #fff (bg), #f5f5f7 (panels), #e9e9ee (raised/inputs), #eeeef2 (hover)
- Borders: #d7d7dc (primary), #e6e6ea (hairline/secondary), #c0c0c8 (strong/hover)
- Text: #1d1d1f (primary), rgba(29,29,31,.64) (secondary), rgba(29,29,31,.5) (muted)
- Semantic: all collapse to #000 with rgba(0,0,0,.06) soft washes
- Selection: rgba(0,0,0,.15); nav shadow rgba(0,0,0,.08)

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
Theme-independent corner scale on `:root`:
- 6px — tiny chips, badges, kbd, inline code, map marker badges
- 8px — buttons, fields, inputs, result/filter rows, nav mark, map controls, preview links
- 12px — cards, panels, popups, table shells, callouts, navbar, preview frames
- 999px — status dots and scrollbar thumbs only; never interactive pills

Map tiles and the black/white marker colours stay exempt; their corners are set
to sit inside the same scale (6px badge, 8px controls, 12px popup).

## Shadows
--shadow-lg: 0 24px 64px rgba(0,0,0,.8) — popovers/modals only; leaflet zoom
box-shadow. Depth otherwise comes from surface and border tokens.

## Motion
--transition: 150ms cubic-bezier(0.4,0,0.2,1). No bounce/elastic easings.
prefers-reduced-motion collapses all animation/transition durations to ~0.
