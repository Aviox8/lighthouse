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

## Pattern: In-flow Sharp Navbar

**Description**: The site navbar is a sharp bar with 12px margins, a 1px border, zero radius and a drop shadow. It renders **in normal flow** (`position: static`) — page content never scrolls beneath or behind it. Radius stays 0 — never pill the navbar; it breaks the monochrome sharp language everywhere else. Never re-introduce `position: sticky` + translucent/blurred background; content would pass behind it.

**Usage**: `components/Navbar.tsx` + `.navbar*` CSS; every route gets it via its page shell (`.home`, `.static-shell`, `.app-container`).

**Constraints**: Never full-bleed it, never round it, never make it overlapping. The gap, border and shadow are the entire treatment.

## Pattern: Aggregate-only Summary Card

**Description**: The AI summary sits above results as a bordered card: provider
badge + cached badge, headline, overview, bulleted observations, white caveat
strip, follow-up chips. Loading = HeroUI `Skeleton` lines; error = inline HeroUI
`Button` retry.

**Usage**: `SummaryCard` above `ResultList` in the results column.

**Constraints**: Always shows provider name; never hides caveats; follow-up chips are
queries, not links; no individual asset data appears in the card.

## Pattern: Docs Shell (StaticPage)

**Description**: Every content route (/docs, /docs/api, /docs/operations,
/about, /types, /dev, /contributing, /security, /license, /legal, /policy,
/terms, /privacy) renders inside `StaticPage`: site Navbar on top, sticky left
sidebar with grouped nav (Product / Documentation / Project / Legal) plus an
auto-generated "On this page" TOC extracted from the page's h2 elements, then an
article column. Prose, tables, callouts (`doc-callout`, `doc-callout-accent`),
code blocks (`CodeBlock`), and the license chip row all live under
`.static-prose`.

**Usage**: a page imports `StaticPage`, passes `eyebrow` / `title` / `updated` /
`active`, and writes plain JSX children — h2s become TOC entries automatically.
Docs pages in `DOC_SEQUENCE` also get Mapillary-style Previous/Next pagination,
and every page gets an "Edit this page on GitHub" link derived from `active`.

**Constraints**: Never introduce a page-local component library or one-off
styling; reuse `StaticPage`. Never put marketing copy in `static-prose`; keep it
factual and fact-dense. Tables and code render in Mono Data Voice. h2 ids are
generated — do not hardcode ids in page content. New routes must be added to
`SITE_SECTIONS`, the footer columns, `app/sitemap.ts`, and `DOC_SEQUENCE` if
they belong in the docs reading order.

## Pattern: HeroUI Zero-radius Monochrome

**Description**: HeroUI v3 ships a rounded, color-first default theme; the app
flattens it onto Lighthouse tokens in `globals.css` (`--background`/`--surface`/
`--field-*`/`--accent`, `--radius-*` and `--field-radius` = 0, shadows off) and
imports `@heroui/styles` after `tailwindcss`. Components inherit the system; the
only bespoke CSS on top is layout and rhythm.

**Usage**: `SearchField` (/types filter), `ToggleButtonGroup` (mobile workbench
panels), `Skeleton` (summary loading), `Button`, `Chip`, `Card`, `Kbd`,
`Typography` (homepage copy), `InputGroup` (the shared `SearchBar`).

**Constraints**: Never put a HeroUI component that leaks radius or color into the
UI; check computed `border-radius` and non-monochrome colors after changes
(both are audited to be 0 / grayscale in the browser). Don't fork HeroUI with
per-component theme overrides — fix the token bridge in `globals.css` instead.

## Pattern: Workbench Route

**Description**: `/workbench` is a client page with the full query state. It
reads `?q=` via `useSearchParams` (Suspense boundary), posts `/api/search`,
then `/api/summary`, renders a full-height grid (filters / results / map) with
no footer, and a compact query bar (`SearchBar`, 44px) under the navbar.
`/?q=` redirects here via `proxy.ts`. The mobile panels are a HeroUI
`ToggleButtonGroup` (`selectionMode="single"`, `disallowEmptySelection`) with
`Map`/`Results`/`Filters`; result rows and filter rows are real `<button>`s
with `aria-pressed`, not styled divs.

**Usage**: `/workbench` route only.

**Constraints**: The workbench must never shrink below the viewport
(`.home > *` flex rule does not apply here; the grid is `flex: 1; overflow: hidden`).

## Pattern: Search Command (Landing + CTA)

**Description**: One sanctioned search form: HeroUI `TextField` + `InputGroup`
(prefix icon, optional `Kbd` suffix) + submit `Button`. `SearchBar` is the
single implementation; `/` and ⌘K/Ctrl+K focus it when `shortcut` is set. The
hero uses `navigateTo="/workbench"`; the workbench uses `onSearch`; the empty
`/workbench` state uses `navigateTo` as well.

**Usage**: `SearchBar` — homepage hero, closing CTA, `/workbench` empty state,
workbench query bar.

**Constraints**: Never overlap the kbd suffix with the submit button; never show a
dead keyboard hint — if the chip renders, the handler must exist. Example chips
must use valid grammar (radius in km, ≤ 500). Placeholder copy may not promise
anything the parser can't do.

<!-- Add more patterns below. -->
