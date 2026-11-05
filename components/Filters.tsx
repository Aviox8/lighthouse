"use client";

import { useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/types";

interface FiltersProps {
  searchResult: SearchResult | null;
  selectedOperator: string | null;
  selectedType: string | null;
  onOperatorChange: (operator: string | null) => void;
  onTypeChange: (type: string | null) => void;
}

export default function Filters({
  searchResult,
  selectedOperator,
  selectedType,
  onOperatorChange,
  onTypeChange,
}: FiltersProps) {
  const types = useMemo(() => {
    if (!searchResult) return [];
    return Object.entries(searchResult.stats.types).sort(([, a], [, b]) => b - a);
  }, [searchResult]);

  const operators = useMemo(() => {
    if (!searchResult) return [];
    return Object.entries(searchResult.stats.operators).sort(([, a], [, b]) => b - a);
  }, [searchResult]);

  const parsed = searchResult?.query;
  const nearLabel = parsed?.near
    ? parsed.near.replace(/_/g, " ")
    : searchResult?.results[0]?.name || "—";
  const radiusLabel = parsed?.radius || 0;

  if (!searchResult) {
    return (
      <div className="filters-panel" aria-label="Filters">
        <div className="filters-empty">
          <svg className="filters-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <SlidersHorizontal size={24} />
          </svg>
          <p>Run a search to filter results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="filters-panel" aria-label="Filters">
      <section className="filters-section">
        <div className="filters-header">
          <span className="filters-title">Asset types</span>
          <span className="filters-count">{types.reduce((s, [, c]) => s + c, 0)}</span>
        </div>
        <div className="filters-list">
          {types.length === 0 ? (
            <div className="filter-item" role="button" aria-disabled="true">
              <span className="filter-name">No types</span>
              <span className="filter-count">0</span>
            </div>
          ) : (
            types.map(([type, count]) => (
              <button
                key={type}
                type="button"
                className={cn(
                  "filter-item",
                  selectedType === type ? "active" : "",
                )}
                onClick={() => onTypeChange(selectedType === type ? null : type)}
              >
                <span className="filter-name">{type.replace(/_/g, " ")}</span>
                <span className="filter-count">{count}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="filters-section">
        <div className="filters-header">
          <span className="filters-title">Operators</span>
          <span className="filters-count">{operators.reduce((s, [, c]) => s + c, 0)}</span>
        </div>
        <div className="filters-list">
          {operators.length === 0 ? (
            <div className="filter-item" role="button" aria-disabled="true">
              <span className="filter-name">No operators</span>
              <span className="filter-count">0</span>
            </div>
          ) : (
            operators.map(([operator, count]) => (
              <button
                key={operator}
                type="button"
                className={cn(
                  "filter-item",
                  selectedOperator === operator ? "active" : "",
                )}
                onClick={() => onOperatorChange(selectedOperator === operator ? null : operator)}
              >
                <span className="filter-name">{operator}</span>
                <span className="filter-count">{count}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="filters-section">
        <div className="filters-header">
          <span className="filters-title">Radius search</span>
          <span className="filters-count">{radiusLabel} m</span>
        </div>
        <div className="filters-list">
          <div className="filter-item" style={{ cursor: "default" }}>
            <div className="query-debug">
              <div className="query-param">
                <span className="param-key">Place</span>
                <span className="param-value">{nearLabel}</span>
              </div>
              <div className="query-param radius-param">
                <span className="param-key">Radius</span>
                <div className="radius-input-wrapper">
                  <input
                    className="radius-input"
                    type="number"
                    min="0"
                    step="100"
                    value={radiusLabel}
                    readOnly
                  />
                  <span className="radius-unit">m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="filters-footer">
        <p className="filters-footer-note">
          {searchResult.stats.total} result{searchResult.stats.total !== 1 ? "s" : ""}
        </p>
        <div className="filters-footer-nav">
          <a href="https://github.com/Aviox8/lighthouse" target="_blank" rel="noopener noreferrer">Docs</a>
        </div>
      </div>
    </div>
  );
}


