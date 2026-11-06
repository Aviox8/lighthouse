import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The deliberately short terms of service for using the public Lighthouse instance.",
};

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="November 6, 2026"
      active="/terms"
    >
      <p>
        These terms cover use of the public deployment of Lighthouse. They are
        deliberately short: this is an open-source project, not a company, and
        the honest legal position is that{" "}
        <Link href="/license">MIT-licensed code</Link> is provided as-is. The
        parts below that still matter are said plainly.
      </p>

      <h2>1. What the service is</h2>
      <p>
        Lighthouse queries OpenStreetMap data through public community
        infrastructure (Overpass API, Nominatim) and displays it on a map,
        with optional machine-generated aggregate summaries. It is free, no
        account is required, and nothing you type is stored.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>
          Use it like the shared public resource it is. No scripted, bulk, or
          automated access to the endpoints; rate limits exist and will stop
          you anyway.
        </li>
        <li>
          Do not attempt to reconstruct a regional or national asset database
          through the interface. For that, use OSM extracts or your own
          Overpass instance — see the{" "}
          <Link href="/policy">acceptable use policy</Link>.
        </li>
        <li>
          Do not interfere with the operation of the service or the upstream
          services it relies on, and don&rsquo;t try to upset the
          &ldquo;aggregate-only&rdquo; design of the summary feature.
        </li>
      </ul>

      <h2>3. Data — what you see and what it is</h2>
      <ul>
        <li>
          Results are © OpenStreetMap contributors under ODbL. Attribution and
          share-alike obligations attach to any data you reuse, per the{" "}
          <Link href="/legal">legal notices</Link>.
        </li>
        <li>
          OSM is crowd-sourced. Locations, names, operators, and coverage can
          be wrong or missing. Lighthouse does not verify anything and
          presents no warranty of any kind — verify independently before
          relying on any result, especially for anything legal, financial, or
          safety-critical.
        </li>
      </ul>

      <h2>4. AI summaries</h2>
      <p>
        Summaries are optional, machine-generated interpretations of aggregate
        statistics, always labeled with their provider. They may be inaccurate
        or miss nuance; they are a briefing aid, not measured fact. Use of the
        locally generated fallback keeps everything on the server you&rsquo;re
        already using.
      </p>

      <h2>5. Availability</h2>
        <p>
        There is no SLA. Upstreams (public Overpass mirrors, Nominatim) are
        shared infrastructure and fail or throttle at times; errors surface
        honestly when they do. The service can change or be suspended at any
        time, without notice. <Link href="/docs/operations">Self-hosting</Link>{" "}
        removes this dependency entirely.
      </p>

      <h2>6. Liability</h2>
      <p>
        To the maximum extent permitted by law, the software and its operators
        provide no warranty and accept no liability for any loss arising from
        use of the service or its data. This mirrors the MIT license disclaimer
        — it is the same position, stated in fewer words.
      </p>

      <h2>7. Changes &amp; termination</h2>
      <ul>
        <li>
          These terms can be updated as the project changes; revisions are
          posted on this page with the date above. Continued use after a
          change means acceptance.
        </li>
        <li>
          Abusive use terminates access to the public instance — enforced by
          rate limiting in the first instance.
        </li>
      </ul>

      <h2>8. Governing stance</h2>
      <p>
        There is no legal entity behind Lighthouse, so no venue shopping and
        no forum clause games: disputes, bug reports, utility questions, and
        anything else go through{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          the GitHub tracker
        </a>
        , in the open.
      </p>
    </StaticPage>
  );
}
