import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Developer",
  description:
    "Run Lighthouse locally: repository, stack, scripts, tests, project layout, and how to contribute asset types and fixes.",
};

const REPO_URL = "https://github.com/Aviox8/lighthouse";

export default function DevPage() {
  return (
    <StaticPage
      eyebrow="Project"
      title="Build and run Lighthouse"
      updated="November 6, 2026"
      active="/dev"
    >
      <p>
        Lighthouse is an independent open-source project — MIT-licensed, no
        company, no paid tiers. The code lives on{" "}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub (Aviox8/lighthouse)
        </a>
        , and it is maintained in public by{" "}
        <a
          href="https://github.com/archduke1337"
          target="_blank"
          rel="noopener noreferrer"
        >
          archduke1337
        </a>
        . If something breaks, it gets fixed in public.
      </p>

      <h2>Quickstart</h2>
      <CodeBlock title="terminal" lang="bash">{`git clone ${REPO_URL}.git
cd lighthouse
npm install
npm run dev        # http://localhost:3000

# full check pipeline
npm run lint && npm run typecheck && npm test && npm run build`}</CodeBlock>
      <p>
        Runs on Node.js 22 (the CI matrix is pinned to 22). Without any{" "}
        <code>.env</code> configuration everything works except AI summaries,
        which fall back to a deterministic local provider, and inline Mapillary
        previews, which fall back to external links —{" "}
        <Link href="/docs/operations#environment-variables">
          all environment variables
        </Link>{" "}
        are optional.
      </p>

      <h2>The stack</h2>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Choice</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Framework</td>
            <td>
              Next.js (App Router) + React 19, React Compiler enabled
            </td>
          </tr>
          <tr>
            <td>Styling</td>
            <td>
              Tailwind CSS v4, HeroUI v3 components, and a monochrome token
              system in <code>app/globals.css</code>
            </td>
          </tr>
          <tr>
            <td>Map</td>
            <td>
              Leaflet via react-leaflet — OpenStreetMap streets, Esri World
              Imagery satellite, and OpenTopoMap terrain; all keyless
            </td>
          </tr>
          <tr>
            <td>Data</td>
            <td>
              Overpass API (mirror failover) for OSM queries; Nominatim for
              geocoding, throttled to 1 request/second
            </td>
          </tr>
          <tr>
            <td>AI summaries</td>
            <td>
              OpenRouter → Ollama → Exa chain, deterministic local fallback
              (all optional)
            </td>
          </tr>
          <tr>
            <td>Tests</td>
            <td>Vitest</td>
          </tr>
        </tbody>
      </table>

      <h2>Scripts</h2>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>npm run dev</code>
            </td>
            <td>Dev server at <code>localhost:3000</code></td>
          </tr>
          <tr>
            <td>
              <code>npm run build</code>
            </td>
            <td>Production build</td>
          </tr>
          <tr>
            <td>
              <code>npm run lint</code>
            </td>
            <td>ESLint</td>
          </tr>
          <tr>
            <td>
              <code>npm run typecheck</code>
            </td>
            <td>TypeScript, <code>noEmit</code></td>
          </tr>
          <tr>
            <td>
              <code>npm test</code>
            </td>
            <td>Full Vitest run (CI gate)</td>
          </tr>
          <tr>
            <td>
              <code>npm run test:watch</code>
            </td>
            <td>Vitest in watch mode</td>
          </tr>
        </tbody>
      </table>
      <p>
        CI (GitHub Actions) runs lint, typecheck and the test suite on every
        push and pull request to <code>main</code>, and Dependabot keeps the
        dependency tree fresh. Treat green CI as a merging requirement.
      </p>

      <h2>Project layout</h2>
      <CodeBlock title="repository tree" lang="tree">{`app/
  page.tsx              # landing page (static server component)
  workbench/page.tsx    # the instrument route: map, results, filters, summary
  workbench/{filters,result-list,summary-card,map-view}.tsx
  types/catalog.tsx     # route-private interactive catalog island
  about/ types/ dev/ contributing/ security/
  docs/ docs/api/ docs/operations/
  license/ legal/ policy/ terms/ privacy/
  api/search/route.ts   # POST /api/search → parser → geo → overpass
  api/summary/route.ts  # POST /api/summary → rate limit → cache → providers
  api/nominatim/route.ts
  globals.css           # the entire design system
components/
  Navbar, Footer, StaticPage, CodeBlock, SearchBar, GithubIcon
lib/
  types.ts              # ASSET_TYPE_MAP — every queryable asset type
  parser.ts             # query grammar: phrases + type:/operator:/… tokens
  geo.ts                # Nominatim geocoding, 1 req/s throttle
  overpass.ts           # Overpass client, mirrors, 5,000-feature cap
  summary.ts            # provider chain + caching + rate limits
lib/__tests__/          # parser / overpass / summary suites`}</CodeBlock>

      <h2>Tests</h2>
      <p>
        Three suites, one per core unit, under <code>lib/__tests__/</code>:
      </p>
      <ul>
        <li>
          <code>parser.test.ts</code> — query grammar: natural-language
          matching, structured tokens, validation errors.
        </li>
        <li>
          <code>overpass.test.ts</code> — Overpass query construction, bounds
          and feature cap.
        </li>
        <li>
          <code>summary.test.ts</code> — local summary generation and the
          aggregate-only contract (individual assets must never reach a
          provider request).
        </li>
      </ul>

      <h2>Contributing</h2>
      <ul>
        <li>
          <strong>Asset types are the cheapest win.</strong> Add a key, a label
          and OSM tags to <code>ASSET_TYPE_MAP</code> in{" "}
          <code>lib/types.ts</code> (sources from the OSM wiki&rsquo;s{" "}
          <a
            href="https://wiki.openstreetmap.org/wiki/Map_Features"
            target="_blank"
            rel="noopener noreferrer"
          >
            Map Features
          </a>{" "}
          page). A symlink of examples lives on the{" "}
          <Link href="/types">types page</Link>. One type per pull request
          keeps review fast.
        </li>
        <li>
          <strong>Issue-first for anything larger.</strong> Query-grammar
          changes, limits, and anything touching the provider chain should have
          an agreed issue before the PR.
        </li>
        <li>
          <strong>Keep the UI honest.</strong> Error states name likely causes,
          warnings describe exactly what is incomplete, and AI output stays
          labeled and aggregate-only — pull requests are reviewed with that
          bar in mind.
        </li>
        <li>
          <strong>Style with the design system.</strong> Monochrome tokens in{" "}
          <code>app/globals.css</code>; no new color values, no rounded
          corners, no carousel.
        </li>
      </ul>
      <p>
        The full workflow, asset-type recipe, and pull-request checklist are on{" "}
        <Link href="/contributing">Contributing</Link>. Report vulnerabilities
        through the private process on <Link href="/security">Security</Link>,
        not the public tracker.
      </p>

      <h2>Reporting problems</h2>
      <p>
        Open an issue on{" "}
        <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          the tracker
        </a>{" "}
        — include the exact query string, the observed behavior, and the
        rendered error message. Wrong or missing map features are OSM data
        issues; report those at{" "}
        <a
          href="https://www.openstreetmap.org/fixthemap"
          target="_blank"
          rel="noopener noreferrer"
        >
          openstreetmap.org/fixthemap
        </a>
        , not here.
      </p>
    </StaticPage>
  );
}
