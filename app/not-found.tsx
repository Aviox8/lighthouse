import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export default function NotFound() {
  return (
    <StaticPage eyebrow="404" title="This page doesn't exist" updated="November 5, 2026">
      <p>
        The URL you followed isn&rsquo;t part of Lighthouse — it may be a broken link, a stale
        bookmark, or a mistyped path. Everything that exists is listed below.
      </p>
      <h2>Where to go</h2>
      <ul>
        <li>
          <Link href="/">Home — search infrastructure on the map</Link>
        </li>
        <li>
          <Link href="/types">Asset type catalog — what Lighthouse can search</Link>
        </li>
        <li>
          <Link href="/dev">Developer documentation and API reference</Link>
        </li>
        <li>
          <Link href="/about">About — what Lighthouse is and how to read it</Link>
        </li>
      </ul>
      <p>
        If you reached this page from inside the app, that&rsquo;s a bug — please{" "}
        <a
          href="https://github.com/Aviox8/lighthouse/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          open an issue
        </a>{" "}
        with the URL.
      </p>
    </StaticPage>
  );
}
