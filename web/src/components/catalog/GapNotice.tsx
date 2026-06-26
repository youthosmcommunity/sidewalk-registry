import type { ProvinceEntry } from "@/lib/types";

export function GapNotice({ provinces }: { provinces: Record<string, ProvinceEntry> }) {
  const gaps = Object.entries(provinces).filter(([, p]) => !p.covered);
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 font-semibold">Not yet covered</p>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        These provinces and territories have no published pedestrian infrastructure data in
        StatCan&apos;s harvest. That doesn&apos;t mean the data doesn&apos;t exist — it means
        nobody has confirmed it publicly yet.
      </p>
      <ul className="space-y-2">
        {gaps.map(([code, p]) => (
          <li key={code} className="text-sm">
            <span className="font-medium">{p.name}</span>
            {p.gap_narrative ? (
              <span className="text-zinc-600 dark:text-zinc-400"> — {p.gap_narrative}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
