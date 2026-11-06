import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const LAST_MODIFIED = new Date("2026-11-06");

const ROUTES = [
  "",
  "/types",
  "/docs",
  "/docs/api",
  "/docs/operations",
  "/about",
  "/dev",
  "/contributing",
  "/security",
  "/license",
  "/legal",
  "/policy",
  "/terms",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: LAST_MODIFIED,
  }));
}
