"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import SmoothButton from "@/components/smoothui/smooth-button";
import { Input } from "@/components/smoothui/input";

interface CTAProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function CTA({ onSearch, loading }: CTAProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (q) onSearch(q);
    },
    [query, onSearch],
  );

  return (
    <section className="cta">
      <div className="cta-inner">
        <div className="cta-copy">
          <h2 className="cta-title">Ready to explore?</h2>
          <p className="cta-sub">
            Search OpenStreetMap for telecom towers, data centers, power plants,
            refineries, ports, and 200+ asset types. Aggregate summaries included.
          </p>
        </div>
        <div className="cta-action">
          <form onSubmit={handleSubmit} className="cta-form">
            <div className="cta-input-wrapper">
              <Search className="cta-search-icon" size={16} strokeWidth={2} />
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
                Search
              </SmoothButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
