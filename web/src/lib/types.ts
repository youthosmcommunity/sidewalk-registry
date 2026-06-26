export interface SourceEntry {
  file_name: string;
  source_url: string;
  licence_url: string;
  attribution_statement: string;
  last_update: string;
}

export interface ProvinceEntry {
  name: string;
  covered: boolean;
  municipality_count: number;
  gap_narrative?: string;
}

export interface MunicipalityEntry {
  province_code: string;
  municipality_slug: string;
  municipality_name: string;
  csd_uid: string;
  feature_count: number;
  category_counts: Record<string, number>;
  pct_has_width: number;
  pct_has_surface: number;
  bbox: [number, number, number, number];
  sources: SourceEntry[];
}

export interface Registry {
  generated_at: string;
  source: {
    name: string;
    catalogue: string;
    license: string;
    collected: string;
  };
  provinces: Record<string, ProvinceEntry>;
  municipalities: MunicipalityEntry[];
  artifact_urls?: Record<string, string>;
}
