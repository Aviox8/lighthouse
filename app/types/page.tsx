import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import TypesCatalog from "@/components/TypesCatalog";

export const metadata: Metadata = {
  title: "Asset Types",
  description:
    "Browse every asset type Lighthouse can search, from power plants to surveillance cameras. Filter the catalog and copy type: tokens for structured queries.",
};

export default function TypesPage() {
  return (
    <StaticPage eyebrow="Catalog" title="Asset types" updated="November 5, 2026">
      <p>
        Lighthouse searches 230+ asset types mapped onto OpenStreetMap tag filters, across
        energy, telecom, transport, government, healthcare, services and more. Click any type to
        copy its <code>type:</code> token, then add a scope — <code>type:wind near:copenhagen</code>{" "}
        or <code>type:hospital region:karnataka</code>.
      </p>
      <TypesCatalog />
    </StaticPage>
  );
}
