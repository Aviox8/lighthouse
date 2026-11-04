import type { MetadataRoute } from "next";

const base =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/types", "/dev", "/privacy", "/terms"];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-11-05"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
