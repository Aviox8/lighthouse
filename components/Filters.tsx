"use client";

import { useCallback, useMemo, useState } from "react";
import { SlidersHorizontal, X, RefreshCw } from "lucide-react";
import {
  Checkbox,
  CheckboxTrigger,
} from "@/components/smoothui/checkbox";
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
  const [radiusValue, setRadiusValue] = useState<string>("");

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

  const handleClearFilters = useCallback(() => {
    onOperatorChange(null);
    onTypeChange(null);
  }, [onOperatorChange, onTypeChange]);

  const hasFilters = Boolean(selectedOperator || selectedType);

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
              <Checkbox
                key={type}
                checked={selectedType === type}
                onCheckedChange={(checked: boolean) => onTypeChange(checked ? type : null)}
              >
                <CheckboxTrigger className="filter-item">
                  <span className="filter-name">{type.replace(/_/g, " ")}</span>
                  <span className="filter-count">{count}</span>
                </CheckboxTrigger>
              </Checkbox>
            ))
          )}
          {hasFilters && selectedType && (
            <button
              type="button"
              className="filter-item filter-item-remove"
              onClick={() => onTypeChange(null)}
              title="Remove type filter"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
              <span>Remove</span>
            </button>
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
              <Checkbox
                key={operator}
                checked={selectedOperator === operator}
                onCheckedChange={(checked: boolean) => onOperatorChange(checked ? operator : null)}
              >
                <CheckboxTrigger className="filter-item">
                  <span className="filter-name">{operator}</span>
                  <span className="filter-count">{count}</span>
                </CheckboxTrigger>
              </Checkbox>
            ))
          )}
          {hasFilters && selectedOperator && (
            <button
              type="button"
              className="filter-item filter-item-remove"
              onClick={() => onOperatorChange(null)}
              title="Remove operator filter"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
              <span>Remove</span>
            </button>
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
                    value={radiusValue || radiusLabel}
                    onChange={(e) => setRadiusValue(e.target.value)}
                    placeholder={radiusLabel.toString()}
                  />
                  <span className="radius-unit">m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {hasFilters && (
        <div className="filters-section filters-section-clear">
          <button
            type="button"
            className="filter-item filter-item-clear"
            onClick={handleClearFilters}
          >
            <RefreshCw size={14} strokeWidth={2} className="mr-1" aria-hidden="true" />
            Clear filters
          </button>
        </div>
      )}

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
