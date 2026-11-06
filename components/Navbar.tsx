"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import GithubIcon from "@/components/GithubIcon";

const SOURCE_URL = "https://github.com/Aviox8/lighthouse";

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/api", label: "API" },
  { href: "/types", label: "Types" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/docs") {
    return pathname === "/docs" || pathname === "/docs/operations";
  }
  return pathname === href;
}

/** Site navigation: wordmark, product links, GitHub CTA, mobile drawer. */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="navbar-mark" aria-hidden="true">
            L
          </span>
          <span className="navbar-wordmark">Lighthouse</span>
          <span className="navbar-badge" aria-hidden="true">
            OSM
          </span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="navbar-link"
              data-active={isActive(pathname, link.href) ? "true" : "false"}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <a
            className={`${buttonVariants({ variant: "primary", size: "sm" })} navbar-github`}
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="navbar-github-icon" />
            GitHub
            <ArrowUpRight aria-hidden="true" size={13} strokeWidth={2} />
          </a>
        </div>

        <Button
          aria-controls="site-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="navbar-menu-button"
          isIconOnly
          onPress={() => setMenuOpen((open) => !open)}
          size="sm"
          variant="secondary"
        >
          {menuOpen ? (
            <X aria-hidden="true" size={18} strokeWidth={2} />
          ) : (
            <Menu aria-hidden="true" size={18} strokeWidth={2} />
          )}
        </Button>
      </div>

      <div
        className="navbar-drawer"
        data-open={menuOpen ? "true" : "false"}
        id="site-navigation"
      >
        {NAV_LINKS.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className="navbar-drawer-link"
            data-active={isActive(pathname, link.href) ? "true" : "false"}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </Link>
        ))}
        <a
          className={`${buttonVariants({ variant: "primary", size: "md" })} navbar-drawer-github`}
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          <GithubIcon className="navbar-github-icon" />
          View source on GitHub
          <ArrowUpRight aria-hidden="true" size={14} strokeWidth={2} />
        </a>
      </div>
    </nav>
  );
}
