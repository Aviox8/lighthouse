import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Lighthouse is, how it works, query syntax and API reference, environment variables, self-hosting, data licences — and the principles behind its honest-by-default design.",
};

export default function AboutPage() {
  return (
    <StaticPage eyebrow="About" title="About Lighthouse" updated="November 5, 2026">
      <h2>What it is</h2>
      <p>
        Lighthouse is a free, open-source tool for discovering physical-world infrastructure from
        OpenStreetMap data: telecom towers, power plants, data centers, ports, hospitals, prisons,
        lighthouses — 230+ asset types across 30+ categories. You type a query in plain
        language (<code>wind farms near copenhagen</code>) or structured form (<code>{
          "type:data_center operator:google region:california"
        }</code>), and it maps, filters, and summarizes what OpenStreetMap knows.
      </p>

      <h2>What it is not</h2>
      <ul>
        <li>Not an authoritative inventory. OSM is crowd-sourced; verify anything that matters.</li>
        <li>Not a surveillance product. No tracking, no accounts, no saved history.</li>
        <li>Not an &ldquo;AI dashboard.&rdquo; AI summaries are optional, aggregate-only, and always labeled with their provider.</li>
      </ul>

      <h2>Who it serves</h2>
      <p>
        Infrastructure analysts, OSINT researchers, journalists, urban planners, engineers, and the
        simply curious — people who care about data fidelity and speed over decoration.
      </p>

      <h2>How it works</h2>
      <pre>{`SearchBar ──POST /api/search──▶ parser.ts ─▶ geo.ts (Nominatim, 1 req/s)
                                      │             │ bbox / areaId
                                      ▼             ▼
                                 overpass.ts ──▶ executeQuery (mirrors + optional keyed)
                                      │
                                      ▼
                        { results≤5000, stats, bounds } ──▶ SummaryCard (aggregate-only)`}</pre>
      <p>
        Natural-language queries are matched by a curated pattern list; structured queries
        (<code>type:</code>, <code>operator:</code>, <code>region:</code>, <code>country:</code>,{" "}
        <code>near:</code>, <code>radius:</code>) parse directly. Overpass endpoint failover and
        busy-retries are built in; queries are capped at 5,000 features and 15s per endpoint.
      </p>

      <h2>Query syntax</h2>
      <table>
        <thead>
          <tr><th>Parameter</th><th>Meaning</th><th>Example</th></tr>
        </thead>
        <tbody>
          <tr><td><code>type:</code></td><td>Asset type (≈230 supported)</td><td><code>type:power_plant</code></td></tr>
          <tr><td><code>operator:</code></td><td>Operator / owner (alias-resolved)</td><td><code>operator:airtel</code></td></tr>
          <tr><td><code>region:</code></td><td>State / region</td><td><code>region:karnataka</code></td></tr>
          <tr><td><code>country:</code></td><td>Country</td><td><code>country:france</code></td></tr>
          <tr><td><code>near:</code></td><td>Proximity anchor</td><td><code>near:london</code></td></tr>
          <tr><td><code>radius:</code></td><td>Radius in km (max 500, default 50)</td><td><code>radius:100</code></td></tr>
        </tbody>
      </table>
      <p>
        Examples: <code>telecom towers in karnataka</code> ·{" "}
        <code>wind farms near copenhagen</code> ·{" "}
        <code>type:data_center operator:google region:california</code>
      </p>
      <p>
        Every searchable type is listed and copyable on the{" "}
        <Link href="/types">asset type catalog →</Link> (the catalog mirrors{" "}
        <code>ASSET_TYPE_MAP</code> in <code>lib/types.ts</code>).
      </p>

      <h2>API reference</h2>
      <h3>POST /api/search</h3>
      <pre>{`POST /api/search
Content-Type: application/json

{ "query": "towers in karnataka" }

200 OK
{
  "results": [{ "id": "node/123", "name": "…", "type": "communication",
                "operator": "…", "lat": 12.97, "lon": 77.59, "tags": {} }],
  "stats": { "total": 1843, "types": { … }, "operators": { … } },
  "bounds": [11.59, 18.44, 74.05, 78.59],
  "query":  { "type": "telecom", "near": null, "region": "karnataka",
              "radius": 50 },
  "truncated": false
}`}</pre>
      <p>
        Validation: query required and ≤ 500 chars. Errors use{" "}
        <code>{`{ "error": string, "code": ... }`}</code> with codes{" "}
        <code>MISSING_QUERY</code>, <code>INVALID_QUERY</code>,{" "}
        <code>LOCATION_NOT_FOUND</code>, <code>RATE_LIMITED</code> (429),{" "}
        <code>TIMEOUT</code> (504), <code>INTERNAL_ERROR</code> (500), or{" "}
        <code>METHOD_NOT_ALLOWED</code> on GET (405).
      </p>

      <h3>POST /api/summary</h3>
      <p>
        Sends <strong>aggregate stats only</strong> (total, top-12 types, top-12 operators,
        truncated flag). Never sends individual assets. Returns a <code>Summary</code> JSON with{" "}
        <code>headline</code>, <code>overview</code>, <code>observations</code>,{" "}
        <code>caveats</code>, <code>followups</code>, <code>provider</code>, plus{" "}
        <code>cached</code>, <code>degraded</code>, <code>groundingUsed</code>. Provider chain: Exa
        grounding → OpenRouter → Ollama → Exa Answer → deterministic local fallback. Cached 6h;
        rate-limited to 6 AI requests/IP/minute and 40 provider calls/day (falls back to local
        summary, never an error, when exceeded).
      </p>

      <h2>Environment variables</h2>
      <table>
        <thead>
          <tr><th>Variable</th><th>Purpose</th><th>Default</th></tr>
        </thead>
        <tbody>
          <tr><td><code>OPENROUTER_API_KEY</code></td><td>Primary AI summary provider</td><td>—</td></tr>
          <tr><td><code>OPENROUTER_MODEL</code></td><td>Model for OpenRouter</td><td><code>openrouter/free</code></td></tr>
          <tr><td><code>OLLAMA_API_KEY</code></td><td>Ollama Cloud key</td><td>—</td></tr>
          <tr><td><code>OLLAMA_BASE_URL</code></td><td>Local/self-hosted Ollama URL</td><td>—</td></tr>
          <tr><td><code>OLLAMA_MODEL</code></td><td>Ollama model (auto-discovered if omitted)</td><td>—</td></tr>
          <tr><td><code>OVERPASS_CH_KEY</code></td><td>Keyed overpass.ch / Nominatim instance</td><td>—</td></tr>
          <tr><td><code>EXA_API_KEY</code></td><td>Optional Exa grounding + final fallback</td><td>—</td></tr>
          <tr><td><code>EXA_SEARCH_TYPE</code></td><td>Exa search type</td><td><code>auto</code></td></tr>
          <tr><td><code>EXA_NUM_RESULTS</code></td><td>Grounding results per summary (2–8)</td><td><code>4</code></td></tr>
          <tr><td><code>SUMMARY_RATE_LIMIT_PER_MINUTE</code></td><td>Per-IP AI requests / minute</td><td><code>6</code></td></tr>
          <tr><td><code>SUMMARY_DAILY_LIMIT</code></td><td>Global provider calls / day</td><td><code>40</code></td></tr>
          <tr><td><code>SUMMARY_PROVIDER_TIMEOUT_MS</code></td><td>Per-provider timeout (3–14s)</td><td><code>7000</code></td></tr>
          <tr><td><code>SUMMARY_CACHE_TTL_MS</code></td><td>AI summary cache TTL (60s–24h)</td><td><code>21600000</code></td></tr>
          <tr><td><code>NEXT_PUBLIC_SITE_URL</code></td><td>Base URL for sitemap/robots</td><td><code>http://localhost:3000</code></td></tr>
        </tbody>
      </table>
      <p>Keys are server-side only and must never be exposed as <code>NEXT_PUBLIC_*</code> (except the public site URL above).</p>

      <h2>Self-hosting</h2>
      <pre>{`git clone https://github.com/Aviox8/lighthouse.git
cd lighthouse
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000

npm run lint && npm run typecheck && npm test && npm run build`}</pre>
      <p>Requirements: Node.js 22+, npm. Deploys cleanly to Vercel.</p>

      <h2>How to read the results</h2>
      <ul>
        <li>Presence in OSM ≠ existence in reality; absence ≠ nonexistence.</li>
        <li>Operator counts include only features with an <code>operator</code> tag.</li>
        <li>Country-scale searches can hit the 5,000-feature cap; you&rsquo;ll see a truncation warning when that happens.</li>
        <li>Asset coordinates come from OSM nodes/ways/relations as published — no geocoding of asset names occurs.</li>
      </ul>

      <h2>Principles</h2>
      <ul>
        <li>
          <strong>Honest over impressive.</strong> Errors name their likely cause; warnings say
          exactly what&rsquo;s incomplete; AI output is never presented as measured fact.
        </li>
        <li>
          <strong>Aggregate-only AI.</strong> Summaries receive totals and counts — never names,
          tags, or coordinates. Individual asset records are not sent to any provider.
        </li>
        <li>
          <strong>Respect the commons.</strong> Nominatim throttles to 1 req/s; Overpass queries
          fail over across mirrors; nothing is bulk-scraped; queries cap at 5,000 features.
        </li>
        <li>
          <strong>Dark, dense, fast.</strong> Built for 5,000+ markers, keyboard navigation, and
          reduced-motion environments.
        </li>
      </ul>

      <h2>FAQ</h2>
      <h3>Is it free?</h3>
      <p>Yes — and it will stay free and open source. There is no paid tier and nothing to buy.</p>

      <h3>Do I need an account or API keys?</h3>
      <p>
        No. Without configuration, every feature works except AI summaries, which degrade to a
        deterministic local summary. Self-hosters can add their own OpenRouter / Ollama / Exa keys.
      </p>

      <h3>Why can&rsquo;t I get full coverage of everything in a large country?</h3>
      <p>
        Public Overpass instances are shared infrastructure. Lighthouse caps results at 5,000 and
        reports truncation rather than overloading them; for complete extraction you need your own
        Overpass instance or a full OSM planet/region extract.
      </p>

      <h3>How do I contribute, report bugs, or request an asset type?</h3>
      <p>
        Open an issue at{" "}
        <a href="https://github.com/Aviox8/lighthouse/issues" target="_blank" rel="noopener noreferrer">
          github.com/Aviox8/lighthouse/issues
        </a>
        . Asset-type requests need the OSM tag(s) you want mapped and an example.
      </p>

      <h3>Where does the data come from?</h3>
      <p>
        © OpenStreetMap contributors under the ODbL, via the public Overpass API; geocoding via
        Nominatim; basemaps © OpenStreetMap (Street), © Esri — Maxar, Earthstar Geographics
        (Satellite), © OpenTopoMap CC-BY-SA (Terrain).
      </p>

      <h2>Explore</h2>
      <p>
        <Link href="/types">Browse the asset type catalog →</Link>
        <br />
        <Link href="/dev">About the developer &amp; how to contribute →</Link>
      </p>
    </StaticPage>
  );
}
