"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import SmoothButton from "@/components/smoothui/smooth-button";
import { Input } from "@/components/smoothui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";

const EXAMPLE_QUERIES = [
  { label: "cell towers", query: "cell towers near:Berlin radius:5000" },
  { label: "data centers", query: "data centers near:London radius:8000" },
  { label: "power plants", query: "power plants near:Tokyo radius:10000" },
  { label: "substations", query: "substations near:New York radius:6000" },
  { label: "refineries", query: "refineries near:Houston radius:7000" },
  { label: "ports", query: "ports near:Rotterdam radius:9000" },
];

const FEATURES = [
  {
    title: "200+ asset types",
    body: "Telecom towers, data centers, power plants, refineries, ports, and more — queried from OpenStreetMap.",
  },
  {
    title: "Type / near / radius",
    body: "Scope searches by asset type, place, and radius with a compact query language.",
  },
  {
    title: "Aggregate summaries",
    body: "AI-generated aggregate views per search, with follow-ups and sources.",
  },
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
      <Navbar />

      <div className="home-hero">
        <div className="home-hero-inner">
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
            <div className="home-readout">
              <div>
                <dt>Asset types</dt>
                <dd>200+</dd>
              </div>
              <div>
                <dt>Data source</dt>
                <dd>OpenStreetMap</dd>
              </div>
              <div>
                <dt>Query language</dt>
                <dd>type / near / radius</dd>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section className="home-features">
        <div className="home-features-inner">
          <h2 className="home-features-title">What you can find</h2>
          <div className="home-features-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="home-feature">
                <h3 className="home-feature-title">{feature.title}</h3>
                <p className="home-feature-body">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTA />

      <Footer />
    </section>
  );
}
