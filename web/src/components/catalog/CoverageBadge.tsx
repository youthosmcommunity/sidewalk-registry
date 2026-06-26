export function CoverageBadge({ label, pct }: { label: string; pct: number }) {
  const percent = Math.round(pct * 100);
  const tone =
    percent >= 70 ? "bg-green-100 text-green-800" : percent >= 20 ? "bg-yellow-100 text-yellow-800" : "bg-zinc-100 text-zinc-600";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}: {percent}%
    </span>
  );
}
