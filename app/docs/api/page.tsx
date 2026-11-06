import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "API reference",
  description:
    "HTTP reference for Lighthouse: POST /api/search, POST /api/summary, authentication, error codes, rate limits, and caching.",
};

export default function ApiDocsPage() {
  return (
    <StaticPage
      eyebrow="Documentation"
      title="API reference"
      updated="November 6, 2026"
      active="/docs/api"
    >
      <p>
        Lighthouse exposes two JSON endpoints, both <code>POST</code>-only. They
        power the workbench, but the contract is stable enough to script against
        — subject to the <Link href="/policy">acceptable use policy</Link>.
      </p>

      <h2>Authentication</h2>
      <p>
        <strong>None.</strong> The public instance has no accounts, no tokens,
        and no keys to obtain. Provider keys (OpenRouter, Ollama, Exa) are
        server-side configuration used only by{" "}
        <Link href="/docs/operations">self-hosted deployments</Link> and never
        reach the browser.
      </p>
      <div className="doc-callout">
        <p>
          If you deploy your own instance and expose{" "}
          <code>/api/summary</code> publicly, put authentication and rate
          limiting in front of it — the built-in limits are per-instance
          protection, not a security boundary.
        </p>
      </div>

      <h2>POST /api/search</h2>
      <p>
        Parse a query, resolve its geographic scope, execute it against
        Overpass, and return a bounded result set with aggregate stats.
      </p>
      <CodeBlock title="request / response" lang="json">{`POST /api/search
Content-Type: application/json

{ "query": "towers in karnataka" }

200 OK
{
  "results": [{ "id": "node/123", "name": "…", "type": "communication",
                "operator": "…", "lat": 12.97, "lon": 77.59, "tags": {} }],
  "stats":   { "total": 1843, "types": { … }, "operators": { … } },
  "bounds":  [11.59, 74.05, 18.44, 78.59],
  "query":   { "type": "telecom", "operator": null, "near": null,
               "region": "karnataka", "radius": 50 },
  "truncated": false
}`}</CodeBlock>
      <ul>
        <li>
          <code>results</code> is capped at <strong>5,000 features</strong>;
          when the cap fires, <code>truncated</code> is <code>true</code> and
          the UI shows a warning instead of pretending the list is complete.
        </li>
        <li>
          <code>bounds</code> is <code>[south, west, north, east]</code> and is
          used to fit the map viewport.
        </li>
        <li>
          <code>query</code> echoes the parsed interpretation — including the
          resolved radius — which is what the filters panel reads.
        </li>
      </ul>

      <h2>POST /api/summary</h2>
      <p>
        Generate an aggregate-only summary. The request carries statistics, not
        assets: totals, top-12 type counts, top-12 operator counts, and the
        truncation flag.
      </p>
      <CodeBlock title="request / response" lang="json">{`POST /api/summary
Content-Type: application/json

{
  "query": "towers in karnataka",
  "stats": { "total": 1843, "types": { … }, "operators": { … } },
  "truncated": false,
  "warning": null
}

200 OK
{
  "headline": "…", "overview": "…", "observations": ["…"],
  "caveats": ["…"], "followups": ["…"], "sources": ["…"],
  "provider": "openrouter | ollama | exa | local",
  "fallback": false,
  "cached": false
}`}</CodeBlock>
      <ul>
        <li>
          Provider order: optional Exa grounding, then OpenRouter, then Ollama,
          then Exa Answer. Grounding runs only when an LLM provider is
          configured; Exa Answer runs only if both OpenRouter and Ollama fail.
          With no keys configured, the deterministic local provider answers and
          nothing leaves the server.
        </li>
        <li>
          Individual asset names, coordinates, and tags are never sent to a
          provider — aggregate counts only. The privacy policy holds the same
          line and says so in the same words.
        </li>
        <li>
          Responses are cached in memory for 6 hours, keyed by the aggregate
          payload. The endpoint never fails the UI: if every provider fails, a
          local summary still comes back.
        </li>
      </ul>

      <h2>Errors</h2>
      <p>
        Search errors use a stable shape with a machine-readable{" "}
        <code>code</code>:
      </p>
      <CodeBlock title="error shape" lang="json">{`{ "error": "Could not resolve location: Atlantis", "code": "LOCATION_NOT_FOUND" }`}</CodeBlock>
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
              <code>QUERY_TOO_LONG</code>
            </td>
            <td>400</td>
            <td>Query exceeds 500 characters.</td>
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
              <code>INSUFFICIENT_FILTERS</code>
            </td>
            <td>400</td>
            <td>Neither an asset type nor an operator survived parsing.</td>
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
          <tr>
            <td>
              <code>INTERNAL_ERROR</code>
            </td>
            <td>500</td>
            <td>Unexpected server failure; details are logged, not returned.</td>
          </tr>
          <tr>
            <td>
              <code>METHOD_NOT_ALLOWED</code>
            </td>
            <td>405</td>
            <td>
              <code>GET /api/search</code>; both endpoints are POST-only.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        The summary endpoint returns <code>{`{ "error": "…" }`}</code> with an
        HTTP status but no <code>code</code> field: <code>400</code> for invalid
        JSON or a malformed payload, <code>413</code> above 32 KB,{" "}
        <code>415</code> for a non-JSON content type, and <code>500</code> if
        generation itself fails. Rate-limited summary requests do not error —
        they return a local summary with a notice.
      </p>

      <h2>Rate limits &amp; caching</h2>
      <ul>
        <li>
          <strong>Nominatim:</strong> 1 request/second server-side, enforced in{" "}
          <code>geo.ts</code>.
        </li>
        <li>
          <strong>AI summaries:</strong> 6 requests/IP/minute and 40 provider
          calls/day globally (in-memory counters; per instance).
        </li>
        <li>
          <strong>Search cache:</strong> in-memory, 5-minute TTL, keyed by the
          parsed query. A cached response is returned without touching Overpass.
        </li>
        <li>
          <strong>Geocoding cache:</strong> in-memory, 24-hour TTL, keyed by the
          normalized place string.
        </li>
        <li>
          <strong>Summary cache:</strong> in-memory, 6h TTL by default, keyed by
          the stats payload. Local summaries are never cached.
        </li>
        <li>
          <strong>Overpass:</strong> 5,000-feature cap per query; 15s timeout per
          mirror with failover and a 22s overall budget.
        </li>
      </ul>
      <p>
        The operational side of these limits — how to configure them, and what
        they mean for a self-hosted deployment — is on{" "}
        <Link href="/docs/operations">Self-hosting &amp; operations</Link>.
      </p>
    </StaticPage>
  );
}
