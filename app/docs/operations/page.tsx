import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Self-hosting & operations",
  description:
    "Run Lighthouse yourself: environment variables, build and deploy steps, in-memory state, upstream limits, and troubleshooting.",
};

export default function OperationsPage() {
  return (
    <StaticPage
      eyebrow="Documentation"
      title="Self-hosting & operations"
      updated="November 6, 2026"
      active="/docs/operations"
    >
      <p>
        Lighthouse is one Next.js application with two API routes. The public
        instance runs on Vercel, but the same build runs on any host with
        Node.js 22 and outbound HTTPS. There is no database, no object storage,
        and no queue: every piece of state is an in-memory cache or counter that
        resets when the process restarts.
      </p>
      <div className="doc-callout doc-callout-accent">
        <p>
          State is per process. On a serverless host, caches and rate-limit
          counters are cold after idle, and two instances do not share them.
        </p>
      </div>

      <h2>Requirements</h2>
      <ul>
        <li>
          Node.js 22 or newer and npm. CI is pinned to Node 22.
        </li>
        <li>
          Outbound HTTPS to Nominatim, the Overpass mirrors (or your keyed
          overpass.ch instance), and — only if you configure summaries — the AI
          provider you choose.
        </li>
        <li>
          Overpass requests rotate through the four free global-coverage
          instances — <code>overpass-api.de</code>,{" "}
          <code>lz4.overpass-api.de</code>,{" "}
          <code>overpass.private.coffee</code> and{" "}
          <code>maps.mail.ru</code> — with sequential failover. Regional
          mirrors are deliberately excluded: they would return empty results
          outside their coverage area.
        </li>
        <li>
          No database, cache server, or storage bucket. Plan for per-instance
          memory, not shared state.
        </li>
      </ul>

      <h2>Environment variables</h2>
      <p>
        Every variable is optional. Start from <code>.env.example</code>, copy
        it to <code>.env.local</code> for development, and leave values empty
        rather than inventing placeholders. Secrets belong in server-side
        environment variables only — never prefix them with{" "}
        <code>NEXT_PUBLIC_</code>, which ships values to the browser.
      </p>

      <h3>AI summaries</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Default</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>OPENROUTER_API_KEY</code>
            </td>
            <td>—</td>
            <td>Primary summary provider. Unset means the provider is skipped.</td>
          </tr>
          <tr>
            <td>
              <code>OPENROUTER_MODEL</code>
            </td>
            <td>
              <code>openrouter/free</code>
            </td>
            <td>Model identifier sent to OpenRouter.</td>
          </tr>
          <tr>
            <td>
              <code>OPENROUTER_SITE_URL</code>
            </td>
            <td>
              <code>http://localhost:3000</code>
            </td>
            <td>Site URL sent to OpenRouter as attribution metadata.</td>
          </tr>
          <tr>
            <td>
              <code>OLLAMA_API_KEY</code>
            </td>
            <td>—</td>
            <td>Ollama Cloud key. First fallback when no OpenRouter key exists.</td>
          </tr>
          <tr>
            <td>
              <code>OLLAMA_BASE_URL</code>
            </td>
            <td>—</td>
            <td>Base URL of a local or self-hosted Ollama server.</td>
          </tr>
          <tr>
            <td>
              <code>OLLAMA_MODEL</code>
            </td>
            <td>auto-discovered</td>
            <td>Model name; discovered from the Ollama server when empty.</td>
          </tr>
          <tr>
            <td>
              <code>EXA_API_KEY</code>
            </td>
            <td>—</td>
            <td>Optional grounding for LLM summaries and the final AI fallback.</td>
          </tr>
          <tr>
            <td>
              <code>EXA_SEARCH_TYPE</code>
            </td>
            <td>
              <code>auto</code>
            </td>
            <td>Exa search type used for grounding.</td>
          </tr>
          <tr>
            <td>
              <code>EXA_NUM_RESULTS</code>
            </td>
            <td>
              <code>4</code>
            </td>
            <td>Grounding results per summary, clamped to 2–8.</td>
          </tr>
          <tr>
            <td>
              <code>EXA_ANSWER_MODEL</code>
            </td>
            <td>
              <code>exa</code>
            </td>
            <td>Model label recorded on Exa answers.</td>
          </tr>
        </tbody>
      </table>

      <h3>Upstream access</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Default</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>OVERPASS_CH_KEY</code>
            </td>
            <td>—</td>
            <td>
              Keyed overpass.ch instance, tried before the public Overpass
              mirrors. Also switches geocoding to its Nominatim-compatible
              endpoint. Server-side only.
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Limits and caching</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Default</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>SUMMARY_RATE_LIMIT_PER_MINUTE</code>
            </td>
            <td>
              <code>6</code>
            </td>
            <td>AI summary requests per IP per minute (clamped 1–100).</td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_DAILY_LIMIT</code>
            </td>
            <td>
              <code>40</code>
            </td>
            <td>Provider calls per day per instance (clamped 1–1000).</td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_PROVIDER_TIMEOUT_MS</code>
            </td>
            <td>
              <code>7000</code> (example sets <code>12000</code>)
            </td>
            <td>Per-provider timeout in milliseconds (clamped 3000–14000).</td>
          </tr>
          <tr>
            <td>
              <code>SUMMARY_CACHE_TTL_MS</code>
            </td>
            <td>
              <code>21600000</code> (6 h)
            </td>
            <td>Summary cache TTL in milliseconds (clamped 1 minute–24 h).</td>
          </tr>
        </tbody>
      </table>

      <h3>Site metadata</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Default</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>NEXT_PUBLIC_SITE_URL</code>
            </td>
            <td>
              <code>http://localhost:3000</code>
            </td>
            <td>
              Absolute origin used in <code>sitemap.xml</code> and{" "}
              <code>robots.txt</code>. Set it to the production URL at build
              time.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Build and run</h2>
      <CodeBlock title="terminal" lang="bash">{`git clone https://github.com/Aviox8/lighthouse.git
cd lighthouse
npm ci
npm run build
npm start            # http://localhost:3000

# development
npm run dev`}</CodeBlock>
      <p>
        CI runs <code>npm run lint</code>, <code>npm run typecheck</code>, and{" "}
        <code>npm test</code> on Node 22 for every push and pull request to{" "}
        <code>main</code>. Run <code>npm run build</code> locally as well —
        production compilation is not part of the CI workflow. See{" "}
        <Link href="/contributing">Contributing</Link> for the full checklist.
      </p>

      <h2>Deploying</h2>
      <p>
        On Vercel, import the repository and accept the detected Next.js
        defaults. Set <code>NEXT_PUBLIC_SITE_URL</code> to the deployment origin
        and add any provider keys as server-side environment variables. Both API
        routes declare <code>maxDuration = 30</code>; the Overpass client keeps
        its own 22-second overall budget underneath that cap.
      </p>
      <p>
        Any other Node host works the same way: build once, run{" "}
        <code>npm start</code>, and terminate TLS in front of it. Two operational
        consequences follow from the no-database design:
      </p>
      <ul>
        <li>
          Caches and rate counters are per process. Serverless instances, cold
          starts, and multiple regions do not share them.
        </li>
        <li>
          Restarting clears everything. That is intentional: there is no user
          data to migrate, and no search history to preserve.
        </li>
      </ul>

      <h2>Smoke test</h2>
      <p>
        There is no dedicated health endpoint. A small real search is the honest
        check that the whole chain — parser, geocoder, Overpass, serializer —
        works:
      </p>
      <CodeBlock title="terminal" lang="bash">{`curl -s -X POST http://localhost:3000/api/search \\
  -H 'content-type: application/json' \\
  -d '{"query":"type:hospital in berlin"}'`}</CodeBlock>
      <p>
        A <code>200</code> with <code>results</code>, <code>stats</code>, and{" "}
        <code>bounds</code> means the deployment is functional. Error codes are
        documented in the <Link href="/docs/api">API reference</Link>.
      </p>

      <h2>State and caching</h2>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Lifetime</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Search results</td>
            <td>5 minutes</td>
            <td>
              Keyed by parsed query. Stored in one process-wide map capped at
              500 entries; the oldest entry is evicted when full.
            </td>
          </tr>
          <tr>
            <td>Geocoding results</td>
            <td>24 hours</td>
            <td>Keyed by the normalized place string, same map and cap.</td>
          </tr>
          <tr>
            <td>AI summaries</td>
            <td>6 hours by default</td>
            <td>
              Up to 200 entries, keyed by a hash of the aggregate payload.
              Local summaries are never cached. Concurrent identical requests
              share one in-flight generation.
            </td>
          </tr>
          <tr>
            <td>Rate counters</td>
            <td>1 minute / 1 day</td>
            <td>
              Per-IP minute buckets and one instance-wide daily provider
              counter; reset at UTC midnight or on restart.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Upstream limits</h2>
      <table>
        <thead>
          <tr>
            <th>Upstream</th>
            <th>Limit</th>
            <th>Where it is enforced</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nominatim</td>
            <td>1 request/second</td>
            <td>
              Server-side queue in <code>geo.ts</code>; the keyed overpass.ch
              endpoint is preferred when configured.
            </td>
          </tr>
          <tr>
            <td>Overpass</td>
            <td>
              10 s per mirror, 22 s overall, 5,000 features per search
            </td>
            <td>
              <code>overpass.ts</code> timeout and truncation handling.
            </td>
          </tr>
          <tr>
            <td>OSM map tiles</td>
            <td>Public tile usage policy</td>
            <td>
              Browser-side via Leaflet, fetched from{" "}
              <code>tile.openstreetmap.org</code>.
            </td>
          </tr>
          <tr>
            <td>AI providers</td>
            <td>
              6 requests/IP/minute, 40 provider calls/day, 7 s per provider
            </td>
            <td>
              <code>app/api/summary/route.ts</code> and <code>summary.ts</code>
              ; exceeded limits return a local summary instead of an error.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Troubleshooting</h2>
      <table>
        <thead>
          <tr>
            <th>Symptom</th>
            <th>Likely cause</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>429 RATE_LIMITED</code>
            </td>
            <td>A public Overpass mirror is throttling clients.</td>
            <td>
              Retry shortly, narrow the query, or configure{" "}
              <code>OVERPASS_CH_KEY</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>504 TIMEOUT</code>
            </td>
            <td>Search area is too large or every mirror is slow.</td>
            <td>
              Use a smaller region, a <code>near:</code> query with a sensible{" "}
              <code>radius:</code>, or your own Overpass instance.
            </td>
          </tr>
          <tr>
            <td>
              <code>400 LOCATION_NOT_FOUND</code>
            </td>
            <td>Nominatim cannot resolve the place name.</td>
            <td>
              Use <code>region:</code> or <code>country:</code>, check the
              spelling, or anchor with a larger known place via{" "}
              <code>near:</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>400 INVALID_QUERY</code> / <code>MISSING_LOCATION</code>
            </td>
            <td>The query is missing a type/operator or a geographic scope.</td>
            <td>
              See the <Link href="/docs">query grammar</Link> and the{" "}
              <Link href="/docs/api">error table</Link>.
            </td>
          </tr>
          <tr>
            <td>Summaries stay local despite configured keys</td>
            <td>
              Provider timeout, exhausted daily counter, or an invalid key.
            </td>
            <td>
              Check server logs, the <code>SUMMARY_*</code> values, and the
              provider account. Falling back is deliberate; the UI labels the
              provider.
            </td>
          </tr>
          <tr>
            <td>
              <code>413</code> from <code>/api/summary</code>
            </td>
            <td>Request body exceeds 32 KB.</td>
            <td>
              Send the aggregate payload only — counts and top entries, never
              individual assets.
            </td>
          </tr>
          <tr>
            <td>Cache misses across requests</td>
            <td>Requests landed on different instances or a cold start.</td>
            <td>
              Expected with in-memory state. Add a shared cache only if your
              deployment genuinely needs one.
            </td>
          </tr>
          <tr>
            <td>
              Sitemap or robots point at <code>localhost</code>
            </td>
            <td>
              <code>NEXT_PUBLIC_SITE_URL</code> was unset when the build ran.
            </td>
            <td>Set the variable for the production build and redeploy.</td>
          </tr>
        </tbody>
      </table>

      <h2>Security and exposure</h2>
      <ul>
        <li>
          Provider keys and <code>OVERPASS_CH_KEY</code> are server-side secrets.
          Do not expose them through <code>NEXT_PUBLIC_*</code> variables or
          client components.
        </li>
        <li>
          <code>/api/summary</code> is unauthenticated by design. If you expose a
          public instance, put authentication and edge rate limiting in front of
          it — the built-in counters protect a hobby deployment, not a budget.
        </li>
        <li>
          <code>/api/search</code> has no application-level rate limiter; the
          upstream services enforce their own. High-traffic deployments should
          add edge limits rather than rely on someone else&rsquo;s.
        </li>
        <li>
          Keep dependencies patched. Dependabot is configured for the
          repository, and CI runs on every push and pull request.
        </li>
        <li>
          Report vulnerabilities privately — see{" "}
          <Link href="/security">Security</Link>, not a public issue.
        </li>
      </ul>

      <h2>Upstream policies</h2>
      <p>
        Self-hosting does not transfer the upstreams&rsquo; terms. The
        deployment is still responsible for them:
      </p>
      <ul>
        <li>
          <a
            href="https://operations.osmfoundation.org/policies/nominatim/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nominatim usage policy
          </a>
        </li>
        <li>
          <a
            href="https://operations.osmfoundation.org/policies/tiles/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OSM tile usage policy
          </a>
        </li>
        <li>
          <a
            href="https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances"
            target="_blank"
            rel="noopener noreferrer"
          >
            Public Overpass API instances
          </a>
        </li>
        <li>
          <a
            href="https://opendatacommons.org/licenses/odbl/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ODbL license
          </a>{" "}
          — the data obligation, covered in the{" "}
          <Link href="/legal">legal notices</Link>.
        </li>
      </ul>
      <p>
        The acceptable-use rules for the public instance are on{" "}
        <Link href="/policy">Acceptable use</Link>. For the HTTP contract, go back
        to the <Link href="/docs/api">API reference</Link>.
      </p>
    </StaticPage>
  );
}
