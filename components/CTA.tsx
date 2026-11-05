"use client";

import { Search } from "lucide-react";
import SmoothButton from "@/components/smoothui/smooth-button";
import { Input } from "@/components/smoothui/input";

export default function CTA() {
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
          <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
            <div className="cta-input-wrapper">
              <Search className="cta-search-icon" size={16} strokeWidth={2} />
              <Input
                placeholder="e.g. cell towers near:Berlin radius:5000"
                autoComplete="off"
                spellCheck={false}
              />
              <SmoothButton
                type="submit"
                variant="solid"
                color="accent"
                size="sm"
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
