import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Lighthouse documentation: how the pipeline works, the query grammar, and where to find the API reference and self-hosting guide.",
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
        queries. This page covers how the pipeline works and the query grammar.
        For what the project is, read <Link href="/about">About Lighthouse</Link>;
        for the HTTP contract see the{" "}
        <Link href="/docs/api">API reference</Link>; to run it yourself see{" "}
        <Link href="/docs/operations">self-hosting</Link>.
      </p>
      <div className="doc-callout doc-callout-accent">
        <p>
          <strong>You will learn</strong> — how a search moves through the
          system, the full query grammar, and the limits that keep the shared
          upstream services healthy.
        </p>
      </div>

      <h2>Architecture</h2>
      <CodeBlock title="pipeline" lang="flow">{`Homepage ──POST /api/search──▶ parser.ts ─▶ geo.ts (Nominatim, 1 req/s)
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
          individual assets. The complete payload is documented in the{" "}
          <Link href="/docs/api">API reference</Link>.
        </li>
      </ul>

      <h2>Query syntax</h2>
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
            <td>
              Asset type key (≈230 supported — the catalog is on the{" "}
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
            <td>
              Radius in kilometres (default 50, clamped to 500)
            </td>
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

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/docs/api">API reference</Link> — request and response
          shapes, error codes, rate limits.
        </li>
        <li>
          <Link href="/docs/operations">Self-hosting &amp; operations</Link> —
          environment variables, deployment, troubleshooting.
        </li>
        <li>
          <Link href="/types">Asset types</Link> — the generated catalog of
          every queryable type.
        </li>
        <li>
          <Link href="/contributing">Contributing</Link> — add an asset type or
          fix a bug.
        </li>
      </ul>
    </StaticPage>
  );
}
