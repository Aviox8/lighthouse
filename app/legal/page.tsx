import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Legal notices",
  description:
    "Attribution and legal notices for Lighthouse: OpenStreetMap data terms, tile and geocoding usage policies, Mapillary imagery, AI disclosure, trademarks, and acceptable use.",
};

export default function LegalPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Legal notices"
      updated="November 6, 2026"
      active="/legal"
    >
      <p>
        Lighthouse is an interface to open data. Almost every legal question
        about it reduces to the terms of the upstream sources it queries. This
        page records those obligations in plain language; the{" "}
        <Link href="/license">MIT license</Link> covers the code itself.
      </p>

      <h2>OpenStreetMap data</h2>
      <p>
        All results come from OpenStreetMap, © the OpenStreetMap contributors
        and available under the{" "}
        <a
          href="https://opendatacommons.org/licenses/odbl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Database License (ODbL)
        </a>
        . Requirements when reusing data obtained through Lighthouse:
      </p>
      <ul>
        <li>
          <strong>Attribution</strong> — credit &ldquo;© OpenStreetMap
          contributors&rdquo; and link to{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            openstreetmap.org/copyright
          </a>
          .
        </li>
        <li>
          <strong>Share-alike</strong> — a derived database built from this
          data must be distributed under ODbL as well.
        </li>
        <li>
          <strong>Data honesty</strong> — OSM is crowd-sourced; it may be
          incomplete, outdated, or wrong. Nothing here is an authoritative
          survey. Verify anything that matters.
        </li>
      </ul>
      <div className="doc-callout doc-callout-accent">
        <p>
          &ldquo;OpenStreetMap&rdquo; and the magnifier logo are registered
          trademarks of the OpenStreetMap Foundation. Lighthouse is not
          affiliated with, nor endorsed by, the OpenStreetMap Foundation.
        </p>
      </div>

      <h2>Map tiles &amp; geocoding</h2>
      <ul>
        <li>
          Map tiles are fetched from <code>tile.openstreetmap.org</code>{" "}
          (streets), <code>server.arcgisonline.com</code> (Esri World Imagery,
          satellite) and <code>tile.opentopomap.org</code> (terrain). OSM tiles
          are subject to the OpenStreetMap Foundation&rsquo;s public{" "}
          <a
            href="https://operations.osmfoundation.org/policies/tiles/"
            target="_blank"
            rel="noopener noreferrer"
          >
            tile usage policy
          </a>{" "}
          (per-user, bulk-like or heavy browsing is explicitly discouraged).
          Esri and OpenTopoMap tiles carry their own attribution, shown in the
          map corner.
        </li>
        <li>
          Geocoding runs through the public{" "}
          <a
            href="https://nominatim.openstreetmap.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nominatim
          </a>{" "}
          service under its{" "}
          <a
            href="https://operations.osmfoundation.org/policies/nominatim/"
            target="_blank"
            rel="noopener noreferrer"
          >
            usage policy
          </a>{" "}
          — Lighthouse enforces the required 1 request/second server-side.
          Self-hosters can bring their own instances.
        </li>
        <li>
          OSM queries execute via the Overpass API against public mirrors with
          automatic failover. Please keep queries proportionate — the
          5,000-feature cap exists exactly so this stays a good citizen.
        </li>
      </ul>

      <h2>Street-level imagery</h2>
      <p>
        Inline street-level previews are optional and come from{" "}
        <a
          href="https://www.mapillary.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mapillary
        </a>
        . When a preview is enabled, opening a marker popup sends that
        asset&rsquo;s coordinates from the Lighthouse server to the Mapillary
        API; the thumbnail itself loads from Mapillary&rsquo;s CDN in your
        browser. Images are © Mapillary contributors and subject to Mapillary&rsquo;s
        terms. Coverage is not guaranteed, and the nearest image can be several
        hundred metres from the asset — check the distance shown with the
        preview.
      </p>
      <ul>
        <li>
          Keep the &ldquo;Imagery © Mapillary&rdquo; credit when reusing a
          preview.
        </li>
        <li>
          Lighthouse stores no copy of the imagery; only short-lived signed
          thumbnail URLs pass through the lookup cache.
        </li>
        <li>
          Lighthouse is not affiliated with, nor endorsed by, Mapillary.
        </li>
      </ul>

      <h2>AI summary disclosure</h2>
      <p>
        Aggregate summaries are machine-generated, and the UI always states
        which provider produced one (OpenRouter, Ollama, Exa, or the
        deterministic local fallback). Treat them like a fast, fallible
        briefing: counts are real; prose interpretation can be wrong. Only
        aggregate statistics are sent to providers — text never exposes
        individual asset names, coordinates, or tags. The{" "}
        <Link href="/privacy">privacy policy</Link> details the data flows.
      </p>

      <h2>Trademarks</h2>
      <p>
        Product names referenced in this interface — OpenStreetMap, Overpass,
        Nominatim, Mapillary, Esri, OpenTopoMap, Leaflet, Next.js, Vercel,
        OpenRouter, Ollama, Exa — belong to their respective owners. No
        affiliation or endorsement is claimed unless stated. The Lighthouse
        name and interface itself are provided
        under the MIT license; be decent about not passing the project off as
        yours.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>
          Do not scrape, script, or automate this site&rsquo;s endpoints at
          volume; shared public infrastructure powers everything and rate
          limits are enforced in several layers.
        </li>
        <li>
          Do not use Lighthouse to build bulk regional or national databases
          through it — the correct tool for extraction is a{" "}
          <a
            href="https://download.geofabrik.de/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OSM extract
          </a>{" "}
          or your own Overpass instance.
        </li>
        <li>
          Do not rely on the output for safety-, legal-, or life-critical
          decisions without independent verification.
        </li>
      </ul>
      <p>
        The operational rules are spelled out in the{" "}
        <Link href="/policy">acceptable use policy</Link>; the longer-form
        contract is the <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        The fastest (and basically only) way to reach the project is{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          the GitHub issue tracker
        </a>
        . There is no legal@ mailbox; there is no company to mail.
      </p>
    </StaticPage>
  );
}
