# Design Decisions

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
