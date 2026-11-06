import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Shared docs-shell for every content page: landing chrome (Navbar + Footer),
 * a sticky site sidebar, and the article column. Headings (h2) in the page
 * content are automatically given ids and mirrored into an
 * "On this page" table of contents.
 */

interface SiteSection {
  label: string;
  items: { href: string; label: string }[];
}

const SITE_SECTIONS: SiteSection[] = [
  {
    label: "Product",
    items: [
      { href: "/", label: "Home" },
      { href: "/types", label: "Asset types" },
    ],
  },
  {
    label: "Documentation",
    items: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/api", label: "API reference" },
      { href: "/docs/operations", label: "Self-hosting" },
    ],
  },
  {
    label: "Project",
    items: [
      { href: "/about", label: "About the project" },
      { href: "/dev", label: "Developer" },
      { href: "/contributing", label: "Contributing" },
      { href: "/security", label: "Security" },
      { href: "/license", label: "License" },
    ],
  },
  {
    label: "Legal",
    items: [
      { href: "/legal", label: "Legal notices" },
      { href: "/policy", label: "Acceptable use" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
];

/** Docs pages paginate in reading order (Mapillary-style Previous/Next). */
const DOC_SEQUENCE = [
  { href: "/docs", label: "Documentation" },
  { href: "/docs/api", label: "API reference" },
  { href: "/docs/operations", label: "Self-hosting & operations" },
];

const REPO_URL = "https://github.com/Aviox8/lighthouse";

export interface StaticPageProps {
  /** Small uppercase label above the title. */
  eyebrow: string;
  /** Page h1. */
  title: string;
  /** "Last updated" line shown under the title. */
  updated?: string;
  /** Current pathname — highlights the matching sidebar link. */
  active: string;
  /** Page body. h2 elements become TOC entries. */
  children: ReactNode;
}

interface Heading {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

function transformHeadings(
  children: ReactNode,
): { headings: Heading[]; content: ReactNode } {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();

  const mapped = Children.map(children, (child) => {
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.type === "h2"
    ) {
      const text = textOf(child.props.children).trim();
      const base = slugify(text);
      let id = base;
      let n = 2;
      while (usedIds.has(id)) {
        id = `${base}-${n}`;
        n += 1;
      }
      usedIds.add(id);
      headings.push({ id, text });
      // The predicate narrows `child` to a children-only props type, which
      // makes `cloneElement(child, { id })` an invalid Partial. Cast to a
      // writable props record — the h2's own props are preserved by
      // cloneElement's merge.
      return cloneElement(
        child as unknown as ReactElement<Record<string, unknown>>,
        { id },
      );
    }
    return child;
  });

  return { headings, content: mapped ?? children };
}

export default function StaticPage({
  eyebrow,
  title,
  updated,
  active,
  children,
}: StaticPageProps) {
  const { headings, content } = transformHeadings(children);

  const docIndex = DOC_SEQUENCE.findIndex((page) => page.href === active);
  const prevPage = docIndex > 0 ? DOC_SEQUENCE[docIndex - 1] : null;
  const nextPage =
    docIndex >= 0 && docIndex < DOC_SEQUENCE.length - 1
      ? DOC_SEQUENCE[docIndex + 1]
      : null;

  const sourcePath =
    active === "/" ? "app/page.tsx" : `app${active}/page.tsx`;

  return (
    <div className="static-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />

      <main className="static-main">
        <div className="doc-layout">
          <aside className="doc-sidebar" aria-label="Site sections">
            {SITE_SECTIONS.map((group) => (
              <nav
                className="doc-sidebar-group"
                key={group.label}
                aria-label={group.label}
              >
                <span className="doc-sidebar-label">{group.label}</span>
                <div className="doc-sidebar-list">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="doc-nav-link"
                      data-active={active === item.href ? "true" : "false"}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}

            {headings.length > 1 && (
              <nav
                className="doc-sidebar-group"
                key="toc"
                aria-label="On this page"
              >
                <span className="doc-toc-label">On this page</span>
                <div className="doc-toc-list">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="doc-toc-link"
                    >
                      {heading.text}
                    </a>
                  ))}
                </div>
              </nav>
            )}
          </aside>

          <article className="static-article static-prose" id="main-content">
            <p className="static-eyebrow">{eyebrow}</p>
            <h1 className="static-title">{title}</h1>
            {updated ? (
              <p className="static-updated">Last updated · {updated}</p>
            ) : null}
            {content}

            <footer className="doc-edit">
              <a
                href={`${REPO_URL}/blob/main/${sourcePath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit this page on GitHub
              </a>
            </footer>

            {(prevPage || nextPage) && (
              <nav className="doc-pager" aria-label="Documentation">
                {prevPage ? (
                  <Link className="doc-pager-link" href={prevPage.href}>
                    <span className="doc-pager-label">Previous</span>
                    <span className="doc-pager-title">{prevPage.label}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextPage ? (
                  <Link
                    className="doc-pager-link next"
                    href={nextPage.href}
                  >
                    <span className="doc-pager-label">Next</span>
                    <span className="doc-pager-title">{nextPage.label}</span>
                  </Link>
                ) : null}
              </nav>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
