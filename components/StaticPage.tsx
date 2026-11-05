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
 * Shared docs-shell for every static page: landing chrome (Navbar + Footer),
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
      { href: "/about", label: "About the project" },
    ],
  },
  {
    label: "Project",
    items: [
      { href: "/dev", label: "Developer" },
      { href: "/license", label: "License" },
    ],
  },
  {
    label: "Legal",
    items: [
      { href: "/legal", label: "Legal notices" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
];

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
      return cloneElement(child, { id });
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
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
