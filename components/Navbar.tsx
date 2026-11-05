"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SmoothButton from "@/components/smoothui/smooth-button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "https://github.com/Aviox8/lighthouse", label: "Source" },
];

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-mark">L</span>
          <span className="navbar-logo-text">Lighthouse</span>
        </Link>
        <div className="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="navbar-link"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
            <a href="https://github.com/Aviox8/lighthouse" target="_blank" rel="noopener noreferrer">
              View source <ChevronRight size={14} strokeWidth={2} />
            </a>
          </SmoothButton>
        </div>
      </div>
    </nav>
  );
}
