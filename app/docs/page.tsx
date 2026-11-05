import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Technical documentation for Lighthouse: query syntax, architecture, the /api/search and /api/summary contracts, environment variables, self-hosting, rate limits, and troubleshooting.",
};

export default function DocsPage() {
  return (
    <StaticPage
      eyebrow="Documentation"
      title="Lighthouse documentation"
      updated="November 6, 2026"
      active="/docs"
    >
      <p>
        Lighthouse turns plain-language (or tokenized) queries into OpenStreetMap
        queries. This page documents the query grammar, the architecture, the
        HTTP contract, configuration, and operational limits. For what the
        project is rather than how it works, read{" "}
        <Link href="/about">About Lighthouse</Link>.
      </p>

      <h2 id="architecture">Architecture</h2>
      <CodeBlock title="pipeline" lang="flow">{`SearchBar ──POST /api/search──▶ parser.ts ─▶ geo.ts (Nominatim, 1 req/s)
                                     │             │ bbox / areaId
                                     ▼             ▼
                                 overpass.ts ──▶ executeQuery (mirrors + optional keyed)
                                      │
                                      ▼
                        { results≤5000, stats, bounds } ──▶ SummaryCard (aggregate-only)`}</CodeBlock>
      <ul>
        <li>
          <strong>parser.ts</strong> — tokenizes the query: natural-language
          patterns for common asset types plus structured tokens. Validation
          requires an asset type or an operator <em>and</em> a geographic scope
          (region, country, or <code>near:</code>).
        </li>
        <li>
          <strong>geo.ts</strong> — resolves place names to bounding boxes or
          administrative areas via Nominatim, throttled server-side to 1
          request/second.
        </li>
        <li>
          <strong>overpass.ts</strong> — executes the query against public
          Overpass mirrors with automatic failover; a dedicated keyed instance
          can be configured via <code>OVERPASS_CH_KEY</code>. Results are capped
          at 5,000 features; each endpoint gets a 15-second timeout.
        </li>
        <li>
          <strong>summary.ts</strong> — optional. Receives only aggregate stats
          (total, top-12 types, top-12 operators, truncation flag) — never
          individual assets.
        </li>
      </ul>

      <h2 id="query-syntax">Query syntax</h2>
      <p>
        Structured tokens can be combined in any order and mixed with
        natural-language phrases:
      </p>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Meaning</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>type:</code>
            </td>
            <td>Asset type key (≈230 supported — the catalog is on the{" "}
              <Link href="/types">types page</Link>)
            </td>
            <td>
              <code>type:power_plant</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>operator:</code>
            </td>
            <td>Operator / owner (alias-resolved)</td>
            <td>
              <code>operator:airtel</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>region:</code>
            </td>
            <td>State / region</td>
            <td>
              <code>region:karnataka</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>country:</code>
            </td>
            <td>Country</td>
            <td>
              <code>country:france</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>near:</code>
            </td>
            <td>Proximity anchor place</td>
            <td>
              <code>near:london</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>radius:</code>
            </td>
            <td>Radius in kilometres (max 500, default 50 with <code>near:</code>)</td>
            <td>
              <code>radius:80</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Natural-language forms such as{" "}
        <code>telecom towers in karnataka</code> or{" "}
        <code>wind farms near copenhagen</code> are matched by a curated
        pattern list and resolve to the same tokens.{" "}
        <code>radius:5000</code> is pointless: the parser clamps radius to 500{" "}
        <strong>km</strong>.
      </p>

      <h3>Examples</h3>
      <CodeBlock title="valid queries" lang="query">{`cell towers in Berlin radius:40
data centers near:London radius:60
wind farms near Copenhagen radius:120
type:substation in New York radius:80
type:hospital in mumbai
type:data_center operator:google region:california
operator:airtel in india`}</CodeBlock>
      <p>
        A query must specify <strong>at least</strong> (a) an asset type or an
        operator and (b) a region, country, or <code>near:</code> anchor —
        otherwise the API rejects it with <code>INVALID_QUERY</code> or{" "}
        <code>MISSING_LOCATION</code>.
      </p>

      <h2 id="api-search">API: <code>POST /api/search</code></h2>
      <CodeBlock title="request / response" lang="json">{`POST /api/search
Content-Type: application/json

{ "query": "towers in karnataka" }

200 OK
{
  "results": [{ "id": "node/123", "name": "…", "type": "communication",
                "operator": "…", "lat": 12.97, "lon": 77.59, "tags": {} }],
  "stats":   { "total": 1843, "types": { … }, "operators": { … } },
  "bounds":  [11.59, 74.05, 18.44, 78.59],
  "query":   { "type": "telecom", "operator": null, "near": "in",
               "region": "karnataka", "radius": 50 },
  "truncated": false
}`}</CodeBlock>
      <p>Server errors use a stable shape:</p>
      <table>
        <thead>
          <tr>
            <th>code</th>
            <th>HTTP</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>MISSING_QUERY</code>
            </td>
            <td>400</td>
            <td>No query string supplied.</td>
          </tr>
          <tr>
            <td>
              <code>INVALID_QUERY</code>
            </td>
            <td>400</td>
            <td>Missing an asset type / operator, or malformed.</td>
          </tr>
          <tr>
            <td>
              <code>MISSING_LOCATION</code>
            </td>
            <td>400</td>
            <td>No geographic scope (region / country / near).</td>
          </tr>
          <tr>
            <td>
              <code>LOCATION_NOT_FOUND</code>
            </td>
            <td>400</td>
            <td>Nominatim could not resolve the place.</td>
          </tr>
          <tr>
            <td>
              <code>RATE_LIMITED</code>
            </td>
            <td>429</td>
            <td>Shared upstream limit hit — retry shortly.</td>
          </tr>
          <tr>
            <td>
              <code>TIMEOUT</code>
            </td>
            <td>504</td>
            <td>Upstream Overpass timeout (15s per mirror).</td>
          </tr>
        </tbody>
      </table>

      <h2 id="api-summary">API: <code>POST /api/summary</code></h2>
      <p>
        Sends <strong>aggregate stats only</strong> (total, top-12 types, top-12
        operators, truncated flag, warning) — never individual assets — and
        returns a <code>Summary</code> with <code>headline</code>,{" "}
        <code>overview</code>, <code>observations</code>, <code>caveats</code>,{" "}
        <code>followups</code>, <code>sources</code>, <code>provider</code>,{" "}
        <code>fallback</code> and <code>cached</code>. Provider chain:
        OpenRouter → Ollama → Exa → deterministic local fallback. The response
        is cached in memory for 6 hours; the endpoint never fails the UI — if
        no provider answers, the local summary is returned.
      </p>

      <h2 id="rate-limits">Rate limits &amp; caching</h2>
      <ul>
        <li>
          <strong>Nominatim:</strong> 1 request/second server-side, enforced in
          <code>geo.ts</code>.
        </li>
        <li>
          <strong>AI summaries:</strong> 6 requests/IP/minute and 40 provider
          calls/day globally (in-memory counters; per-instance).
        </li>
        <li>
          <strong>Summary cache:</strong> in-memory, 6h TTL, keyed by stats
          payload — per instance, not shared across serverless regions.
        </li>
        <li>
          <strong>Overpass:</strong> 5,000-feature cap per query; 15s timeout
          per mirror with failover.
        </li>
      </ul>

      <h2 id="environment">Environment variables</h2>
      <p>All of these are optional. Copy <code>.env.example</code> to <code>.env.local</code> to set any of them.</p>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Purpose</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>OPENROUTER_API_KEY</code>
            </td>
            <td>Primary AI summary provider</td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>OPENROUTER_MODEL</code>
            </td>
            <td>Model used with OpenRouter</td>
            <td>
              <code>openrouter/free</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>OLLAMA_API_KEY</code>
            </td>
            <td>Ollama Cloud key (or set a base URL)</td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>OLLAMA_BASE_URL</code>
            </td>
            <td>Local / self-hosted Ollama endpoint</td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>OLLAMA_MODEL</code>
            </td>
            <td>Ollama model (auto-discovered if omitted)</td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>EXA_API_KEY</code>
            </td>
            <td>Optional grounding for LLM summaries + final AI fallback</td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>EXA_SEARCH_TYPE</code>
            </td>
            <td>Exa search type</td>
            <td>
              <code>auto</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>EXA_NUM_RESULTS</code>
            </td>
            <td>Grounding results per summary (2–8)</td>
            <td>
              <code>4</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>OVERPASS_CH_KEY</code>
            </td>
            <td>Dedicated Overpass + Nominatim instance, used before the public mirrors</td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_RATE_LIMIT_PER_MINUTE</code>
            </td>
            <td>Per-IP AI requests per minute</td>
            <td>
              <code>6</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_DAILY_LIMIT</code>
            </td>
            <td>Global provider calls per day</td>
            <td>
              <code>40</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_PROVIDER_TIMEOUT_MS</code>
            </td>
            <td>Per-provider timeout (clamped 3,000–14,000)</td>
            <td>
              <code>12000</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_CACHE_TTL_MS</code>
            </td>
            <td>AI summary cache TTL (6h)</td>
            <td>
              <code>21600000</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>NEXT_PUBLIC_SITE_URL</code>
            </td>
            <td>Base URL used by robots.txt / sitemap.xml</td>
            <td>
              <code>http://localhost:3000</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Provider keys are read server-side only and must never be exposed as{" "}
        <code>NEXT_PUBLIC_*</code>.
      </p>

      <h2 id="self-hosting">Self-hosting</h2>
      <CodeBlock title="terminal" lang="bash">{`git clone https://github.com/Aviox8/lighthouse.git
cd lighthouse
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000

# full check pipeline
npm run lint && npm run typecheck && npm test && npm run build`}</CodeBlock>
      <p>
        Requirements: Node.js 22+, npm. Deploys cleanly to Vercel; the summary
        cache is per-instance, so multi-region deployments rebuild caches
        independently.
      </p>

      <h2 id="troubleshooting">Troubleshooting</h2>
      <ul>
        <li>
          <strong>&ldquo;Query must specify an asset type or operator&rdquo;</strong>{" "}
          — add an <code>operator:</code> token or a type phrase.
        </li>
        <li>
          <strong>&ldquo;Query must specify a geographic scope&rdquo;</strong> —
          add <code>near:</code>, <code>region:</code>, <code>country:</code>,
          an <code>in</code>/<code>near</code> phrase, or a{" "}
          <code>radius:</code> after <code>near:</code>.
        </li>
        <li>
          <strong>Slow or erroring searches</strong> — public Overpass mirrors
          are shared and frequently overloaded (502/timeouts). Self-hosters can
          set <code>OVERPASS_CH_KEY</code>. The app fails over automatically;
          a country-scale query at peak times may just take its retries.
        </li>
        <li>
          <strong>Truncated results</strong> — the 5,000-feature cap fired.
          Narrow the query (smaller radius, tighter type/operator) or
          self-host against your own Overpass instance.
        </li>
        <li>
          <strong>An asset is wrong or missing</strong> — that is an OSM data
          issue, not a Lighthouse bug. Fix it at{" "}
          <a
            href="https://www.openstreetmap.org/fixthemap"
            target="_blank"
            rel="noopener noreferrer"
          >
            osm.org/fixthemap
          </a>
          .
        </li>
      </ul>

      <h2 id="contributing">Contributing</h2>
      <p>
        New asset types are the fastest way to make the tool better — each is
        a few lines in <code>ASSET_TYPE_MAP</code> ({" "}
        <Link href="/types">lib/types.ts</Link>, mirrored by the catalog). See{" "}
        <Link href="/dev">the developer page</Link> for the contribution
        workflow and issue discipline.
      </p>
    </StaticPage>
  );
}
