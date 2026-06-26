import { registry, totalFeatureCount } from "@/lib/registry";
import { SourceTable } from "@/components/catalog/SourceTable";
import { GapNotice } from "@/components/catalog/GapNotice";

export const metadata = {
  title: "Catalog — Sidewalk Registry",
};

export default function CatalogPage() {
  const coveredCount = Object.values(registry.provinces).filter((p) => p.covered).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Source catalog</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        {registry.municipalities.length} municipalities across {coveredCount} of 13 provinces
        and territories, {totalFeatureCount().toLocaleString()} pedestrian infrastructure
        segments total. Sourced from the{" "}
        <a
          href="https://www150.statcan.gc.ca/n1/en/catalogue/34260004"
          className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {registry.source.name}
        </a>{" "}
        ({registry.source.collected}), under the {registry.source.license}.
      </p>

      <div className="mt-6">
        <SourceTable municipalities={registry.municipalities} />
      </div>

      <div className="mt-8">
        <GapNotice provinces={registry.provinces} />
      </div>
    </div>
  );
}
