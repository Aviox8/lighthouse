"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary — rendered when the app itself throws. Kept
 * chrome-free on purpose: if the shell crashed, the shell can't be trusted
 * to render the chrome.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Surface the real stack to the console — error states name causes.
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-card">
        <p className="error-card-code">Runtime error</p>
        <svg
          className="error-card-mark"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M24 8l7 34H17z" />
          <path d="M24 8V4" />
          <path d="M12 10h24" />
        </svg>
        <h1 className="error-card-title">Something broke on this beacon</h1>
        <p className="error-card-body">
          An unexpected error stopped the workbench from rendering. Your data
          was not affected and nothing was stored — reload the workbench or run
          your query again.
        </p>
        <div className="error-card-actions">
          <button type="button" className="error-primary" onClick={reset}>
            Try again
          </button>
          <Link className="error-secondary" href="/">
            Back to search
          </Link>
        </div>
        <p className="error-card-foot">
          {error.digest ? (
            <>
              Error ID <code>{error.digest}</code> ·{" "}
            </>
          ) : null}
          <a
            href="https://github.com/Aviox8/lighthouse/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
