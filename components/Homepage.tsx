"use client";

import SearchBar from "@/components/SearchBar";
import { EXAMPLE_QUERIES } from "@/lib/search-index";
import { ASSET_TYPE_MAP } from "@/lib/types";

interface HomepageProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

const ASSET_TYPES = Object.keys(ASSET_TYPE_MAP).length;

export default function Homepage({ onSearch, loading }: HomepageProps) {
  const handleSearch = (q: string) => {
    onSearch(q);
  };

  return (
    <main className="home">
      <div className="home-inner">
        <section className="home-copy">
          <p className="home-eyebrow">
            <span className="home-dot" aria-hidden="true" />
            OpenStreetMap · Natural language · Live
          </p>

          <h1 className="home-title">
            Describe the infrastructure.
            <br />
            <span className="home-accent">See it on the map.</span>
          </h1>

          <p className="home-subtitle">
            Lighthouse turns plain-language and structured queries into up to
            5,000 live OpenStreetMap features — and summarizes only the
            aggregate picture, never individual records.
          </p>

          <div className="home-command">
            <SearchBar onSearch={handleSearch} loading={loading} initialQuery="" />
          </div>

          <div className="home-examples">
            <span className="home-examples-label">TRY</span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                className="home-chip"
                onClick={() => handleSearch(q)}
                disabled={loading}
              >
                <code>{q}</code>
              </button>
            ))}
          </div>

          <p className="home-note">
            <kbd>/</kbd> to focus search · <code>type:airport</code> · <code>near:london</code> · <code>within:10km</code> · <code>operator:united</code>
          </p>
        </section>

        <figure className="home-console" role="img" aria-label="Beacon radar with live OpenStreetMap readout">
          <svg className="home-beacon" viewBox="0 0 440 440" role="presentation">
            <circle cx="220" cy="220" r="200" className="home-ring" />
            <circle cx="220" cy="220" r="150" className="home-ring" />
            <circle cx="220" cy="220" r="100" className="home-ring" />
            <circle cx="220" cy="220" r="50" className="home-ring" />
            <line x1="20" y1="220" x2="420" y2="220" className="home-crosshair" />
            <line x1="220" y1="20" x2="220" y2="420" className="home-crosshair" />
            <g className="home-sweep">
              <path d="M220 220 L220 20 A200 200 0 0 1 372 116 Z" className="home-sweep-wedge" />
              <line x1="220" y1="220" x2="220" y2="20" className="home-sweep-edge" />
            </g>
            <circle cx="150" cy="150" r="4.5" className="home-blip home-blip-1" />
            <circle cx="290" cy="180" r="4.5" className="home-blip home-blip-2" />
            <circle cx="250" cy="300" r="4.5" className="home-blip home-blip-3" />
            <circle cx="220" cy="220" r="5" className="home-origin" />
          </svg>

          <dl className="home-readout">
            <div>
              <dt>asset types</dt>
              <dd>{ASSET_TYPES}</dd>
            </div>
            <div>
              <dt>feature cap</dt>
              <dd>5,000</dd>
            </div>
            <div>
              <dt>source</dt>
              <dd>OSM / Overpass</dd>
            </div>
          </dl>
        </figure>
      </div>

      <footer className="home-footer">
        <span>OpenStreetMap data © contributors · Map data under ODbL</span>
        <span>MIT · Based on Sightline by ni5arga</span>
      </footer>
    </main>
  );
}
