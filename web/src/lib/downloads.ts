import { registry } from "./registry";
import type { MunicipalityEntry } from "./types";

// Mirrors the artifact key naming in pipeline/src/sidewalk_pipeline/cli.py's
// run_all() -- these are the keys registry.artifact_urls is populated with
// once a real pipeline run uploads to Vercel Blob.
export const FORMATS = ["parquet", "fgb"] as const;

export function nationalKey(format: string): string {
  return `downloads/national.${format}`;
}

export function provinceKey(provinceCode: string, format: string): string {
  return `downloads/provinces/${provinceCode}.${format}`;
}

export function municipalityKey(m: MunicipalityEntry, format: string): string {
  return `downloads/municipalities/${m.province_code}/${m.municipality_slug}.${format}`;
}

export const TILES_KEY = "tiles/national.pmtiles";

export function artifactUrl(key: string): string | undefined {
  return registry.artifact_urls?.[key];
}
