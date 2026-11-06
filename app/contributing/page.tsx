import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Contributing",
  description:
    "Contribute to Lighthouse: development setup, asset-type recipe, query and UI guidelines, pull request checklist, and issue reporting.",
};

const REPO_URL = "https://github.com/Aviox8/lighthouse";

export default function ContributingPage() {
  return (
    <StaticPage
      eyebrow="Project"
      title="Contributing"
      updated="November 6, 2026"
      active="/contributing"
    >
      <p>
        Lighthouse is maintained in public by{" "}
        <a
          href="https://github.com/archduke1337"
          target="_blank"
          rel="noopener noreferrer"
        >
          archduke1337
        </a>{" "}
        and accepts contributions from anyone willing to match the project&rsquo;s
        bar for accuracy. There is no CLA: contributions are accepted under the
        same <Link href="/license">MIT license</Link> as the rest of the code.
      </p>

      <h2>Ways to contribute</h2>
      <ul>
        <li>
          <strong>Add or correct an asset type.</strong> The cheapest useful
          contribution: a new key, label, and OSM tag filter in{" "}
          <code>ASSET_TYPE_MAP</code>. One type per pull request.
        </li>
        <li>
          <strong>Report a bug with a reproduction.</strong> Include the exact
          query, the error code or message, and what you expected. That is often
          more valuable than a patch.
        </li>
        <li>
          <strong>Fix a parser gap.</strong> Natural-language phrases that should
          resolve to an existing type but do not.
        </li>
        <li>
          <strong>Improve the docs.</strong> Wrong limits, stale environment
          variables, or unclear error explanations are real bugs.
        </li>
        <li>
          <strong>Fix OpenStreetMap data.</strong> If a feature is missing or
          misplaced, edit it at{" "}
          <a
            href="https://www.openstreetmap.org/fixthemap"
            target="_blank"
            rel="noopener noreferrer"
          >
            openstreetmap.org/fixthemap
          </a>
          . Lighthouse only displays what OSM contains.
        </li>
        <li>
          <strong>Report security issues privately.</strong> Follow the{" "}
          <Link href="/security">security policy</Link>, not the public tracker.
        </li>
      </ul>

      <h2>Before you start</h2>
      <ul>
        <li>
          <strong>Issue-first for anything larger than a single asset type.</strong>{" "}
          Query-grammar changes, limits, provider-chain behavior, and UI
          redesigns should have an agreed issue before a pull request.
        </li>
        <li>
          <strong>One concern per pull request.</strong> Small, reviewable
          changes merge faster than a branch that fixes five unrelated things.
        </li>
        <li>
          <strong>No new dependencies without discussion.</strong> The project
          deliberately keeps its surface small.
        </li>
        <li>
          <strong>Node.js 22 and npm.</strong> That is the CI baseline.
        </li>
      </ul>

      <h2>Development loop</h2>
      <CodeBlock title="terminal" lang="bash">{`git clone ${REPO_URL}.git
cd lighthouse
npm ci
npm run dev        # http://localhost:3000

# before opening a pull request
npm run lint
npm run typecheck
npm test
npm run build`}</CodeBlock>
      <p>
        CI runs lint, typecheck, and the Vitest suites on every push and pull
        request to <code>main</code>. The production build is not part of CI —
        run it yourself before requesting review.
      </p>

      <h2>Add an asset type</h2>
      <p>
        Asset types live in <code>lib/types.ts</code>. Each entry is a key, a
        human label, and one or more OSM tag filters. This is the real shape,
        using an existing entry:
      </p>
      <CodeBlock title="lib/types.ts" lang="ts">{`export const ASSET_TYPE_MAP: Record<
  string,
  {
    osmTags:
      | Record<string, string | string[]>
      | Record<string, string | string[]>[];
    label: string;
  }
> = {
  // ...
  weather_station: {
    osmTags: { 'man_made': 'weather_station' },
    label: 'Weather Station'
  }
};`}</CodeBlock>
      <ol>
        <li>
          Add your key inside <code>ASSET_TYPE_MAP</code>. Use a lowercase
          snake-case key and a short title-case label. Source tags from the OSM
          wiki&rsquo;s{" "}
          <a
            href="https://wiki.openstreetmap.org/wiki/Map_Features"
            target="_blank"
            rel="noopener noreferrer"
          >
            Map Features
          </a>{" "}
          page or taginfo; do not invent tags.
        </li>
        <li>
          If a type needs several filters, use an array of tag records — the{" "}
          <code>telecom</code> entry is the reference example.
        </li>
        <li>
          <code>type:your_key</code> works immediately because the parser
          resolves structured tokens against the map. The{" "}
          <Link href="/types">types catalog</Link> is generated from the same
          map, so it updates automatically.
        </li>
        <li>
          Only add a natural-language phrase if the everyday name differs from
          the key. Patterns live in <code>TYPE_PATTERNS</code> in{" "}
          <code>lib/parser.ts</code>; keep specific patterns before generic
          ones.
        </li>
        <li>
          Add or extend a case in <code>lib/__tests__/parser.test.ts</code>.
          Run the full check pipeline.
        </li>
      </ol>

      <h2>Query grammar changes</h2>
      <p>
        The grammar is intentionally small:{" "}
        <code>type:</code>, <code>operator:</code>, <code>region:</code>,{" "}
        <code>country:</code>, <code>near:</code>, and <code>radius:</code>, plus
        curated natural-language phrases. Changes here need an issue first and
        tests for both the accepted and rejected forms. Validation must keep
        requiring an asset type or operator plus a geographic scope.
      </p>

      <h2>UI and copy rules</h2>
      <ul>
        <li>
          <strong>Monochrome, zero radius, dark only.</strong> Use the tokens in{" "}
          <code>app/globals.css</code>; no new colors, no rounded corners, no
          decorative gradients.
        </li>
        <li>
          <strong>State the truth.</strong> Errors name likely causes; warnings
          say exactly what is incomplete; AI output is labeled with its provider
          and never presents aggregates as per-asset facts.
        </li>
        <li>
          <strong>No marketing filler.</strong> Docs pages are fact-dense and
          link to the code or upstream policy behind each claim.
        </li>
        <li>
          <strong>Keep routes wired.</strong> New pages need a sidebar link, a
          footer link where appropriate, and an entry in{" "}
          <code>app/sitemap.ts</code>.
        </li>
        <li>
          <strong>Reuse the shell.</strong> Content pages render inside{" "}
          <code>StaticPage</code>; workbench panels reuse the existing
          primitives. Do not add a page-local design system.
        </li>
      </ul>

      <h2>Pull request checklist</h2>
      <ul>
        <li>The change is scoped to one concern and links its issue.</li>
        <li>
          <code>npm run lint</code>, <code>npm run typecheck</code>,{" "}
          <code>npm test</code>, and <code>npm run build</code> pass locally.
        </li>
        <li>
          Parser, Overpass, or summary changes include tests covering the new
          behavior and the boundary that must not regress.
        </li>
        <li>
          Docs are updated when a limit, environment variable, route, or query
          behavior changes.
        </li>
        <li>
          No secrets, personal data, or provider keys appear in code, logs,
          fixtures, or screenshots.
        </li>
        <li>
          The UI still uses the monochrome tokens and reports incomplete data
          honestly.
        </li>
        <li>
          Commit subjects are imperative and scoped — for example{" "}
          <code>Add weather station asset type</code>.
        </li>
      </ul>

      <h2>Reporting bugs</h2>
      <p>
        Open an issue on{" "}
        <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          the tracker
        </a>{" "}
        with:
      </p>
      <ul>
        <li>The exact query string, copied verbatim.</li>
        <li>The observed behavior and the expected behavior.</li>
        <li>
          The error code if one is shown (<code>RATE_LIMITED</code>,{" "}
          <code>TIMEOUT</code>, <code>LOCATION_NOT_FOUND</code>, and so on — the
          full list is in the <Link href="/docs/api">API reference</Link>).
        </li>
        <li>Browser, operating system, and whether you use the public or a self-hosted instance.</li>
        <li>
          For a missing map feature: confirmation that it is absent from
          OpenStreetMap itself, not just Lighthouse.
        </li>
      </ul>
      <p>
        Security reports go through the{" "}
        <Link href="/security">private process</Link>. Abuse of the public
        instance is covered by the{" "}
        <Link href="/policy">acceptable use policy</Link>.
      </p>
    </StaticPage>
  );
}
