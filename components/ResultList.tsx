"use client";

import { AlertTriangle, Target, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "@/lib/types";

interface ResultListProps {
  results: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filterOperator: string | null;
  filterType: string | null;
  truncated: boolean | undefined;
  loading: boolean;
  onLoadMore?: () => void;
}

export default function ResultList({
  results,
  selectedId,
  onSelect,
  filterOperator,
  filterType,
  truncated,
  loading,
  onLoadMore,
}: ResultListProps) {
  const filtered = results.filter((r) => {
    if (filterType && r.type !== filterType) return false;
    if (filterOperator && r.operator !== filterOperator) return false;
    return true;
  });

  if (loading && results.length === 0) {
    return (
      <div className="results-search-empty">
        <svg className="results-search-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <Target size={24} />
        </svg>
        <h3 className="results-search-empty-title">Searching…</h3>
        <p className="results-search-empty-hint">Results are loading from OpenStreetMap.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="results-empty">
        <svg className="results-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <MapPin size={24} />
        </svg>
        <h3 className="results-empty-title">No matching assets</h3>
        <p className="results-empty-hint">Try broadening the radius or removing type/operator filters.</p>
      </div>
    );
  }

  return (
    <div className="results-list-scroll">
      <div className="results-list-content">
        <div className="results-list">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={cn(
                "result-item",
                selectedId === asset.id ? "selected" : "",
              )}
              onClick={() => onSelect(asset.id)}
              aria-pressed={selectedId === asset.id}
            >
              <div className="result-header">
                <span className="result-name">{asset.name}</span>
                <span className="result-type">{asset.type}</span>
              </div>
              {asset.operator && (
                <div className="result-operator">
                  <span className="result-operator-chip">{asset.operator}</span>
                </div>
              )}
              <div className="result-coords">
                {asset.lat.toFixed(4)}
                <span className="separator">,&nbsp;</span>
                {asset.lon.toFixed(4)}
              </div>
              <div className="result-tags">
                {Object.entries(asset.tags).slice(0, 4).map(([key, value]) => (
                  <span key={key} className="tag">
                    <span className="tag-key">{key}</span>
                    <span className="tag-value">{value}</span>
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {truncated && !onLoadMore && (
          <div className="results-warning" role="note">
            <AlertTriangle
              className="results-warning-icon"
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>
              Results are capped at 5,000 features — this list may be
              incomplete. Narrow the query (smaller radius, tighter type or
              operator) for full coverage.
            </span>
          </div>
        )}

        {truncated && onLoadMore && (
          <button
            type="button"
            className="results-load-more"
            disabled={loading}
            onClick={onLoadMore}
          >
            Show more results
          </button>
        )}
      </div>
    </div>
  );
}
