import Link from "next/link";
import type { ReactNode } from "react";

interface StaticPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}

function LogoMark() {
  return (
    <svg
      className="static-logo-mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.9">
        <line x1="32" y1="4" x2="32" y2="10" />
        <line x1="13" y1="13" x2="17.5" y2="17.5" />
        <line x1="51" y1="13" x2="46.5" y2="17.5" />
      </g>
      <path d="M26.5 22.5 L24.5 48 L39.5 48 L37.5 22.5 Z" fill="currentColor" opacity="0.9" />
      <rect x="25.5" y="14.5" width="13" height="6.5" rx="1.5" fill="var(--accent)" stroke="none" />
    </svg>
  );
}

/**
 * Shared shell for Lighthouse's static trust pages (Terms, Privacy, Developer).
 * Reuses the same tokens and header/footer rhythm as the app — no bespoke
 * one-off components. Server component: no client JS.
 */
export default function StaticPage({
  eyebrow,
  title,
  updated,
  children,
}: StaticPageProps) {
  return (
    <div className="static-shell">
      <header className="static-header">
        <div className="static-header-inner">
          <Link href="/" className="static-logo" aria-label="Lighthouse home">
            <LogoMark />
            <span className="static-logo-text">Lighthouse</span>
          </Link>

          <nav className="static-nav" aria-label="Site">
            <Link href="/about" className="static-nav-link">About</Link>
            <Link href="/types" className="static-nav-link">Types</Link>
            <Link href="/dev" className="static-nav-link">Developer</Link>
            <Link href="/privacy" className="static-nav-link">Privacy</Link>
            <Link href="/terms" className="static-nav-link">Terms</Link>
          </nav>

          <a
            href="https://github.com/Aviox8/lighthouse"
            target="_blank"
            rel="noopener noreferrer"
            className="static-source"
          >
            Source
          </a>
        </div>
      </header>

      <main className="static-main">
        <article className="static-article">
          <p className="static-eyebrow">{eyebrow}</p>
          <h1 className="static-title">{title}</h1>
          <p className="static-updated">Last updated {updated}</p>
          <div className="static-prose">{children}</div>
        </article>
      </main>

      <footer className="static-footer">
        <div className="static-footer-inner">
          <span className="static-footer-note">
            Lighthouse — infrastructure intelligence from OpenStreetMap.
          </span>
          <nav className="static-footer-nav" aria-label="Footer">
            <Link href="/">Search</Link>
            <Link href="/about">About</Link>
            <Link href="/types">Types</Link>
            <Link href="/dev">Developer</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a
              href="https://github.com/Aviox8/lighthouse"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
