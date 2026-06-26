"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MunicipalityEntry } from "@/lib/types";
import { CoverageBadge } from "./CoverageBadge";

type SortKey = "municipality_name" | "feature_count" | "pct_has_width" | "pct_has_surface";

export function SourceTable({ municipalities }: { municipalities: MunicipalityEntry[] }) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("feature_count");
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    const filtered = municipalities.filter((m) =>
      `${m.municipality_name} ${m.province_code}`.toLowerCase().includes(filter.toLowerCase()),
    );
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDesc ? -cmp : cmp;
    });
    return sorted;
  }, [municipalities, filter, sortKey, sortDesc]);

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Filter by municipality or province code..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3 w-full max-w-sm rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <Th onClick={() => sortBy("municipality_name")}>Municipality</Th>
              <th className="px-3 py-2">Province</th>
              <Th onClick={() => sortBy("feature_count")}>Segments</Th>
              <Th onClick={() => sortBy("pct_has_width")}>Width data</Th>
              <Th onClick={() => sortBy("pct_has_surface")}>Surface data</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr
                key={`${m.province_code}/${m.municipality_slug}`}
                className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/catalog/${m.province_code}/${m.municipality_slug}`}
                    className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                  >
                    {m.municipality_name}
                  </Link>
                </td>
                <td className="px-3 py-2 uppercase text-zinc-500">{m.province_code}</td>
                <td className="px-3 py-2">{m.feature_count.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <CoverageBadge label="" pct={m.pct_has_width} />
                </td>
                <td className="px-3 py-2">
                  <CoverageBadge label="" pct={m.pct_has_surface} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <th className="cursor-pointer px-3 py-2 select-none hover:text-blue-700" onClick={onClick}>
      {children}
    </th>
  );
}
