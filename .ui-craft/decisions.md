# Design Decisions

### 2026-11-06 — Floating sharp navbar; OSM tiles stay, filter fixed

**Status**: accepted

The navbar detached from the page edges: `position: sticky; top: 12px; width:
calc(100% - 32px); max-width: 1280px; margin: 12px auto`, a 1px border (#2a2a2a),
translucent black (0.8) + `backdrop-filter` blur(18px) and a soft drop shadow.
It floats over content on every route — homepage, workbench, docs — and keeps
**zero rounded corners**: no pill treatment anywhere. A pill navbar was
considered and rejected because the whole system is sharp-edged (the user
scoped zero-radius to "everywhere, not just the navbar"). The map stays on
OpenStreetMap's standard raster tiles (no third-party tile provider, no API
keys — CARTO's dark basemap requires a key since 2026-09-25 and its public
keyless endpoint now serves only an "API KEY REQUIRED" notice); the
invisibility fix was the CSS `filter`: `grayscale(1) invert(1) contrast(1.5)
brightness(1.45)` makes roads readable on a near-black landmass. The stale
ArcGIS preconnect was removed from the root layout.

### 2026-11-06 — The homepage is a page; the workbench is its own route

**Status**: accepted

`app/page.tsx` was a client component that switched between a `Homepage`
component and the workbench, so `/` could never be a static page and the
landing was a second component away from the route. The split is now explicit:
`app/page.tsx` is a static server component that renders the product homepage,
and `app/workbench/page.tsx` is the instrument (map, results, filters,
summary). `/?q=…` links opened the workbench in place before, so `proxy.ts`
redirects `/?q` to `/workbench?q` to keep shared URLs working without making
`/` dynamic. Pages own their layout; shared parts (`Navbar`, `Footer`,
`SearchBar`, `TypesCatalog`, `StaticPage`, `MapView`) stay in `components/`.
The closing-CTA and example-query affordances on `/` are plain links to
`/workbench?q=…`; the hero search posts through `SearchBar` (`navigateTo`), so
no component ever owns a page.

### 2026-11-06 — HeroUI v3 everywhere; local primitives deleted

**Status**: accepted

The smoothui starter kit (`smooth-button`, tabs, checkbox, content-skeleton,
popover/select/dialog/tooltip/input wrappers) and the unused shadcn
`scroll-area` were deleted — 228 packages pruned, including `motion`,
`class-variance-authority`, `radix-ui` and `shadcn`. HeroUI v3 now carries the
chrome and the controls: `SearchField` (asset catalog), `ToggleButtonGroup`
(mobile map/results/filters, role=radio single-select), `Skeleton` (summary
loading), `Button`/`Spinner`/`Chip`/`Kbd`/`Card`/`Typography` on `/` and the
workbench. The theme bridge in `globals.css` flattens HeroUI's rounded,
color-first default onto the Lighthouse monochrome tokens (zero radius,
white accent, `--radius-*`/`--field-radius` = 0). The map was brought in line:
OSM tiles are inverted + desaturated, markers are white `L.divIcon` squares,
and Leaflet's 4px bar/attribution radii are zeroed. Leaflet tiles stay the
same provider — the restyle is CSS only.

### 2026-11-06 — Docs IA split + complete open-source page set

**Status**: accepted

The single long /docs page was split into a three-page reading sequence modeled
on MapillaryJS: /docs (architecture + query grammar), /docs/api (HTTP reference,
error table, limits), /docs/operations (self-hosting, environment variables,
troubleshooting). `StaticPage` gained Previous/Next pagination for that sequence
and an "Edit this page on GitHub" link derived from the active route. The OSS
surface was completed with /policy (acceptable use), /security (private
vulnerability disclosure), and /contributing (workflow + asset-type recipe).
Sidebar groups are Product / Documentation / Project / Legal; the footer is five
columns (brand + same four groups). All new routes are wired into the navbar,
footer, sidebar, and sitemap. Copy stays truthful: no invented maintainer
identities, no legal entity, no security mailbox, no bounty.

### 2026-11-06 — Full monochrome conversion + open-source docs set

**Status**: accepted

The amber/slate system was replaced by strict monochrome: #000 canvas, #0a0a0a
surfaces, white accent, zero radius everywhere (map popups included). Severity
colors collapsed to white with 0.08 soft washes — emphasis is typographic, not
chromatic. `globals.css` was rewritten as the single design system; dead feature
CSS (clustering, layers control, SearchBar/modals, workbench remnants) was pruned
and class usage was verified against source (the only "unused" selectors left are
Leaflet runtime classes and dynamic `summary-provider-*` variants). Landing was
rebuilt around a real command input (`/` and ⌘K actually focus it), a system
readout, and honest numbers (230+ types, 5,000 cap, radius in km). The
open-source page set moved to a Mapillary-style docs shell (`StaticPage`: site
sidebar + auto-TOC from h2s): /docs, /about, /types (generated from
ASSET_TYPE_MAP), /dev, /license, /legal, /terms, /privacy, plus error/404 and
robots/sitemap. Closed separately: cached-badge class typo, radius unit
mislabel (m→km) plus a working radius commit (re-runs the query with an updated
`radius:` token), the missing 5,000-cap truncation notice in ResultList, the
results-panel scrolling collapse, and deletion of the unused AssetInfoModal.

### 2026-11-05 — /dev is the developer page; /about absorbs project docs

**Status**: accepted

Project documentation (architecture, query syntax, API reference, env vars,
self-hosting, attribution) moved from /dev to /about; /dev now tells the story of
the maintainer — who builds it, why, the stack, and how to contribute — without
repeating project material. Also closed audit findings: hero only shows before the
first completed search, AssetInfoModal is a proper dialog (Escape, autofocus,
focus restore), / kbd hint no longer sits under the submit button, filters footer
pins to panel bottom, reduced-motion CSS deduplicated, mobile icon-only GitHub
link got an aria-label.

### 2026-11-05 — About, type catalog, error boundary, 404, crawl metadata

**Status**: accepted

Added /about (mission, honest-by-default principles, FAQ) and /types — a searchable
catalog of every ASSET_TYPE_MAP entry that copies `type:<key>` to the clipboard for
query assembly (deep-linking `?q=type:key` was rejected: a type with no scope fails
validation and lands the user on an error). Added a branded app/not-found.tsx and a
dependency-free app/error.tsx, robots.ts and sitemap.ts (base URL via
NEXT_PUBLIC_SITE_URL, localhost fallback). All reuse the static shell; no new
dependencies.

### 2026-11-05 — Static trust pages added; HeroUI/shadcn deferred

**Status**: accepted

Terms, Privacy and Developer pages ship behind a shared `StaticPage` shell that
reuses the existing tokens, type voices, header and footer rhythm. HeroUI and
shadcn were evaluated and rejected for these pages: the CSS design system in
`globals.css` already provides every needed primitive, and a component library
would fork the visual language and add dependencies for three content pages.
The homepage empty state is now a centered "getting started" hero with quick-search
chips instead of a bare map; provenance links (Developer / Privacy / Terms) live in
the filters panel footer. Accent stays reserved for primary actions and active
states; the hero card uses elevated slate surfaces, not gradients.

### 2026-11-04 — Replaced GitHub-dark palette with deep slate + beacon amber

**Status**: accepted

The original UI inherited a GitHub-dark look (#0d1117/#58a6ff) with no single
identity. For an infrastructure-intelligence tool the amber "beacon" reads as the
brand without repainting every component: one accent, used sparingly. Rejected: full
re-theme to light mode (audience works in low-light analysis contexts), cyan/teal
acent (indistinguishable from GIS tooling), and gradient-heavy "AI dashboard" styling.

### 2026-11-04 — Inter + JetBrains Mono via next/font

**Status**: accepted

System font stack rendered inconsistently across OSes; self-hosted next/font fixes
FOUT, adds swap, and gives a distinct data voice (mono for coords/counts) without
loading a display face.

### 2026-11-04 — Viewport lock removed

**Status**: accepted

`maximumScale: 1, userScalable: false` was an accessibility bug — pinch-zoom is
required for low-vision users on the map. Zoom gestures now work natively on mobile.

<!-- Add new decisions above this comment, newest first. -->
