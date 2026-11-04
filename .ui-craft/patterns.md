# Patterns

## Pattern: Beacon Accent Usage

**Description**: The single amber accent is reserved for (1) primary actions, (2)
active/selected state, (3) live counts that identify the "hero" number of a panel.
Everything else is slate + hairline borders.

**Usage**: search CTA, filter active chips, results count, cluster markers, selected
result rows, kbd focus, links-on-hover.

**Constraints**: Never use accent as a decorative background; never put two accent
elements competing in the same viewport region; never use accent for body text.

## Pattern: Mono Data Voice

**Description**: Coordinates, counts, query parameters, and keyboard hints render in
JetBrains Mono with tabular-nums so digits align in columns.

**Usage**: `.result-coords`, `.results-count`, `.filters-count`, `.param-value`,
`.search-kbd`, `.popup-coords`, `.modal-tag-key/value`.

**Constraints**: Never set long prose in mono; mono is for machine-shaped tokens.

## Pattern: Aggregate-only Summary Card

**Description**: The AI summary sits above results as a bordered card: provider badge
+ caveat icon row, headline, overview, bulleted observations, amber caveat strip,
follow-up chips. Loading = 3-line shimmer; error = inline retry.

**Usage**: `SummaryCard` above `ResultList` in the results column.

**Constraints**: Always shows provider name; never hides caveats; follow-up chips are
queries, not links; no individual asset data appears in the card.

## Pattern: Static Trust Pages

**Description**: Terms, Privacy and Developer ship as content routes behind a
shared `StaticPage` shell: same header/footer as the app, same tokens, Inter for
prose, JetBrains Mono for code and data. Amber is reserved for the logo mark and
hover accents; body copy stays secondary slate.

**Usage**: `/terms`, `/privacy`, `/dev` — all legal/documentation content lives here.

**Constraints**: Never introduce a page-local component library or one-off
styling; reuse `StaticPage`. Never put marketing copy in `static-prose`; keep it
factual and fact-dense. Tables and code blocks render in Mono Data Voice.

<!-- Add more patterns below. -->
