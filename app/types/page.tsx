import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import TypesCatalog from "@/components/TypesCatalog";

export const metadata: Metadata = {
  title: "Asset types",
  description:
    "The full, generated catalog of asset types Lighthouse can query from OpenStreetMap — every type: token, its label, and the OSM tags behind it.",
};

export default function TypesPage() {
  return (
    <StaticPage
      eyebrow="Catalog"
      title="Asset types"
      updated="November 6, 2026"
      active="/types"
    >
      <p>
        Lighthouse ships a curated map of infrastructure asset types — telecom
        towers, data centers, power plants, ports, prisons, hospitals and
        more — each resolved to OpenStreetMap tag filters. The catalog below is
        generated directly from <code>ASSET_TYPE_MAP</code> in{" "}
        <code>lib/types.ts</code>, so it is always in sync with the code.
      </p>
      <TypesCatalog />

      <h2>How a type resolves to OSM tags</h2>
      <p>
        Every key maps to one or more OpenStreetMap tag filters that the Overpass
        query is built up from. Examples from the map:
      </p>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Label</th>
            <th>OSM tags</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>type:data_center</code>
            </td>
            <td>Data Center</td>
            <td>
              <code>building=data_centre</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:power_plant</code>
            </td>
            <td>Power Plant</td>
            <td>
              <code>power=plant</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:substation</code>
            </td>
            <td>Substation</td>
            <td>
              <code>power=substation</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:wind</code>
            </td>
            <td>Wind Farm</td>
            <td>
              <code>power=generator</code> + <code>generator:source=wind</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:hospital</code>
            </td>
            <td>Hospital</td>
            <td>
              <code>amenity=hospital</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:prison</code>
            </td>
            <td>Prison</td>
            <td>
              <code>amenity=prison</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:airport</code>
            </td>
            <td>Airport</td>
            <td>
              <code>aeroway=aerodrome</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>type:refinery</code>
            </td>
            <td>Refinery</td>
            <td>
              <code>man_made=petroleum_well</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Types are case-insensitive keys, and obvious synonyms share one entry
        set (<code>datacenter</code> resolves the same way as{" "}
        <code>data_center</code>). Compose a full query by pairing the token
        with a geographic scope —{" "}
        <Link href="/docs#query-syntax">
          see the query-language reference
        </Link>
        .
      </p>

      <h2>Natural-language aliases</h2>
      <p>
        The parser also matches everyday phrases to type keys, so{" "}
        <code>cell towers in Berlin</code> and <code>type:cell_tower …</code>{" "}
        compile to the same Overpass filters. Recognized phrase families
        include:
      </p>
      <ul>
        <li>
          <code>cell towers</code> / <code>mobile towers</code> →{" "}
          <code>cell_tower</code>
        </li>
        <li>
          <code>radio towers</code> → <code>radio_tower</code>
        </li>
        <li>
          <code>broadcast towers</code> → <code>broadcast_tower</code>
        </li>
        <li>
          <code>telecom towers</code> → <code>telecom</code>
        </li>
        <li>
          <code>data centers</code> → <code>data_center</code>
        </li>
      </ul>
      <p>
        The <code>type:</code> token is always the exact form — use it when a
        phrase is ambiguous or when scripting the API.
      </p>

      <h2>Adding types to the catalog</h2>
      <p>
        A new asset type is a few lines in <code>ASSET_TYPE_MAP</code>: a key,
        a human label, and the OSM tags to filter on (from the{" "}
        <a
          href="https://wiki.openstreetmap.org/wiki/Map_Features"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap wiki
        </a>
        ). The catalog page, the parser output and the docs all inherit from
        that single source of truth. Contribution details — tests to run,
        where to open the pull request — are on the{" "}
        <Link href="/dev">developer page</Link>.
      </p>
    </StaticPage>
  );
}
