import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Card, Chip, Kbd, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import GithubIcon from "@/components/GithubIcon";

export const metadata: Metadata = {
  title: "Physical infrastructure search",
  description:
    "Search OpenStreetMap for telecom towers, data centers, power plants, ports and 230+ infrastructure types — by place, operator, or radius. Open source, no account.",
};

const SOURCE_URL = "https://github.com/Aviox8/lighthouse";

/** Example queries must match the real grammar — radius is in kilometres. */
const EXAMPLE_QUERIES = [
  { label: "cell towers in Berlin", query: "cell towers in Berlin radius:40" },
  {
    label: "data centers near London",
    query: "data centers near:London radius:60",
  },
  {
    label: "wind farms near Copenhagen",
    query: "wind farms near Copenhagen radius:120",
  },
  { label: "substations in New York", query: "type:substation in New York radius:80" },
  { label: "ports near Rotterdam", query: "type:port near:Rotterdam radius:70" },
  { label: "hospitals in Mumbai", query: "type:hospital in mumbai" },
];

const PREVIEW_RESULTS = [
  { name: "Wind farm", meta: "12 turbines · operational", distance: "0.8 km" },
  { name: "Wind turbine", meta: "generator: wind", distance: "1.4 km" },
  { name: "Wind farm", meta: "offshore · 24 turbines", distance: "6.2 km" },
  { name: "Wind turbine", meta: "generator: wind", distance: "9.7 km" },
];

const QUERY_TOKENS = [
  { token: "type:", meaning: "Asset type", example: "type:data_center" },
  { token: "operator:", meaning: "Operator / owner", example: "operator:google" },
  { token: "region:", meaning: "State / region", example: "region:bavaria" },
  { token: "country:", meaning: "Country", example: "country:france" },
  { token: "near:", meaning: "Proximity anchor", example: "near:copenhagen" },
  { token: "radius:", meaning: "Radius in km", example: "radius:80" },
];

const PARSED_EXAMPLES = [
  {
    input: "wind farms near Copenhagen radius:120",
    output: "type:wind near:copenhagen radius:120",
  },
  {
    input: "telecom towers in Karnataka",
    output: "type:telecom region:karnataka",
  },
  {
    input: "data centers operator:google",
    output: "type:data_center operator:google",
  },
];

const CAPABILITIES = [
  {
    index: "01 / Catalog",
    title: "230+ asset types",
    body: "Telecom, energy, transport, utilities, public safety and more — mapped to OpenStreetMap tags across 30+ categories.",
    href: "/types",
    link: "Browse the catalog",
  },
  {
    index: "02 / Query",
    title: "Natural language or exact tokens",
    body: "Ask in plain language or use tokens for type, operator, region, country, proximity and radius. Radius is in kilometres.",
    href: "/docs",
    link: "Read the query grammar",
  },
  {
    index: "03 / Workbench",
    title: "Maps, lists, and aggregate summaries",
    body: "Results are plotted with Leaflet, filterable by type and operator, and capped at 5,000 features per search. Marker popups can carry a Mapillary street-level preview when the deployment has an imagery token.",
    href: "/docs/api",
    link: "See the HTTP reference",
  },
];

const SOURCE_ITEMS = [
  {
    label: "OpenStreetMap",
    href: "https://www.openstreetmap.org/copyright",
  },
  { label: "Overpass API", href: "https://wiki.openstreetmap.org/wiki/Overpass_API" },
  { label: "Nominatim", href: "https://nominatim.openstreetmap.org/" },
  { label: "Leaflet", href: "https://leafletjs.com/" },
  { label: "Mapillary", href: "https://www.mapillary.com/" },
  { label: "MIT license", href: "/license" },
];

const OSS_FACTS = [
  { label: "License", value: "MIT" },
  { label: "Accounts", value: "None" },
  { label: "Search cap", value: "5,000 features" },
  { label: "Summaries", value: "Aggregate counts only" },
];

export default function Page() {
  return (
    <div className="home" aria-label="Lighthouse">
      <Navbar />

      <header className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-inner">
          <div className="home-hero-meta">
            <Chip className="home-status" size="sm" variant="soft">
              Open source · MIT
            </Chip>
            <Typography className="home-kicker" type="body-xs">
              OpenStreetMap infrastructure search
            </Typography>
          </div>

          <Typography className="home-title" id="home-title" type="h1">
            Search the world&rsquo;s physical infrastructure.
          </Typography>
          <Typography className="home-subtitle" type="body">
            Search OpenStreetMap for telecom towers, data centers, power
            plants, ports and 230+ other asset types — by place, operator, or
            radius. Results open as a map, a list, and an aggregate summary,
            with optional street-level imagery on the map.
          </Typography>

          <div className="home-search-block">
            <SearchBar
              kbdHint
              navigateTo="/workbench"
              placeholder="e.g. cell towers in Berlin radius:40"
              shortcut
            />
            <p className="home-search-hint">
              <span>Press</span>
              <Kbd className="home-hint-kbd">
                <Kbd.Content>/</Kbd.Content>
              </Kbd>
              <span>or</span>
              <Kbd className="home-hint-kbd">
                <Kbd.Abbr keyValue="command" />
                <Kbd.Content>K</Kbd.Content>
              </Kbd>
              <span>to focus · 230+ asset types</span>
            </p>
          </div>

          <div className="home-examples" aria-label="Example searches">
            <span className="home-examples-label">Try</span>
            {EXAMPLE_QUERIES.map((example) => (
              <Link
                aria-label={`Search for ${example.query}`}
                className="home-example"
                href={`/workbench?q=${encodeURIComponent(example.query)}`}
                key={example.query}
                title={example.query}
              >
                {example.label}
              </Link>
            ))}
          </div>

          <div className="home-handoff">
            <Link href="/docs">
              Read the docs
              <span className="home-handoff-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link href="/types">
              Browse 230+ asset types
              <span className="home-handoff-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <a href={SOURCE_URL} rel="noopener noreferrer" target="_blank">
              Source &amp; issues
              <span className="home-handoff-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className="home-source-strip" aria-label="Data sources and license">
        <div className="home-source-inner">
          <span className="home-source-label">Built on open data</span>
          {SOURCE_ITEMS.map((item) => (
            <a
              className="home-source-link"
              href={item.href}
              key={item.label}
              rel="noopener noreferrer"
              target={item.href.startsWith("http") ? "_blank" : undefined}
            >
              {item.label}
            </a>
          ))}
          <span className="home-source-license">MIT · No accounts</span>
        </div>
      </div>

      <section className="home-preview-section" aria-labelledby="preview-title">
        <div className="home-preview-head">
          <div>
            <Typography className="home-kicker" type="body-xs">
              The workbench
            </Typography>
            <Typography className="home-display" id="preview-title" type="h2">
              Every result, on the map.
            </Typography>
          </div>
          <Typography className="home-lede" type="body-sm">
            A search opens a map, a filterable result list, and an optional
            aggregate summary. Zoom into a feature, switch type or operator
            filters, and change the radius without retyping the query.
          </Typography>
        </div>

        <div className="home-preview" aria-label="Illustrative workbench view">
          <div className="home-preview-bar">
            <div className="home-preview-query">
              <Search aria-hidden="true" strokeWidth={2} />
              <code>wind farms near Copenhagen radius:120</code>
            </div>
            <div className="home-preview-meta">
              <Chip className="home-status home-status--quiet" size="sm" variant="soft">
                Example view
              </Chip>
              <span>
                <strong>1,284</strong> features
              </span>
            </div>
          </div>

          <div className="home-preview-body">
            <div className="home-preview-results">
              <div className="home-preview-results-head">
                <span>Results</span>
                <span>4 of 1,284</span>
              </div>
              <ul className="home-preview-list">
                {PREVIEW_RESULTS.map((result) => (
                  <li className="home-preview-item" key={`${result.name}-${result.distance}`}>
                    <span className="home-preview-dot" aria-hidden="true" />
                    <div className="home-preview-item-main">
                      <p className="home-preview-item-title">{result.name}</p>
                      <p className="home-preview-item-sub">{result.meta}</p>
                    </div>
                    <span className="home-preview-distance">{result.distance}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="home-preview-map" aria-hidden="true">
              <svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 760 420">
                <defs>
                  <pattern
                    height="48"
                    id="lighthouse-preview-grid"
                    patternUnits="userSpaceOnUse"
                    width="48"
                  >
                    <path
                      d="M48 0H0V48"
                      fill="none"
                      stroke="var(--grid-faint)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect fill="url(#lighthouse-preview-grid)" height="420" width="760" />
                <g fill="none" stroke="var(--grid-line)" strokeWidth="1.5">
                  <path d="M-40 320 C 120 280 210 300 330 250 S 560 180 800 210" />
                  <path d="M100 -20 C 140 90 190 160 250 440" />
                  <path d="M480 -20 C 500 110 540 210 590 440" />
                  <path d="M-20 110 C 160 100 270 140 400 100 S 640 60 780 90" />
                </g>
                <path
                  d="M300 -20 C 320 80 360 140 420 200 S 500 300 520 440"
                  fill="none"
                  stroke="var(--grid-road)"
                  strokeWidth="12"
                />
                <g fill="none" stroke="var(--grid-dot)" strokeWidth="1">
                  <circle cx="360" cy="210" r="12" />
                  <circle cx="452" cy="282" r="9" />
                  <circle cx="286" cy="150" r="8" />
                  <circle cx="540" cy="176" r="7" />
                </g>
                <g fill="var(--text-primary)">
                  <circle cx="360" cy="210" r="4" />
                  <circle cx="452" cy="282" r="3" />
                  <circle cx="286" cy="150" r="3" />
                  <circle cx="540" cy="176" r="2.5" />
                </g>
              </svg>
              <span className="home-preview-map-badge">Leaflet · OSM</span>
              <span className="home-preview-map-caption">
                55.6761° N · 12.5683° E
              </span>
            </div>
          </div>

          <div className="home-preview-foot">
            <span>Map · Leaflet</span>
            <span>Data · OpenStreetMap</span>
            <span>Street level · Mapillary</span>
            <span>Summary · aggregate counts only</span>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="capabilities-title">
        <div className="home-section-inner">
          <div className="home-section-head">
            <div>
              <Typography className="home-kicker" type="body-xs">
                Capabilities
              </Typography>
              <Typography className="home-display" id="capabilities-title" type="h2">
                The map is the database.
              </Typography>
            </div>
            <Typography className="home-lede" type="body-sm">
              No dashboard to configure, no proprietary data layer. Ask one
              question with a place in it and read the physical infrastructure
              recorded there.
            </Typography>
          </div>

          <div className="home-cap-grid">
            {CAPABILITIES.map((capability) => (
              <Card className="home-cap-card" key={capability.title} variant="transparent">
                <Card.Header>
                  <span className="home-cap-index">{capability.index}</span>
                  <Card.Title>{capability.title}</Card.Title>
                  <Card.Description>{capability.body}</Card.Description>
                </Card.Header>
                <Card.Footer>
                  <Link className="home-cap-link" href={capability.href}>
                    {capability.link}
                    <span aria-hidden="true">→</span>
                  </Link>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--alt" aria-labelledby="grammar-title">
        <div className="home-section-inner home-query-grid">
          <div className="home-query-copy">
            <Typography className="home-kicker" type="body-xs">
              Query language
            </Typography>
            <Typography className="home-display" id="grammar-title" type="h2">
              Plain language in. Exact queries out.
            </Typography>
            <Typography className="home-lede" type="body-sm">
              Every query resolves to the same plan: an asset type or operator,
              plus a geographic scope. Use tokens when you need precision.
            </Typography>

            <table className="landing-table">
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Meaning</th>
                  <th scope="col">Example</th>
                </tr>
              </thead>
              <tbody>
                {QUERY_TOKENS.map((token) => (
                  <tr key={token.token}>
                    <td>
                      <code>{token.token}</code>
                    </td>
                    <td>{token.meaning}</td>
                    <td>
                      <code>{token.example}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Link className="home-text-link" href="/docs">
              Read the full grammar
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-query-panel">
            <div className="home-query-panel-head">
              <span>Parser</span>
              <span>Natural → structured</span>
            </div>
            {PARSED_EXAMPLES.map((example) => (
              <div className="home-query-example" key={example.input}>
                <code className="home-query-input">{example.input}</code>
                <span className="home-query-arrow" aria-hidden="true">
                  ↓
                </span>
                <code className="home-query-output">{example.output}</code>
              </div>
            ))}
            <p className="home-query-note">
              Both forms hit the same parser. Structured tokens can be combined
              in any order; radius is always in kilometres.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="oss-title">
        <div className="home-section-inner">
          <div className="home-oss">
            <div>
              <Typography className="home-kicker" type="body-xs">
                Open source
              </Typography>
              <Typography className="home-display" id="oss-title" type="h2">
                Public code. Public data.
              </Typography>
              <Typography className="home-lede" type="body-sm">
                Lighthouse is MIT-licensed and built on open map data. Run the
                public instance, self-host the Next.js app, or add an asset
                type. No accounts, no proprietary map API, no hidden data
                source.
              </Typography>
              <div className="home-oss-actions">
                <Link
                  className={buttonVariants({ size: "md", variant: "primary" })}
                  href="/docs/operations"
                >
                  Self-host Lighthouse
                  <ArrowUpRight aria-hidden="true" size={15} strokeWidth={2} />
                </Link>
                <a
                  className={buttonVariants({ size: "md", variant: "secondary" })}
                  href={SOURCE_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <GithubIcon className="home-oss-github" />
                  View source
                </a>
              </div>
            </div>

            <dl className="home-oss-facts">
              {OSS_FACTS.map((fact) => (
                <div className="home-oss-fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="cta-title">
        <div className="home-cta-inner">
          <Typography className="home-kicker" type="body-xs">
            Start here
          </Typography>
          <Typography className="home-cta-title" id="cta-title" type="h2">
            Point it at a place.
          </Typography>
          <p className="home-cta-sub">
            One query opens the workbench with the map, a filterable result
            list, and an optional aggregate summary.
          </p>
          <SearchBar
            navigateTo="/workbench"
            placeholder="e.g. wind farms near Copenhagen radius:120"
            variant="cta"
          />
          <p className="home-cta-foot">
            230+ asset types · results capped at 5,000 features
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
