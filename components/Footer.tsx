import Link from "next/link";

const SOURCE_URL = "https://github.com/Aviox8/lighthouse";

const COLUMNS: {
  label: string;
  items: { href: string; label: string; external?: boolean }[];
}[] = [
  {
    label: "Product",
    items: [
      { href: "/", label: "Workbench" },
      { href: "/types", label: "Asset types" },
    ],
  },
  {
    label: "Documentation",
    items: [
      { href: "/docs", label: "Documentation" },
      { href: "/about", label: "About the project" },
      { href: "/dev", label: "Developer" },
    ],
  },
  {
    label: "Legal",
    items: [
      { href: "/license", label: "License (MIT)" },
      { href: "/legal", label: "Legal notices" },
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
            {column.items.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ),
            )}
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
