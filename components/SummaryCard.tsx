"use client";

import { useCallback } from "react";
import { AlertTriangle, RefreshCw, Link, FileText, Bot } from "lucide-react";
import ContentSkeleton from "@/components/smoothui/content-skeleton";
import SmoothButton from "@/components/smoothui/smooth-button";
import type { Summary } from "@/lib/types";

const PROVIDER_LABELS: Record<string, string> = {
  openrouter: "OpenRouter",
  ollama: "Ollama",
  exa: "Exa",
  local: "Local",
};

interface SummaryCardProps {
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onFollowup: (query: string) => void;
}

export default function SummaryCard({
  summary,
  loading,
  error,
  onRetry,
  onFollowup,
}: SummaryCardProps) {
  const handleFollowup = useCallback(
    (q: string) => {
      onFollowup(q);
    },
    [onFollowup],
  );

  if (loading && !summary) {
    return (
      <div className="summary-card summary-card-loading" aria-busy="true">
        <div className="summary-header">
          <span className="summary-title">
            <span className="summary-title-icon">
              <FileText size={14} strokeWidth={2} />
            </span>
            Aggregate summary
          </span>
          <div className="summary-badges" />
        </div>
        <ContentSkeleton loading>
          <div className="summary-headline">Generating summary…</div>
          <p className="summary-overview">
            The aggregate view is being compiled from OpenStreetMap results.
          </p>
          <ul className="summary-list">
            <li>
              <ContentSkeleton loading className="summary-skeleton-line w-[70%]" />
            </li>
            <li>
              <ContentSkeleton loading className="summary-skeleton-line w-[55%]" />
            </li>
            <li>
              <ContentSkeleton loading className="summary-skeleton-line w-[40%]" />
            </li>
          </ul>
        </ContentSkeleton>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="summary-card" role="alert">
        <div className="summary-error">
          <svg className="summary-error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <AlertTriangle size={16} strokeWidth={2} />
          </svg>
          <p>{error}</p>
          <SmoothButton
            type="button"
            variant="soft"
            color="neutral"
            size="xs"
            onClick={onRetry}
          >
            <RefreshCw size={14} strokeWidth={2} className="mr-1" />
            Retry
          </SmoothButton>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="summary-card">
      <div className="summary-header">
        <span className="summary-title">
          <span className="summary-title-icon">
            <Bot size={14} strokeWidth={2} />
          </span>
          Aggregate summary
        </span>
        <div className="summary-badges">
          <span className={`summary-badge summary-provider summary-provider-${summary.provider}`}>
            {PROVIDER_LABELS[summary.provider] || summary.provider}
          </span>
          {summary.fallback && (
            <span className="summary-badge summary-badge-warning">
              Fallback
            </span>
          )}
          {summary.cached && (
            <span className="summary-badge summary-provider-summary-provider-local">
              Cached
            </span>
          )}
        </div>
      </div>

      <h2 className="summary-headline">{summary.headline}</h2>
      <p className="summary-overview">{summary.overview}</p>

      {summary.observations.length > 0 && (
        <ul className="summary-list">
          {summary.observations.map((obs: string, _i: number) => (
            <li key={_i}>{obs}</li>
          ))}
        </ul>
      )}

      {summary.caveats.length > 0 && (
        <div className="summary-caveats">
          <span className="summary-caveats-icon" aria-hidden="true">
            <AlertTriangle size={14} strokeWidth={2} />
          </span>
          <ul>
            {summary.caveats.map((c: string, _i: number) => (
              <li key={_i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.followups.length > 0 && (
        <div className="summary-followups">
          <span className="summary-followups-label">Follow-up searches</span>
          <div className="summary-followup-list">
            {summary.followups.map((f: string, _i: number) => (
              <SmoothButton
                key={_i}
                type="button"
                variant="ghost"
                color="neutral"
                size="xs"
                className="summary-followup"
                onClick={() => handleFollowup(f)}
              >
                {f}
              </SmoothButton>
            ))}
          </div>
        </div>
      )}

      {summary.sources.length > 0 && (
        <div className="summary-sources">
          <span className="summary-sources-label">Sources</span>
          <div className="summary-source-list">
            {summary.sources.map((s: { title: string; url: string }, _i: number) => (
              <a
                key={_i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="summary-source"
              >
                <Link size={12} strokeWidth={2} className="mr-1" />
                {s.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
