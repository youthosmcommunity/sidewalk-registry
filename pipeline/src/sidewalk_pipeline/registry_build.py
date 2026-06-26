"""Build the source registry: per-municipality completeness stats merged
with StatCan's own source attribution (data_sources.csv) and the
hand-maintained gap narrative (registry/overlay.yaml).
"""

from __future__ import annotations

import csv
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

import geopandas as gpd
import jsonschema
import yaml

from sidewalk_pipeline.schema import CATEGORY_LABELS, PROVINCES_AND_TERRITORIES

logger = logging.getLogger(__name__)

REGISTRY_DIR = Path(__file__).resolve().parents[2] / "registry"
OVERLAY_PATH = REGISTRY_DIR / "overlay.yaml"
SCHEMA_PATH = REGISTRY_DIR / "sources.schema.json"

SOURCE_INFO = {
    "name": "Canadian Pedestrian Network Database",
    "catalogue": "34260004",
    "license": "Open Government Licence - Canada",
    "collected": "2023-11 to 2024-02",
}


def _load_data_sources(data_sources_csv: Path) -> dict[tuple[str, str], list[dict]]:
    """Group StatCan's data_sources.csv rows by (province_code, municipality_slug)."""
    by_municipality: dict[tuple[str, str], list[dict]] = {}
    with data_sources_csv.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            key = (row["prov_terr"].strip(), row["municipality"].strip())
            by_municipality.setdefault(key, []).append(
                {
                    "file_name": row["file_name"].strip(),
                    "source_url": row["source_url"].strip(),
                    "licence_url": row["licence_url"].strip(),
                    "attribution_statement": row["attribution_statement"].strip(),
                    "last_update": row["last_update"].strip(),
                }
            )
    return by_municipality


def build_registry(gdf: gpd.GeoDataFrame, data_sources_csv: Path) -> dict:
    overlay = yaml.safe_load(OVERLAY_PATH.read_text()) if OVERLAY_PATH.exists() else {}
    gap_narrative = overlay.get("gap_narrative", {})
    sources_by_municipality = _load_data_sources(data_sources_csv)

    municipalities = []
    covered_provinces: set[str] = set()

    for (province_code, municipality_slug), group in gdf.groupby(
        ["province_code", "municipality_slug"]
    ):
        covered_provinces.add(province_code)
        category_counts = {
            CATEGORY_LABELS[cat]: int(n) for cat, n in group["category"].value_counts().items()
        }
        municipalities.append(
            {
                "province_code": province_code,
                "municipality_slug": municipality_slug,
                "municipality_name": group["municipality_name"].iloc[0],
                "csd_uid": group["csd_uid"].iloc[0],
                "feature_count": int(len(group)),
                "category_counts": category_counts,
                "pct_has_width": round(float(group["has_width"].mean()), 4),
                "pct_has_surface": round(float(group["has_surface"].mean()), 4),
                "bbox": [round(float(x), 6) for x in group.total_bounds],
                "sources": sources_by_municipality.get((province_code, municipality_slug), []),
            }
        )

    municipalities.sort(key=lambda m: (m["province_code"], m["municipality_slug"]))

    provinces = {}
    for code, name in PROVINCES_AND_TERRITORIES.items():
        covered = code in covered_provinces
        entry = {
            "name": name,
            "covered": covered,
            "municipality_count": sum(1 for m in municipalities if m["province_code"] == code),
        }
        if not covered and code in gap_narrative:
            entry["gap_narrative"] = gap_narrative[code].strip()
        provinces[code] = entry

    registry = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": SOURCE_INFO,
        "provinces": provinces,
        "municipalities": municipalities,
    }

    jsonschema.validate(registry, json.loads(SCHEMA_PATH.read_text()))
    return registry


def write_registry(registry: dict, full_path: Path, trimmed_path: Path) -> None:
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(json.dumps(registry, indent=2))

    # Trimmed version for web/public: drop bbox precision noise and keep it small.
    trimmed_path.parent.mkdir(parents=True, exist_ok=True)
    trimmed_path.write_text(json.dumps(registry, separators=(",", ":")))

    logger.info(
        "Wrote registry: %s (%d bytes), %s (%d bytes)",
        full_path, full_path.stat().st_size,
        trimmed_path, trimmed_path.stat().st_size,
    )
