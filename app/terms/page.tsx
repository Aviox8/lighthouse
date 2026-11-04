import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of Lighthouse, the OpenStreetMap data it displays, third-party services it queries, and AI-generated aggregate summaries.",
};

export default function TermsPage() {
  return (
    <StaticPage eyebrow="Legal" title="Terms of Service" updated="November 5, 2026">
      <h2>1. Acceptance</h2>
      <p>
        Lighthouse is a free, public, open-source tool for discovering and analyzing
        physical-world infrastructure using OpenStreetMap (OSM) data. By using the service you
        agree to these terms. If you do not agree, do not use the service. We may update these
        terms as the project evolves; the date above reflects the latest revision.
      </p>

      <h2>2. What Lighthouse is</h2>
      <p>
        Lighthouse is a read-only viewer. It geocodes a place name via Nominatim, queries OSM
        feature data via the Overpass API, and renders results on a map. It is not a database of
        record, not a survey, and not an authoritative inventory of any asset. Optional AI
        summaries describe aggregate counts only and never contain individual asset records.
      </p>

      <h2>3. Data accuracy</h2>
      <p>
        OSM data is crowd-sourced. It may be missing, outdated, duplicated, or wrong. Presence,
        absence, and attributes (such as operator or name) of any feature may be inaccurate. Do
        not rely on Lighthouse for life-safety, legal, engineering, or security decisions without
        independent verification against authoritative sources. To report map data issues, use{" "}
        <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">
          openstreetmap.org/fixthemap
        </a>.
      </p>

      <h2>4. Responsible use</h2>
      <p>You agree that you will not:</p>
      <ul>
        <li>Use Lighthouse for illegal surveillance, stalking, or any unlawful purpose.</li>
        <li>Run bulk automated queries that overload public Nominatim, Overpass, or tile servers.</li>
        <li>Circumvent rate limits, retry logic, or access controls.</li>
        <li>Scrape, mirror, or redistribute the service in a way that violates OSM, Nominatim, or Overpass usage policies.</li>
        <li>Misrepresent the service&rsquo;s output as a verified, authoritative assessment.</li>
      </ul>

      <h2>5. Rate limits and availability</h2>
      <p>
        Geocoding is limited to one request per second (Nominatim&rsquo;s public policy); AI
        summaries are limited per IP per minute and in total provider calls per day. Searches
        against country-sized areas are inherently slower and may time out. The service is offered
        on a best-effort basis with no uptime, accuracy, or availability guarantee. We may throttle
        or suspend access that degrades service for others.
      </p>

      <h2>6. AI-generated summaries</h2>
      <p>
        Summaries are generated from aggregate result statistics (totals, top feature types, and
        operator counts) only. They are unverified and may be incomplete or wrong. A deterministic
        local summary is used when no AI provider is configured or providers fail. Never treat a
        summary as measured fact; verify against the underlying OSM data and official sources.
        Individual asset names, tags, and coordinates are never sent to AI providers.
      </p>

      <h2>7. Third-party services</h2>
      <p>Lighthouse interoperates with services you may contact directly through normal use:</p>
      <ul>
        <li>OpenStreetMap tiles, Nominatim (geocoding), Overpass API (data) — see OSM policies.</li>
        <li>Esri World Imagery (satellite basemap) and OpenTopoMap (terrain basemap) — optional layers.</li>
        <li>The OpenStreetMap API (metadata when you open &ldquo;More Info&rdquo; on an asset), called directly from your browser.</li>
        <li>Optional AI providers (OpenRouter, Ollama, Exa) — server-side only, aggregate data only.</li>
      </ul>
      <p>Each third party operates under its own terms and policies; we are not responsible for their behavior.</p>

      <h2>8. OpenStreetMap licence</h2>
      <p>
        OSM data is &copy; OpenStreetMap contributors and licensed under the Open Database License
        (ODbL). If you derive and publicly use data from this service, you must provide attribution
        to OpenStreetMap and respect the share-alike requirements of the ODbL.
      </p>

      <h2>9. Disclaimer and liability</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AUTHORS AND CONTRIBUTORS ARE NOT LIABLE FOR
        ANY DAMAGES ARISING FROM USE OF, OR INABILITY TO USE, THE SERVICE OR ITS OUTPUT.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions, corrections, or abuse reports: open an issue at{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/Aviox8/lighthouse/issues
        </a>.
      </p>
    </StaticPage>
  );
}
