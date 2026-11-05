"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import SmoothButton from "@/components/smoothui/smooth-button";

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/types", label: "Types" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-mark" aria-hidden="true">
            L
          </span>
          <span className="navbar-logo-text">Lighthouse</span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="navbar-link"
              data-active={pathname === link.href ? "true" : "false"}
            >
              {link.label}
            </Link>
          ))}
          <SmoothButton
            variant="solid"
            color="accent"
            size="sm"
            asChild
          >
            <a
              href="https://github.com/Aviox8/lighthouse"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source{" "}
              <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
          </SmoothButton>
        </div>

        <button
          type="button"
          className="navbar-mobile-toggle"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={20} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Menu size={20} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="navbar-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/Aviox8/lighthouse"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            View source
          </a>
        </div>
      )}
    </nav>
  );
}
