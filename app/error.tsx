"use client";

import Link from "next/link";

/**
 * Global error boundary. Rendered inside the root layout, so keep it free of
 * app chrome dependencies (no Leaflet, no search state) and purely static.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-page" role="alert">
      <div className="error-card">
        <svg
          className="error-card-mark"
          viewBox="0 0 64 64"
          aria-hidden="true"
          focusable="false"
        >
          <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.9">
            <line x1="32" y1="4" x2="32" y2="10" />
            <line x1="13" y1="13" x2="17.5" y2="17.5" />
            <line x1="51" y1="13" x2="46.5" y2="17.5" />
          </g>
          <path
            d="M26.5 22.5 L24.5 48 L39.5 48 L37.5 22.5 Z"
            fill="currentColor"
            opacity="0.9"
          />
          <rect
            x="25.5"
            y="14.5"
            width="13"
            height="6.5"
            rx="1.5"
            fill="var(--accent)"
            stroke="none"
          />
        </svg>
        <h1 className="error-card-title">The signal dropped.</h1>
        <p className="error-card-body">
          Something went wrong while rendering Lighthouse. Your searches and data were not
          affected — this is a client-side failure.
        </p>
        <div className="error-card-actions">
          <button type="button" className="error-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="error-secondary">
            Back to search
          </Link>
        </div>
        <p className="error-card-foot">
          Still broken?{" "}
          <a
            href="https://github.com/Aviox8/lighthouse/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report it on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
