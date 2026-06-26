const FORMAT_LABELS: Record<string, string> = {
  parquet: "GeoParquet",
  fgb: "FlatGeobuf",
  pmtiles: "PMTiles",
};

export function DownloadCard({
  title,
  subtitle,
  links,
}: {
  title: string;
  subtitle?: string;
  links: { format: string; url: string | undefined }[];
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <p className="font-medium">{title}</p>
        {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      <div className="flex gap-2">
        {links.map(({ format, url }) =>
          url ? (
            <a
              key={format}
              href={url}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {FORMAT_LABELS[format] ?? format}
            </a>
          ) : (
            <span
              key={format}
              title="Not yet uploaded -- the production data pipeline hasn't run with Blob storage configured."
              className="cursor-not-allowed rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
            >
              {FORMAT_LABELS[format] ?? format}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
