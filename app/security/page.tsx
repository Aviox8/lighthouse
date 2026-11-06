import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Security policy",
  description:
    "How to report a security vulnerability in Lighthouse, what is in scope, disclosure expectations, and the supported branch.",
};

export default function SecurityPage() {
  return (
    <StaticPage
      eyebrow="Project"
      title="Security policy"
      updated="November 6, 2026"
      active="/security"
    >
      <p>
        Lighthouse is a small, volunteer-maintained open-source project. There is
        no security team, no on-call rotation, no bounty, and no security@
        mailbox. There is a real attack surface — two public API routes, an
        upstream query builder, and an optional provider chain — and reports
        about it are welcome.
      </p>

      <h2>Reporting a vulnerability</h2>
      <p>
        Use GitHub&rsquo;s private vulnerability reporting on the repository:
      </p>
      <ul>
        <li>
          <a
            href="https://github.com/Aviox8/lighthouse/security/advisories/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open a private security advisory
          </a>{" "}
          — preferred. The report stays private until an advisory is published.
        </li>
        <li>
          If private reporting is unavailable, open a{" "}
          <a
            href="https://github.com/Aviox8/lighthouse/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            minimal issue
          </a>{" "}
          that says only that you have a security report and asks for a private
          channel. Do not include reproduction details, credentials, or exploit
          steps in a public issue.
        </li>
      </ul>
      <p>
        Do not test against the public instance in a way that degrades it. A
        local deployment running the same commit is the right environment for
        anything noisy.
      </p>

      <h2>What to include</h2>
      <ul>
        <li>
          The affected route, component, or library, and the commit or branch you
          tested.
        </li>
        <li>
          A minimal reproduction: request, payload, configuration, and the
          observed result.
        </li>
        <li>
          The security impact — what an attacker gains, and what preconditions
          they need.
        </li>
        <li>
          Any suggested fix or mitigation, if you have one.
        </li>
      </ul>
      <p>
        A clear, reproducible report is worth more than a scanner dump. If a
        finding depends on a specific deployment configuration, say which one.
      </p>

      <h2>Scope</h2>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>API routes</td>
            <td>
              Injection into the Overpass query builder, request smuggling,
              validation bypass, response-splitting, or error paths that leak
              server internals.
            </td>
          </tr>
          <tr>
            <td>Summary boundary</td>
            <td>
              Any way to make individual asset names, coordinates, or tags reach
              an AI provider; prompt injection that crosses the aggregate-only
              contract; quota or rate-limit bypass.
            </td>
          </tr>
          <tr>
            <td>Secrets</td>
            <td>
              Exposure of <code>OPENROUTER_API_KEY</code>, <code>EXA_API_KEY</code>,{" "}
              <code>OVERPASS_CH_KEY</code>, or other server-side configuration to
              the browser or logs.
            </td>
          </tr>
          <tr>
            <td>Client</td>
            <td>
              Cross-site scripting through rendered OSM tags or query echoes,
              unsafe URL handling, or dependency flaws with a Lighthouse-specific
              impact.
            </td>
          </tr>
          <tr>
            <td>Availability</td>
            <td>
              A single crafted request that reliably crashes the process,
              exhausts memory, or consumes provider quota without authentication.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Out of scope</h2>
      <ul>
        <li>
          Volumetric or distributed denial-of-service testing. Do not run one.
        </li>
        <li>
          Missing security headers, cookie flags, or TLS configuration with no
          demonstrated exploit.
        </li>
        <li>
          Automated scanner output with no reproduction and no impact statement.
        </li>
        <li>
          OpenStreetMap data errors — wrong or missing features belong at{" "}
          <a
            href="https://www.openstreetmap.org/fixthemap"
            target="_blank"
            rel="noopener noreferrer"
          >
            openstreetmap.org/fixthemap
          </a>
          .
        </li>
        <li>
          Vulnerabilities in upstream OSM services (Nominatim, Overpass, tile
          servers) or in third-party providers. Report those to the operator
          concerned.
        </li>
        <li>
          Misconfiguration of someone else&rsquo;s self-hosted deployment,
          including exposed keys or an unauthenticated public summary endpoint.
          The{" "}
          <Link href="/docs/operations">operations guide</Link> explains the
          intended setup.
        </li>
        <li>
          Rate limits themselves. Hitting a limit is not a vulnerability.
        </li>
      </ul>

      <h2>Disclosure and credit</h2>
      <ul>
        <li>
          This is best-effort maintenance. Reports are acknowledged and triaged
          as time allows; there is no response-time SLA.
        </li>
        <li>
          Please allow a reasonable window for a fix before publishing details.
          If a report is valid, the fix and advisory land in public on{" "}
          <code>main</code>.
        </li>
        <li>
          There is no bug bounty. Credit is given in the advisory if you want it;
          say so in the report.
        </li>
        <li>
          Good-faith research that follows this page is welcome. This page is a
          project policy, not a legal safe-harbor statement or a promise of
          non-action.
        </li>
      </ul>

      <h2>Supported versions</h2>
      <p>
        The public instance tracks <code>main</code>, and fixes are made there
        first. There are no maintained release branches and no backports. If you
        self-host, deploy from <code>main</code> or pin a commit and apply
        security fixes yourself.
      </p>

      <h2>Hardening a deployment</h2>
      <ul>
        <li>
          Keep every key server-side. Never expose one through a{" "}
          <code>NEXT_PUBLIC_*</code> variable.
        </li>
        <li>
          Put authentication and edge rate limiting in front of{" "}
          <code>/api/summary</code> before exposing it publicly — the built-in
          counters are per-instance protection, not a security boundary.
        </li>
        <li>
          Add edge rate limiting to <code>/api/search</code> for high-traffic
          deployments; the route relies on upstream throttling.
        </li>
        <li>
          Keep dependencies patched; Dependabot is configured for the
          repository.
        </li>
        <li>
          Rotate any provider key that may have been exposed, then check the
          provider&rsquo;s usage dashboard.
        </li>
      </ul>
      <p>
        Related: <Link href="/policy">Acceptable use</Link>,{" "}
        <Link href="/docs/operations">Self-hosting &amp; operations</Link>, and{" "}
        <Link href="/contributing">Contributing</Link>.
      </p>
    </StaticPage>
  );
}
