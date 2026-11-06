import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Lighthouse privacy: no accounts, no cookies, no stored searches. What queries, analytics, rate limiting, and AI providers actually touch.",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="November 6, 2026"
      active="/privacy"
    >
      <p>
        Lighthouse is built so there is almost nothing to disclose: no
        accounts, no tracking cookies, no search history, no database. This
        page documents what does touch the network, and why.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>No accounts — nothing to identify you is collected.</li>
        <li>
          Searches are processed for a single request cycle and are never
          persisted.
        </li>
        <li>
          No cookies for tracking; no cross-site identifiers; no advertising
          anywhere.
        </li>
        <li>
          AI summaries receive aggregate statistics only — never names,
          coordinates, or tags of individual results.
        </li>
      </ul>

      <h2>What a search sends, and where</h2>
      <p>
        When you search, your query text goes to this site&rsquo;s server, and
        the server performs these requests:
      </p>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Purpose</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a
                href="https://nominatim.openstreetmap.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nominatim
              </a>
            </td>
            <td>Resolve place names in your query (server-side)</td>
            <td>
              Throttled to the policy limit of 1 request/second; requests come
              from the server, not from your browser
            </td>
          </tr>
          <tr>
            <td>
              <a
                href="https://overpass-api.de/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Overpass API
              </a>
            </td>
            <td>Execute the OpenStreetMap query (server-side)</td>
            <td>
              Public mirrors with failover; queries are capped at 5,000
              features
            </td>
          </tr>
          <tr>
            <td>
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                tile.openstreetmap.org
              </a>
            </td>
            <td>Map tiles (loaded by your browser)</td>
            <td>
              Direct browser-to-OSM requests are unavoidable for rendering; the
              OSM tile policy applies
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        None of these services receive user accounts or identifiers from
        Lighthouse; standard network metadata (IP addresses, user agents)
        reaches them as with any web request, under their own policies.
      </p>

      <h2>Rate limiting</h2>
      <p>
        To protect upstream services, AI-summary requests are limited to{" "}
        <strong>6 requests per IP per minute</strong>, with a shared pool of{" "}
        <strong>40 provider-generated summaries per day</strong>. These
        counters live in server memory only — they are not persisted, not
        profiled, and they evaporate on restart. When a limit is hit you get an
        honest <code>429</code> with the reason, not a silent shadow-ban.
      </p>

      <h2>Analytics</h2>
      <p>
        The public deployment uses{" "}
        <a
          href="https://vercel.com/docs/analytics"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vercel Analytics
        </a>{" "}
        — anonymous, cookie-free page-view aggregates. No persistent
        identifiers are collected, nothing is sold, and there is no cookie
        banner to click because there are no tracking cookies. Self-hosted
        instances bind to whatever you configure; the <code>&lt;Analytics
        /&gt;</code> tag in the layout is the only analytics component.
      </p>

      <h2>AI providers</h2>
      <p>
        If the operator has configured provider keys, each summary request may
        be sent to <strong>OpenRouter</strong>, <strong>Ollama</strong>, or{" "}
        <strong>Exa</strong> — in that chain order, with a deterministic local
        fallback that sends nothing anywhere. The request payload contains:
      </p>
      <ul>
        <li>Aggregate counts: total results, capped truncation flag</li>
        <li>Top-12 asset types and top-12 operators by count</li>
        <li>Any truncation warning</li>
      </ul>
      <p>
        It never contains: asset names, coordinates, tags, your query&rsquo;s
        raw text, or anything that identifies you. Provider responses are
        cached in memory for 6 hours keyed by the aggregate payload — so the
        same statistics, whatever visitor produced them, reuse one summary.
      </p>

      <h2>Self-hosting</h2>
      <p>
        Run Lighthouse yourself and every data flow is yours: no analytics
        (remove the tag), no providers (unset the keys — the local summary is
        the default), and your own Overpass/Nominatim endpoints if you want to
        remove even upstream OSM services from the equation. See the{" "}
        <Link href="/docs/operations#environment-variables">
          environment reference
        </Link>
        .
      </p>

      <h2>Data retention</h2>
      <p>
        Nothing about you is stored: no database, no search logs, no request
        bodies at rest. In-memory caches (summary responses, rate counters)
        are the only state, and they reset on every redeploy or restart.
      </p>

      <h2>Changes</h2>
      <p>
        If data practices change, this page changes with them — the date below
        the title is the version date. Questions or a flaw in this policy?{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open an issue
        </a>
        .
      </p>
    </StaticPage>
  );
}
