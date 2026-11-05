"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import SmoothButton from "@/components/smoothui/smooth-button";
import { Input } from "@/components/smoothui/input";

const EXAMPLE_QUERIES = [
  { label: "cell towers", query: "cell towers near:Berlin radius:5000" },
  { label: "data centers", query: "data centers near:London radius:8000" },
  { label: "power plants", query: "power plants near:Tokyo radius:10000" },
  { label: "substations", query: "substations near:New York radius:6000" },
  { label: "refineries", query: "refineries near:Houston radius:7000" },
  { label: "ports", query: "ports near:Rotterdam radius:9000" },
];

const FACTS = [
  { label: "Asset types", value: "200+" },
  { label: "Data source", value: "OpenStreetMap" },
  { label: "Query language", value: "type / near / radius" },
];

export interface HomepageProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function Homepage({ onSearch, loading }: HomepageProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (q) onSearch(q);
    },
    [query, onSearch],
  );

  const handleExample = useCallback(
    (q: string) => {
      setQuery(q);
      onSearch(q);
    },
    [onSearch],
  );

  return (
    <section className="home" aria-label="Lighthouse">
      <div className="home-inner">
        <div className="home-copy">
          <div className="home-eyebrow">
            <span className="home-dot" aria-hidden="true" />
            OSM · INSTRUMENT CONSOLE
          </div>
          <h1 className="home-title">
            Map real-world infrastructure.
            <br />
            <span className="home-accent">From OpenStreetMap.</span>
          </h1>
          <p className="home-subtitle">
            Search telecom towers, data centers, power plants, refineries,
            ports, and 200+ asset types across OpenStreetMap. Aggregate
            summaries generated per search.
          </p>

          <div className="home-command">
            <form onSubmit={handleSubmit} className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={16} strokeWidth={2} />
                <Input
                  placeholder="e.g. cell towers near:Berlin radius:5000"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                />
                <SmoothButton
                  type="submit"
                  variant="solid"
                  color="accent"
                  size="sm"
                  disabled={loading}
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <circle cx="10" cy="10" r="7" />
                    <line x1="16" y1="16" x2="18" y2="18" />
                  </svg>
                  Search
                </SmoothButton>
                {loading && (
                  <div className="search-spinner" aria-hidden="true" />
                )}
              </div>
              <div className="search-kbd" aria-hidden="true">
                ⌘K
              </div>
            </form>

            <div className="home-examples">
              <span className="home-examples-label">Try:</span>
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example.query}
                  type="button"
                  className="home-chip"
                  onClick={() => handleExample(example.query)}
                  disabled={loading}
                  title={example.query}
                >
                  <code>{example.label}</code>
                </button>
              ))}
            </div>

            <p className="home-note">
              Type <code>type:power_plant near:London radius:10000</code> to
              scope by asset type, place, and radius.
            </p>
          </div>
        </div>

        <aside className="home-console" aria-label="Readout">
          <div className="home-beacon" aria-hidden="true">
            <svg
              className="home-beacon-svg"
              viewBox="0 0 440 440"
              width="100%"
              height="100%"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="homeBeaconGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle className="home-ring" cx="220" cy="220" r="210" />
              <path className="home-crosshair" d="M220 20 L220 420 M20 220 L420 220" />
              <g className="home-sweep">
                <path className="home-sweep-wedge" d="M220 220 L340 100 A120 120 0 0 1 220 100 Z" />
                <path className="home-sweep-edge" d="M220 220 L340 100 A120 120 0 0 1 220 100 Z" fill="none" />
              </g>
              <g className="home-blips" aria-hidden="true">
                <circle className="home-blip home-blip-2" cx="220" cy="220" r="46" />
                <circle className="home-blip home-blip-3" cx="220" cy="220" r="72" />
                <circle className="home-origin" cx="220" cy="220" r="6" />
              </g>
            </svg>
          </div>

          <div className="home-readout">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </div>

          <footer className="home-footer">
            <div>
              Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>
            </div>
            <div>
              <a href="https://github.com/Aviox8/lighthouse" target="_blank" rel="noopener noreferrer">Source</a>
            </div>
          </footer>
        </aside>
      </div>
    </section>
  );
}
