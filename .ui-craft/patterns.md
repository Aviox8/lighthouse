# Patterns

## Pattern: Monochrome Accent Usage

**Description**: The single accent is white itself. It is reserved for (1)
primary actions, (2) active/selected state, (3) structure that must read as
interactive (focus outlines, hover borders, the logo mark filling black-on-white).
Everything else is black surfaces + hairline borders at #1a1a1a/#2a2a2a.

**Usage**: search CTA, filter active chips, selected result rows, active doc-nav
rules (2px left border), kbd focus, links-on-hover, the filled logo mark.

**Constraints**: Never use the accent as a decorative background; never put two
accent elements competing in the same viewport region; never use moody mid-grays
for body text (muted tier is 0.55 alpha minimum for AA contrast).

## Pattern: Mono Data Voice

**Description**: Coordinates, counts, query parameters, keyboard hints, sidebar
labels, and table headers render in JetBrains Mono with tabular-nums so digits
align in columns.

**Usage**: `.result-coords`, `.filters-count`, `.param-value`, `.search-kbd`,
`.popup-coords`, `.tag-key/value`, `.doc-sidebar-label`, `.static-eyebrow`,
`.code-block-title`, `.landing-table th`.

**Constraints**: Never set long prose in mono; mono is for machine-shaped tokens.

## Pattern: Aggregate-only Summary Card

**Description**: The AI summary sits above results as a bordered card: provider
badge + cached badge, headline, overview, bulleted observations, white caveat
strip, follow-up chips. Loading = 3-line shimmer; error = inline retry.

**Usage**: `SummaryCard` above `ResultList` in the results column.

**Constraints**: Always shows provider name; never hides caveats; follow-up chips are
queries, not links; no individual asset data appears in the card.

## Pattern: Docs Shell (StaticPage)

**Description**: Every content route (/docs, /about, /types, /dev, /license,
/legal, /terms, /privacy) renders inside `StaticPage`: site Navbar on top,
sticky left sidebar with grouped nav (Product / Documentation / Project /
Legal) plus an auto-generated "On this page" TOC extracted from the page's h2
elements, then an article column. Prose, tables, callouts (`doc-callout`,
`doc-callout-accent`), code blocks (`CodeBlock`), and the license chip row all
live under `.static-prose`.

**Usage**: a page imports `StaticPage`, passes `eyebrow` / `title` / `updated` /
`active`, and writes plain JSX children — h2s become TOC entries automatically.

**Constraints**: Never introduce a page-local component library or one-off
styling; reuse `StaticPage`. Never put marketing copy in `static-prose`; keep it
factual and fact-dense. Tables and code render in Mono Data Voice. h2 ids are
generated — do not hardcode ids in page content.

## Pattern: Search Command (Landing + CTA)

**Description**: One sanctioned search input composition: `search-input-wrapper`
with absolutely positioned submit button (right edge), icon (left), spinner and
`/` kbd chip inside the 128px right gutter. The landing (`/`) and the CTA band
reuse it; `/` and ⌘K/Ctrl+K focus the hero input for real (keydown listener in
`Homepage`).

**Usage**: `Homepage` hero, `CTA` form; `home-search-input` / `home-cta-input`
control the padding-right clearing the gutter.

**Constraints**: Never overlap the kbd chip with the submit button; never show a
dead keyboard hint — if the chip renders, the handler must exist. Examples chips
(`home-chip`) must use valid grammar (radius values in km, ≤ 500).

<!-- Add more patterns below. -->
