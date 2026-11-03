# Design Decisions

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
