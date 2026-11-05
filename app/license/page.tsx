import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import CodeBlock from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "License",
  description:
    "Lighthouse is MIT-licensed open source. Read the full license text and what it means for the OpenStreetMap data underneath.",
};

const REPO_URL = "https://github.com/Aviox8/lighthouse";

export default function LicensePage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="MIT License"
      updated="November 6, 2026"
      active="/license"
    >
      <p>
        Lighthouse&rsquo;s code is released under the MIT License — free to
        use, modify, embed in commercial products, and redistribute. The text
        below is the complete license shipped in the repository&rsquo;s{" "}
        <code>LICENSE</code> file.
      </p>

      <div className="license-badges">
        <span className="license-chip">
          License: <strong>MIT</strong>
        </span>
        <a
          className="license-chip"
          href="https://opensource.org/licenses/MIT"
          target="_blank"
          rel="noopener noreferrer"
        >
          SPDX: <strong>MIT</strong> · opensource.org
        </a>
        <a
          className="license-chip"
          href={`${REPO_URL}/blob/main/LICENSE`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LICENSE on <strong>GitHub</strong>
        </a>
      </div>

      <CodeBlock title="LICENSE" lang="mit">{`MIT License

Copyright (c) 2026 Aviox8 and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}</CodeBlock>

      <h2>What that means</h2>
      <ul>
        <li>
          <strong>Use</strong> — run it privately or publicly, for anything
          including commercial purposes.
        </li>
        <li>
          <strong>Modify &amp; redistribute</strong> — forks, patches, and
          embedding are all fine; the only requirement is keeping the copyright
          and permission notice in substantial copies.
        </li>
        <li>
          <strong>No warranty</strong> — the software ships as-is; results from
          crowd-sourced data are not guaranteed to be correct or complete.
        </li>
        <li>
          <strong>No liability</strong> — the authors are not on the hook for
          anything you do with the tool or its output.
        </li>
      </ul>

      <h2>Data is a different matter</h2>
      <div className="doc-callout">
        <p>
          The MIT license covers this <em>code only</em>. The map data it
          surfaces — © OpenStreetMap contributors — carries its own license,
          the Open Database License (ODbL) trunk: attribution and share-alike
          apply to any derived database you build from it. Mapping engines are
          separate entirely. See the{" "}
          <Link href="/legal">legal notices</Link> for the full attribution
          picture.
        </p>
      </div>
      <p>
        Dependencies keep their own permissive licenses (Leaflet is
        BSD-2-Clause; Next.js, React, react-leaflet and Tailwind CSS are MIT;
        Lucide icons are ISC). Each package&rsquo;s repository is the
        authoritative source for its license text.
      </p>
    </StaticPage>
  );
}
