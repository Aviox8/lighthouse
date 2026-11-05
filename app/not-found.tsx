import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-card">
        <p className="error-card-code">HTTP 404</p>
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
          <path d="M12 10h9" />
          <path d="M32 10h4" strokeDasharray="2 3" />
        </svg>
        <h1 className="error-card-title">This beacon is dark</h1>
        <p className="error-card-body">
          The page you asked for doesn&rsquo;t exist — it may have moved with a
          rebuild, or the link mistyped itself. The search workbench and the
          documentation are both one click away.
        </p>
        <div className="error-card-actions">
          <Link className="error-primary" href="/">
            Open the workbench
          </Link>
          <Link className="error-secondary" href="/docs">
            Read the docs
          </Link>
        </div>
        <p className="error-card-foot">
          Dead link in the wild?{" "}
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
