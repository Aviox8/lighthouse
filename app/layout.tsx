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
    "Search OpenStreetMap infrastructure by place, type, or operator. 230+ asset types, an interactive map, and aggregate summaries. Open source, no account.",
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("lighthouse-theme");var d=t!=="light";document.documentElement.dataset.theme=d?"dark":"light";document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
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
      <body className="bg-background text-foreground" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
