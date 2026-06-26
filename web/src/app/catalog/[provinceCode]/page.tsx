import Link from "next/link";
import { notFound } from "next/navigation";
import { registry, municipalitiesByProvince } from "@/lib/registry";

export async function generateStaticParams() {
  return Object.keys(registry.provinces).map((provinceCode) => ({ provinceCode }));
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ provinceCode: string }>;
}) {
  const { provinceCode } = await params;
  const province = registry.provinces[provinceCode];
  if (!province) notFound();

  const municipalities = municipalitiesByProvince(provinceCode);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm text-zinc-500">
        <Link href="/catalog" className="hover:underline">
          Catalog
        </Link>{" "}
        / {province.name}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{province.name}</h1>

      {!province.covered ? (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm">
            {province.gap_narrative ?? "No municipality in this province has published data yet."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-900">
          {municipalities.map((m) => (
            <li key={m.municipality_slug} className="flex items-center justify-between py-3">
              <Link
                href={`/catalog/${m.province_code}/${m.municipality_slug}`}
                className="font-medium text-blue-700 hover:underline dark:text-blue-400"
              >
                {m.municipality_name}
              </Link>
              <span className="text-sm text-zinc-500">
                {m.feature_count.toLocaleString()} segments
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
