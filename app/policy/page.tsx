import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Acceptable use policy",
  description:
    "Acceptable use rules for the public Lighthouse instance: permitted research, prohibited bulk extraction, upstream service limits, AI constraints, and enforcement.",
};

export default function PolicyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Acceptable use policy"
      updated="November 6, 2026"
      active="/policy"
    >
      <p>
        Lighthouse is free to use and has no accounts. That only works because
        the upstream OpenStreetMap services it depends on are shared public
        infrastructure with their own rules. This page states the rules for the
        public instance in operational terms; the{" "}
        <Link href="/terms">Terms of Service</Link> are the corresponding
        contract, and the <Link href="/legal">legal notices</Link> cover data
        attribution.
      </p>
      <div className="doc-callout doc-callout-accent">
        <p>
          <strong>The short version</strong> — use it interactively, keep
          queries proportionate, do not extract a database through it, and do
          not try to bypass limits. If your use case needs bulk access, self-host
          or download an OSM extract.
        </p>
      </div>

      <h2>Permitted use</h2>
      <ul>
        <li>
          <strong>Research and analysis</strong> — investigating infrastructure
          coverage, comparing regions, checking what OpenStreetMap knows about a
          place.
        </li>
        <li>
          <strong>Journalism, planning, and teaching</strong> — using results in
          published work, planning documents, or classrooms, with ODbL
          attribution where required.
        </li>
        <li>
          <strong>Occasional scripting</strong> — small, rate-conscious queries
          against the JSON endpoints for a personal workflow. Use backoff, cache
          your own results, and do not run parallel workers against the public
          instance.
        </li>
        <li>
          <strong>Self-hosting</strong> — the code is MIT-licensed. Run your own
          instance under your own limits; the upstream policies still apply to
          the services you call.
        </li>
      </ul>

      <h2>Prohibited use</h2>
      <ul>
        <li>
          <strong>Bulk extraction.</strong> Do not reconstruct a regional,
          national, or global asset database through the interface or API. The
          5,000-feature cap and 10-second upstream timeouts make this the wrong
          tool anyway.
        </li>
        <li>
          <strong>Scraping or automated harvesting.</strong> No crawling the
          site, no headless-browser farms, no scheduled jobs that enumerate
          places or asset types.
        </li>
        <li>
          <strong>Limit evasion.</strong> Do not rotate IPs, create parallel
          clients, or otherwise work around rate limits, the daily provider
          cap, or upstream throttling.
        </li>
        <li>
          <strong>Denial of service.</strong> No flooding, request amplification,
          resource exhaustion, or traffic intended to degrade the service or its
          upstreams.
        </li>
        <li>
          <strong>Harmful targeting.</strong> Do not use results to surveil,
          stalk, harass, or endanger people or communities, or to plan violence
          or illegal activity. Infrastructure data is not a license to target
          the people who operate or depend on it.
        </li>
        <li>
          <strong>Misrepresentation.</strong> Do not present Lighthouse output as
          an authoritative survey, an official registry, or a verified
          real-time inventory. It is crowd-sourced OpenStreetMap data.
        </li>
        <li>
          <strong>Attribution removal.</strong> Do not strip the OpenStreetMap
          attribution, ODbL notice, or Mapillary imagery credit from reused
          data.
        </li>
      </ul>

      <h2>Bulk data and the right tool</h2>
      <p>
        The public instance is an interactive instrument, not a data
        distribution channel. If you need more than a handful of bounded
        queries, use one of these instead:
      </p>
      <ul>
        <li>
          A regional{" "}
          <a
            href="https://download.geofabrik.de/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OSM extract
          </a>{" "}
          for offline analysis — the complete data, no per-query cap.
        </li>
        <li>
          Your own Overpass instance loaded with the extract, for repeated or
          large-area queries.
        </li>
        <li>
          Your own Lighthouse deployment pointed at that instance via{" "}
          <code>OVERPASS_CH_KEY</code> or code changes permitted by the MIT
          license.
        </li>
      </ul>

      <h2>Upstream service rules</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Rule</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nominatim</td>
            <td>
              Maximum 1 request/second for the public service. Lighthouse
              enforces this server-side; do not try to parallelize around it.
            </td>
          </tr>
          <tr>
            <td>Overpass API</td>
            <td>
              Fair use. Public mirrors may throttle or reject heavy queries;
              the 10-second per-mirror timeout and 5,000-feature cap exist to
              keep queries proportionate.
            </td>
          </tr>
          <tr>
            <td>OSM map tiles</td>
            <td>
              Subject to the{" "}
              <a
                href="https://operations.osmfoundation.org/policies/tiles/"
                target="_blank"
                rel="noopener noreferrer"
              >
                tile usage policy
              </a>
              . Interactive viewing is fine; bulk tile downloading is not.
            </td>
          </tr>
          <tr>
            <td>Mapillary</td>
            <td>
              Street-level previews request only the selected asset&rsquo;s
              coordinates, one lookup per opened popup. Subject to{" "}
              <a
                href="https://www.mapillary.com/terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mapillary&rsquo;s terms
              </a>
              ; do not use the helper to harvest imagery or enumerate coverage.
            </td>
          </tr>
          <tr>
            <td>AI providers</td>
            <td>
              Provider calls are capped per IP and per instance. Do not use the
              summary endpoint as a general-purpose LLM proxy.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Limits and enforcement</h2>
      <ul>
        <li>
          <strong>Search:</strong> 5,000 features per query; 10 seconds per
          Overpass mirror with a 22-second overall budget; 5-minute in-memory
          cache.
        </li>
        <li>
          <strong>AI summaries:</strong> 6 requests per IP per minute, 40
          provider calls per day per instance. Exceeding a limit returns a local
          summary, not an error — the cap protects provider quota, not the data.
        </li>
        <li>
          <strong>Street-level previews:</strong> one Mapillary lookup per
          opened popup, cached in memory for five minutes. The helper is for
          interactive viewing, not coverage enumeration.
        </li>
        <li>
          <strong>Upstream response:</strong> Overpass may return{" "}
          <code>429</code> or time out. That is a shared-service signal to slow
          down, not an invitation to retry aggressively.
        </li>
        <li>
          <strong>Enforcement:</strong> rate limits and upstream throttling are
          the first line of defense. Operators may refuse or block traffic that
          threatens availability or violates this policy. There is no appeals
          desk; if you believe a block is a mistake, open an issue.
        </li>
      </ul>

      <h2>AI summaries</h2>
      <p>
        Summaries are generated from aggregate statistics only — counts, top
        types, top operators, and the truncation flag. Individual asset names,
        coordinates, and tags are never sent to a provider. Do not attempt to
        use prompt injection, malformed payloads, or the summary endpoint to
        extract per-asset data or turn the service into a general LLM proxy.
      </p>
      <p>
        Treat every summary as a fallible briefing. Counts come from the search
        result; prose interpretation can be wrong. Do not rely on a summary —
        or on Lighthouse itself — for safety-, legal-, or life-critical
        decisions without independent verification.
      </p>

      <h2>Reporting abuse</h2>
      <p>
        If you see usage that violates this policy and it is safe to discuss in
        public, open an issue on{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          the tracker
        </a>
        . For anything sensitive — including a vulnerability in the service —
        use the private route described on the{" "}
        <Link href="/security">security page</Link> instead of posting details
        publicly.
      </p>

      <h2>Changes</h2>
      <p>
        This policy can change as the project and its upstreams change. The date
        under the title is the current version. Continued use of the public
        instance after a revision means acceptance of the revised policy.
      </p>
    </StaticPage>
  );
}
