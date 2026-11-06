import Link from "next/link";

const SOURCE_URL = "https://github.com/Aviox8/lighthouse";

const COLUMNS: {
  label: string;
  items: { href: string; label: string }[];
}[] = [
  {
    label: "Product",
    items: [
      { href: "/workbench", label: "Workbench" },
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
      { href: "/about", label: "About" },
      { href: "/dev", label: "Developer" },
      { href: "/contributing", label: "Contributing" },
      { href: "/security", label: "Security" },
      { href: "/license", label: "License (MIT)" },
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

/** Site-wide footer: brand, link columns, source + data attribution row. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <span className="footer-brand-mark" aria-hidden="true">
              L
            </span>
            <span className="footer-brand-text">Lighthouse</span>
          </div>
          <p className="footer-brand-note">
            An open-source instrument for OpenStreetMap infrastructure data.
            Source on{" "}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            , MIT licensed.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div className="footer-col" key={column.label}>
            <span className="footer-col-label">{column.label}</span>
            {column.items.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="footer-meta">
          <div className="footer-copy">
            Data ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap contributors
            </a>{" "}
            (ODbL) · Geocoding by{" "}
            <a
              href="https://nominatim.openstreetmap.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nominatim
            </a>
          </div>
          <div className="footer-links">
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">
              Source
            </a>
            <a
              href={`${SOURCE_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Issues
            </a>
            <a href="/license">MIT</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
