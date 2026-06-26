import rawRegistry from "../../public/registry/sources.json";
import type { MunicipalityEntry, Registry } from "./types";

// TypeScript infers an overly precise literal type per JSON object (e.g.
// category_counts keys vary per municipality), so it won't structurally
// match Record<string, number> directly -- go through unknown first.
export const registry = rawRegistry as unknown as Registry;

export function municipalitySlug(m: MunicipalityEntry): string {
  return `${m.province_code}/${m.municipality_slug}`;
}

export function findMunicipality(
  provinceCode: string,
  municipalitySlugValue: string,
): MunicipalityEntry | undefined {
  return registry.municipalities.find(
    (m) => m.province_code === provinceCode && m.municipality_slug === municipalitySlugValue,
  );
}

export function municipalitiesByProvince(provinceCode: string): MunicipalityEntry[] {
  return registry.municipalities
    .filter((m) => m.province_code === provinceCode)
    .sort((a, b) => b.feature_count - a.feature_count);
}

export function totalFeatureCount(): number {
  return registry.municipalities.reduce((sum, m) => sum + m.feature_count, 0);
}
