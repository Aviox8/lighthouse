"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import SmoothButton from "@/components/smoothui/smooth-button";
import { Input } from "@/components/smoothui/input";

interface CTAProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

/**
 * The query form used in the landing CTA band. Rendered inside the
 * `.cta-input-wrapper` slot composed by the Homepage.
 */
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
    <form onSubmit={handleSubmit} className="cta-form">
      <div className="cta-input-wrapper">
        <Search className="cta-search-icon" size={16} strokeWidth={2} />
        <Input
          className="home-cta-input"
          placeholder="e.g. cell towers in Berlin radius:40"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
          name="query-cta"
          aria-label="Search query"
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
  );
}
