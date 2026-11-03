"use client";

import type { Summary, SummaryProvider } from "@/lib/types";

interface SummaryCardProps {
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onFollowup?: (query: string) => void;
}

const PROVIDER_LABELS: Record<SummaryProvider, string> = {
  openrouter: "OpenRouter",
  ollama: "Ollama",
  exa: "Exa",
  local: "Local",
};

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

export default function SummaryCard({
  summary,
  loading,
  error,
  onRetry,
  onFollowup,
}: SummaryCardProps) {
  if (!loading && !error && !summary) {
    return null;
  }

  return (
    <section
      className={`summary-card ${loading ? "summary-card-loading" : ""}`}
      aria-live="polite"
      aria-busy={loading}
    >
      <div className="summary-header">
        <div className="summary-title">
          <span className="summary-title-icon">
            <SparkleIcon />
          </span>
          <span>Search summary</span>
        </div>

        {summary && (
          <div className="summary-badges">
            {summary.cached && <span className="summary-badge">Cached</span>}
            {summary.fallback && summary.provider !== "local" && (
              <span className="summary-badge">Fallback</span>
            )}
            {summary.degraded && (
              <span className="summary-badge summary-badge-warning">
                Limited data
              </span>
            )}
            <span
              className={`summary-badge summary-provider summary-provider-${summary.provider}`}
              title={summary.model ? `Model: ${summary.model}` : undefined}
            >
              {PROVIDER_LABELS[summary.provider]}
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="summary-skeleton" aria-label="Generating summary">
          <div className="summary-skeleton-line summary-skeleton-title" />
          <div className="summary-skeleton-line" />
          <div className="summary-skeleton-line summary-skeleton-short" />
          <div className="summary-skeleton-line summary-skeleton-short" />
        </div>
      )}

      {!loading && error && (
        <div className="summary-error">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="summary-retry" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      )}

      {!loading && !error && summary && (
        <div className="summary-body">
          <h3 className="summary-headline">{summary.headline}</h3>
          <p className="summary-overview">{summary.overview}</p>

          {summary.observations.length > 0 && (
            <ul className="summary-list">
              {summary.observations.map((observation, index) => (
                <li key={`${observation}-${index}`}>{observation}</li>
              ))}
            </ul>
          )}

          {summary.caveats.length > 0 && (
            <div className="summary-caveats">
              <span className="summary-caveats-icon">
                <WarningIcon />
              </span>
              <ul>
                {summary.caveats.map((caveat, index) => (
                  <li key={`${caveat}-${index}`}>{caveat}</li>
                ))}
              </ul>
            </div>
          )}

          {onFollowup && summary.followups.length > 0 && (
            <div className="summary-followups">
              <span className="summary-followups-label">Try next</span>
              <div className="summary-followup-list">
                {summary.followups.map((followup, index) => (
                  <button
                    key={`${followup}-${index}`}
                    type="button"
                    className="summary-followup"
                    onClick={() => onFollowup(followup)}
                  >
                    {followup}
                  </button>
                ))}
              </div>
            </div>
          )}

          {summary.sources.length > 0 && (
            <div className="summary-sources">
              <span className="summary-sources-label">Sources</span>
              <div className="summary-source-list">
                {summary.sources.slice(0, 4).map((source, index) => (
                  <a
                    key={`${source.url}-${index}`}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="summary-source"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
