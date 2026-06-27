import { registry, municipalitiesByProvince } from "@/lib/registry";
import { nationalKey, provinceKey, municipalityKey, artifactUrl, FORMATS, TILES_KEY } from "@/lib/downloads";
import { DownloadCard } from "@/components/download/DownloadCard";

export const metadata = {
  title: "Download — Sidewalk Registry",
};

export default function DownloadPage() {
  const coveredProvinces = Object.entries(registry.provinces).filter(([, p]) => p.covered);
  const pmtilesUrl = artifactUrl(TILES_KEY);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Download</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        GeoParquet, normalized to WGS84 with a consistent schema across every municipality.
        Licensed under the {registry.source.license} -- see each municipality&apos;s
        page in the{" "}
        <a href="/catalog" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
          catalog
        </a>{" "}
        for its specific attribution requirement.
      </p>

      <section className="mt-6">
        <h2 className="font-semibold">Everything</h2>
        <div className="mt-2 space-y-2">
          <DownloadCard
            title="All of Canada"
            subtitle={`${registry.municipalities.length} municipalities, ${registry.municipalities
              .reduce((sum, m) => sum + m.feature_count, 0)
              .toLocaleString()} segments`}
            links={FORMATS.map((format) => ({ format, url: artifactUrl(nationalKey(format)) }))}
          />
          <DownloadCard
            title="Map tiles (PMTiles)"
            subtitle="For rendering, not bulk analysis"
            links={[{ format: "pmtiles", url: pmtilesUrl }]}
          />
        </div>
      </section>

      {coveredProvinces.map(([code, province]) => {
        const municipalities = municipalitiesByProvince(code);
        return (
          <section key={code} className="mt-8">
            <h2 className="font-semibold">{province.name}</h2>
            <div className="mt-2 space-y-2">
              <DownloadCard
                title={`All of ${province.name}`}
                links={FORMATS.map((format) => ({ format, url: artifactUrl(provinceKey(code, format)) }))}
              />
              {municipalities.map((m) => (
                <DownloadCard
                  key={m.municipality_slug}
                  title={m.municipality_name}
                  subtitle={`${m.feature_count.toLocaleString()} segments`}
                  links={FORMATS.map((format) => ({ format, url: artifactUrl(municipalityKey(m, format)) }))}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
