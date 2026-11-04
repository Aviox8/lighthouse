import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Developer",
  description:
    "Who builds Lighthouse, why it exists, what it's built with, and how to contribute, report bugs, or request features.",
};

export default function DeveloperPage() {
  return (
    <StaticPage eyebrow="Developer" title="About the developer" updated="November 5, 2026">
      <h2>Who builds this</h2>
      <p>
        Lighthouse is built and maintained by{" "}
        <a href="https://github.com/Aviox8" target="_blank" rel="noopener noreferrer">
          Aviox8
        </a>
        , an independent developer working in the open. The repository —{" "}
        <a
          href="https://github.com/Aviox8/lighthouse"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/Aviox8/lighthouse
        </a>{" "}
        — is the workspace, the changelog, and the source of truth for this page.
      </p>

      <h2>Why this exists</h2>
      <p>
        Lighthouse was built out of a simple frustration: the most interesting questions about the
        physical world — where are the towers, substations, refineries, and data centers? — have
        public answers buried inside OpenStreetMap, but no calm, fast, honest way to ask them.
        Existing tools either over-promise (&ldquo;AI-powered intelligence!&rdquo;) or make you
        wrangle Overpass QL by hand. This project is the middle path: a precise instrument that
        shows the data, labels its uncertainty, and stays out of the way.
      </p>

      <h2>What it&rsquo;s built with</h2>
      <table>
        <thead>
          <tr><th>Layer</th><th>Stack</th></tr>
        </thead>
        <tbody>
          <tr><td>Framework</td><td>Next.js 16 (App Router, Node runtime) + React 19 + TypeScript</td></tr>
          <tr><td>Map</td><td>Leaflet + leaflet.markercluster, adaptive clustering (5,000+ markers)</td></tr>
          <tr><td>Styling</td><td>Hand-rolled CSS tokens in <code>globals.css</code> — no component library, by design</td></tr>
          <tr><td>Type</td><td>Inter (UI) and JetBrains Mono (data) via next/font</td></tr>
          <tr><td>Data</td><td>OpenStreetMap — Nominatim (geocoding) + Overpass API (queries)</td></tr>
          <tr><td>AI (optional)</td><td>OpenRouter / Ollama / Exa, server-side only, aggregate-only, local fallback</td></tr>
          <tr><td>Hosting</td><td>Vercel</td></tr>
        </tbody>
      </table>

      <h2>How to get involved</h2>
      <h3>Report a bug</h3>
      <p>
        Open an issue at{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/Aviox8/lighthouse/issues
        </a>{" "}
        with the query you ran, what you expected, and what happened. Screenshots help.
      </p>

      <h3>Request an asset type</h3>
      <p>
        Browse the{" "}
        <Link href="/types">asset type catalog</Link>, then open an issue with: the OSM tag(s) to
        map, a label, and a real example. New types are the fastest way to make the tool better —
        each one is roughly ten lines in <code>ASSET_TYPE_MAP</code>.
      </p>

      <h3>Contribute code</h3>
      <p>
        Fork, branch, PR. The repo is set up so{" "}
        <code>lint → typecheck → test → build</code> must stay green; there is no review bottleneck
        beyond correctness. Good first contributions: new asset types, parser patterns, regional
        operator aliases, accessibility fixes.
      </p>

      <h3>Fix the map, not the app</h3>
      <p>
        If an asset is missing, wrong, or mis-tagged on the map — that&rsquo;s an OSM data issue,
        not a Lighthouse bug. Edit it at{" "}
        <a
          href="https://www.openstreetmap.org/fixthemap"
          target="_blank"
          rel="noopener noreferrer"
        >
          osm.org/fixthemap
        </a>{" "}
        and every OSM tool improves, not just this one.
      </p>

      <h2>What kind of project this is</h2>
      <p>
        Lighthouse is a single-maintainer, open-source project — not a company. There is no roadmap
        deck, no investors, no SLA, and no upsell. That means it moves at one person&rsquo;s pace,
        but it also means every design decision serves users, not stakeholders. If it
        breaks,{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          open an issue
        </a>
        . If you want it to be faster,{" "}
        <a
          href="https://github.com/Aviox8/lighthouse"
          target="_blank"
          rel="noopener noreferrer"
        >
          send a PR
        </a>
        .
      </p>

      <h2>Contact</h2>
      <p>
        GitHub is the preferred channel for everything:{" "}
        <a href="https://github.com/Aviox8" target="_blank" rel="noopener noreferrer">
          @Aviox8
        </a>
        . Bugs →{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          issues
        </a>
        ; feature requests → issues with the <code>enhancement</code> label; anything else → a
        comment on any issue or PR. Please don&rsquo;t expect private or urgent support — this is a
        hobby-scale, open project.
      </p>
    </StaticPage>
  );
}
