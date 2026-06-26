"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/categories";
import { artifactUrl, TILES_KEY } from "@/lib/downloads";

// Blob URLs aren't predictable ahead of upload, so prefer whatever the
// pipeline actually wrote into the registry; the env var only exists for
// local dev against the range server in pipeline/data/output/tiles/.
const PMTILES_URL = artifactUrl(TILES_KEY) ?? process.env.NEXT_PUBLIC_PMTILES_URL;

// Built dynamically from CATEGORY_SLUGS, so its tuple shape can't be
// statically verified against MapLibre's strict ExpressionSpecification
// type -- it's valid GL JS expression JSON at runtime regardless.
const LINE_COLOR_EXPRESSION = [
  "match",
  ["get", "category"],
  ...CATEGORY_SLUGS.flatMap((slug) => [slug, CATEGORY_COLORS[slug]]),
  "#6b7280",
] as unknown as maplibregl.ExpressionSpecification;

export function NationalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(CATEGORY_SLUGS),
  );

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: "raster",
            tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap, © CARTO",
          },
          ...(PMTILES_URL
            ? {
                pedestrian: {
                  type: "vector" as const,
                  url: `pmtiles://${PMTILES_URL}`,
                },
              }
            : {}),
        },
        layers: [
          { id: "basemap", type: "raster", source: "basemap" },
          ...(PMTILES_URL
            ? [
                {
                  id: "pedestrian-lines",
                  type: "line" as const,
                  source: "pedestrian",
                  "source-layer": "pedestrian_network",
                  paint: {
                    "line-color": LINE_COLOR_EXPRESSION,
                    "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 16, 2.5] as maplibregl.ExpressionSpecification,
                  },
                },
              ]
            : []),
        ],
      },
      center: [-96, 56],
      zoom: 3,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      maplibregl.removeProtocol("pmtiles");
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !PMTILES_URL) return;
    const filter: maplibregl.FilterSpecification = [
      "in",
      ["get", "category"],
      ["literal", Array.from(visibleCategories)],
    ];
    if (map.isStyleLoaded()) {
      map.setFilter("pedestrian-lines", filter);
    } else {
      map.once("load", () => map.setFilter("pedestrian-lines", filter));
    }
  }, [visibleCategories]);

  function toggleCategory(slug: string) {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />
      {PMTILES_URL ? (
        <div className="absolute top-3 left-3 z-10 rounded-lg bg-white/95 p-3 text-sm shadow-md dark:bg-zinc-900/95">
          <p className="mb-2 font-semibold">Categories</p>
          {CATEGORY_SLUGS.map((slug) => (
            <label key={slug} className="flex items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={visibleCategories.has(slug)}
                onChange={() => toggleCategory(slug)}
              />
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[slug] }}
              />
              {CATEGORY_LABELS[slug]}
            </label>
          ))}
        </div>
      ) : (
        <div className="absolute top-3 left-3 z-10 max-w-xs rounded-lg bg-white/95 p-3 text-sm shadow-md dark:bg-zinc-900/95">
          Map tiles haven&apos;t been published yet. Check back after the data pipeline's
          first run, or browse the{" "}
          <a href="/catalog" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            catalog
          </a>{" "}
          instead.
        </div>
      )}
    </div>
  );
}
