import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lighthouse",
    template: "%s — Lighthouse",
  },
  description:
    "Map real-world infrastructure from OpenStreetMap with AI-assisted aggregate summaries.",
  applicationName: "Lighthouse",
  robots: "index, follow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lighthouse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      data-theme="dark"
    >
      <head>
        <link
          rel="preconnect"
          href="https://tile.openstreetmap.org"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
        <link
          rel="dns-prefetch"
          href="https://overpass-api.de"
        />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
