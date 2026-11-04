import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Lighthouse collects (almost nothing), what third parties see, how rate limits and your browser's storage are used, and how long data lives.",
};

export default function PrivacyPage() {
  return (
    <StaticPage eyebrow="Legal" title="Privacy" updated="November 5, 2026">
      <h2>Short version</h2>
      <p>
        Lighthouse has no accounts, no profiles, no ads, and no cross-site tracking. We do not
        build a history of your searches, sell your data, or identify you. Your browser stores one
        local preference (your map basemap choice) and nothing else.
      </p>

      <h2>1. What we process</h2>
      <ul>
        <li>
          <strong>Your query text.</strong> Sent to our server, parsed, and passed to Nominatim /
          Overpass to fulfill the search. Results are cached in memory briefly (about 5 minutes);
          geocoding results for 24 hours. Cache entries expire and are not written to a persistent
          database.
        </li>
        <li>
          <strong>Your IP address.</strong> Used only to enforce AI-summary rate limits (per minute
          and per day) in memory. It is not stored in a database, logged durably, or shared.
        </li>
        <li>
          <strong>Local preferences.</strong> Your basemap choice (Street / Satellite / Terrain) is
          saved in your browser via <code>localStorage</code> under{" "}
          <code>lighthouse-map-layer</code>. It never leaves your device unless you clear site data.
        </li>
      </ul>

      <h2>2. What we do not collect</h2>
      <ul>
        <li>No names, emails, passwords, or credentials — there is no sign-up.</li>
        <li>No device fingerprints, advertising identifiers, or retargeting pixels.</li>
        <li>No location access — the map centers on search results, not on your GPS.</li>
        <li>No cookies set by Lighthouse itself.</li>
      </ul>

      <h2>3. Analytics</h2>
      <p>
        The app includes Vercel Web Analytics, which records aggregated, privacy-friendly page-view
        metrics (for example, which page was visited and the request country) without advertising
        IDs or cross-app tracking. No personal search history is recorded.
      </p>

      <h2>4. Third parties your browser contacts</h2>
      <ul>
        <li>
          <strong>Map tiles</strong> — OpenStreetMap, Esri, and OpenTopoMap (or Stadia&rsquo;s terrain
          tiles as a fallback). They see your IP and which tiles you load.
        </li>
        <li>
          <strong>OpenStreetMap API</strong> — when you open &ldquo;More Info&rdquo; on an asset,
          metadata is fetched directly from{" "}
          <code>api.openstreetmap.org</code>; OSM sees your IP and the element ID requested.
        </li>
        <li>
          <strong>Geocoding &amp; data</strong> — your search box query goes through our server to
          Nominatim and Overpass; those public instances see the server&rsquo;s requests, not your
          browser directly.
        </li>
        <li>
          <strong>AI summary providers (optional, if configured by the operator)</strong> — only
          aggregate statistics (totals, counts, types) are sent. Never your IP-linked identity and
          never individual asset records.
        </li>
      </ul>

      <h2>5. Retention</h2>
      <p>
        Search and summary results live only in short-lived server memory and expire on their own.
        Nothing is written to a durable database by Lighthouse itself. Hosting providers (e.g.,
        Vercel) maintain their own transient infrastructure logs under their policies; we do not use
        those logs to identify individuals.
      </p>

      <h2>6. Your choices</h2>
      <ul>
        <li>Clear site data in your browser to remove the basemap preference.</li>
        <li>Block third-party tiles at your router or via browser extensions — the map will show a fallback tile.</li>
        <li>Use a VPN or Tor if you do not want tile servers or the OSM API to see your network identity.</li>
      </ul>

      <h2>7. Children</h2>
      <p>Lighthouse is not directed at children under 13 and collects no personal information from anyone.</p>

      <h2>8. Changes</h2>
      <p>
        We may update this notice as the service evolves. The date above is the latest revision;
        material changes will be noted in the repository&rsquo;s changelog.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions: open an issue at{" "}
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
