import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Lighthouse is, what it does not do, and how it handles OpenStreetMap data and optional Mapillary imagery.",
};

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About"
      title="About Lighthouse"
      updated="November 6, 2026"
      active="/about"
    >
      <h2>What it is</h2>
      <p>
        Lighthouse is a free, open-source tool for discovering physical-world
        infrastructure from OpenStreetMap data: telecom towers, power plants,
        data centers, ports, hospitals, prisons, lighthouses — 230+ asset types
        across 30+ categories. Type a query in plain language (
        <code>wind farms near copenhagen</code>) or structured form (
        <code>type:data_center operator:google region:california</code>) and it
        maps, filters, and summarizes what OpenStreetMap knows. Marker popups
        can also show a street-level image from Mapillary when the operator has
        configured a token.
      </p>
      <p>
        There is no database behind it. Every search is executed live against
        the OpenStreetMap commons via the Overpass API and Nominatim. See the{" "}
        <Link href="/docs">documentation</Link> for the full pipeline, the query
        grammar, and the API contract.
      </p>

      <h2>What it is not</h2>
      <ul>
        <li>
          Not an authoritative inventory. OSM is crowd-sourced; verify anything
          that matters.
        </li>
        <li>
          Not a surveillance product. No accounts, no tracking beyond
          anonymous, self-hosted-style analytics, no saved search history.
        </li>
        <li>
          Not an &ldquo;AI dashboard.&rdquo; AI summaries are optional,
          aggregate-only, and always labeled with their provider.
        </li>
        <li>
          Not a bulk-extraction service. Queries are capped at 5,000 features
          by design — see the <Link href="/policy">acceptable use policy</Link>{" "}
          for the rules that keep this sustainable.
        </li>
      </ul>

      <h2>Who it serves</h2>
      <p>
        Infrastructure analysts, OSINT researchers, journalists, urban
        planners, engineers, and the simply curious — people who care about
        data fidelity and speed over decoration.
      </p>

      <h2>How it works</h2>
      <p>
        A query is parsed (natural-language patterns plus structured{" "}
        <code>type:</code>/<code>near:</code>/<code>radius:</code> tokens),
        geocoded (Nominatim, throttled to 1 request/second), executed against
        Overpass with automatic mirror failover, and returned as a bounded
        result set of type/operator statistics, map bounds, and individual
        assets. The optional summary step receives aggregates only. If a{" "}
        <code>MAPILLARY_TOKEN</code> is configured, opening a marker popup
        performs one small server-side Mapillary lookup for the nearest image;
        without it, the popup links to Mapillary at the asset coordinates.
        Exact details live in the <Link href="/docs">documentation</Link>.
      </p>

      <h2>Principles</h2>
      <ul>
        <li>
          <strong>Honest over impressive.</strong> Errors name their likely
          cause; warnings say exactly what is incomplete; AI output is never
          presented as measured fact.
        </li>
        <li>
          <strong>Aggregate-only AI.</strong> Summaries receive totals and
          counts — never names, tags, or coordinates. Individual asset records
          are not sent to any provider.
        </li>
        <li>
          <strong>Respect the commons.</strong> Nominatim is throttled to 1
          request/second; Overpass queries fail over across mirrors; nothing is
          bulk-scraped.
        </li>
        <li>
          <strong>Dense, fast, monochrome.</strong> A restrained interface built
          for large result sets, keyboard navigation, and reduced-motion
          environments.
        </li>
      </ul>

      <h2>Open source</h2>
      <p>
        The entire codebase is <Link href="/license">MIT-licensed</Link> on{" "}
        <a
          href="https://github.com/Aviox8/lighthouse"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        . Bug reports, pull requests, and asset-type requests are welcome — see{" "}
        <Link href="/dev">the developer page</Link> for how to get involved.
      </p>

      <h2>FAQ</h2>
      <h3>Is it free?</h3>
      <p>
        Yes, and it stays free and open source. There is no paid tier and
        nothing to buy.
      </p>
      <h3>Do I need an account or API keys?</h3>
      <p>
        No. Without configuration, search, maps, filters, and local summaries
        all work. AI summaries use a deterministic local fallback when no
        provider key exists; self-hosters can bring their own OpenRouter /
        Ollama / Exa keys. Inline Mapillary previews additionally require a
        server-side <code>MAPILLARY_TOKEN</code> — without it, the popup falls
        back to a public Mapillary link.
      </p>
      <h3>Why can&rsquo;t I extract everything in a large country?</h3>
      <p>
        Public Overpass instances are shared infrastructure. Lighthouse caps at
        5,000 features and reports truncation rather than overload them. For
        complete extraction you need your own Overpass instance or a regional
        OSM extract.
      </p>
      <h3>Where does the data come from?</h3>
      <p>
        © OpenStreetMap contributors, ODbL, via the Overpass API; geocoding via
        Nominatim. Street-level imagery, when enabled, comes from Mapillary and
        is © Mapillary contributors. Attribution details in the{" "}
        <Link href="/legal">legal notices</Link>.
      </p>
    </StaticPage>
  );
}
