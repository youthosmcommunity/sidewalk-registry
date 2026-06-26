import Link from "next/link";
import { notFound } from "next/navigation";
import { registry, findMunicipality } from "@/lib/registry";
import { municipalityKey, artifactUrl, FORMATS } from "@/lib/downloads";
import { DownloadCard } from "@/components/download/DownloadCard";

export async function generateStaticParams() {
  return registry.municipalities.map((m) => ({
    provinceCode: m.province_code,
    municipalitySlug: m.municipality_slug,
  }));
}

export default async function MunicipalityPage({
  params,
}: {
  params: Promise<{ provinceCode: string; municipalitySlug: string }>;
}) {
  const { provinceCode, municipalitySlug } = await params;
  const m = findMunicipality(provinceCode, municipalitySlug);
  if (!m) notFound();

  const province = registry.provinces[provinceCode];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm text-zinc-500">
        <Link href="/catalog" className="hover:underline">
          Catalog
        </Link>{" "}
        /{" "}
        <Link href={`/catalog/${provinceCode}`} className="hover:underline">
          {province?.name ?? provinceCode}
        </Link>{" "}
        / {m.municipality_name}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{m.municipality_name}</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        {m.feature_count.toLocaleString()} segments · census subdivision {m.csd_uid}
      </p>

      <section className="mt-6">
        <h2 className="font-semibold">By category</h2>
        <ul className="mt-2 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
          {Object.entries(m.category_counts)
            .sort((a, b) => b[1] - a[1])
            .map(([label, count]) => (
              <li key={label} className="text-zinc-700 dark:text-zinc-300">
                {label}: {count.toLocaleString()}
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Download</h2>
        <div className="mt-2">
          <DownloadCard
            title={m.municipality_name}
            links={FORMATS.map((format) => ({
              format,
              url: artifactUrl(municipalityKey(m, format)),
            }))}
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Original sources</h2>
        {m.sources.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No individual source record for this segment set (likely a small boundary artifact
            from StatCan&apos;s harmonization).
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {m.sources.map((s) => (
              <li key={s.file_name} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p>{s.attribution_statement}</p>
                <p className="mt-1 text-zinc-500">
                  {s.source_url ? (
                    <a href={s.source_url} className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
                      Source
                    </a>
                  ) : null}
                  {s.licence_url ? (
                    <>
                      {" · "}
                      <a href={s.licence_url} className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
                        Licence
                      </a>
                    </>
                  ) : null}
                  {s.last_update ? ` · Last updated ${s.last_update}` : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
