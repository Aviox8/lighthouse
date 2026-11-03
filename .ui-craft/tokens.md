# Design Tokens

## Colors
- Accent (beacon): #f0b429, hover #f5c754, active #d99a17; soft wash rgba(240,180,41,.12); on-accent text #171106
- Surfaces: #0a0e14 (app bg), #10151f (panels), #161d2b (raised), #131a26 (elevated/popovers), #1d2637 (hover)
- Borders: #232d40 (primary), #1a2231 (hairline/secondary), #33405c (strong/hover)
- Text: #e8edf6 (primary), #9aa8bf (secondary), #66748c (muted)
- Semantic: info #6fb6ff, success #46d08a, error #f26d6d, warning #f0b429
- Cluster scale: amber (small) → #e0733a (medium) → #e05252 (large) → red gradient (xlarge)
- Selection: rgba(240,180,41,.28)

## Typography
- UI: Inter (next/font, --font-sans), 14px body, 13.5px controls, 10.5–11px mono labels
- Mono: JetBrains Mono (next/font, --font-mono) for coords, counts, query params, kbd chips
- Weights: 400 body, 500–600 labels/buttons, 650–700 headings (semibold, not bold)
- Numeric: tabular-nums on mono counters

## Spacing
4px base grid. Component padding: 8px (dense list rows), 12px (rows/cards),
16px (panel padding/gutters), 22–26px (section/modal padding).

## Radius
--radius-sm 8px (buttons, chips), --radius 12px (inputs, popovers, panels),
--radius-lg 16px (modal), pill 999px (badges).

## Shadows
--shadow-lg: 0 24px 64px rgba(0,0,0,.5) — popovers, modals, layer control only.
No shadows on inline surfaces; depth comes from surface tokens.

## Motion
--transition: 150ms cubic-bezier(0.4,0,0.2,1). No bounce/elastic easings.
Transforms limited to translateY(1px) press feedback and 1.08–1.1 cluster hover.
