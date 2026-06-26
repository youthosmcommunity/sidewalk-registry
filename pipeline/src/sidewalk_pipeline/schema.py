"""Canonical attribute contract for the Sidewalk Registry pipeline.

This is the single source of truth for column names/types coming out of
normalize.py. web/src/lib/types.ts mirrors the CATEGORY_SLUGS and field
names defined here.
"""

from __future__ import annotations

SOURCE_CRS = "EPSG:3347"  # NAD83 / Statistics Canada Lambert, as shipped by StatCan
TARGET_CRS = "EPSG:4326"  # WGS84, for web use

# StatCan's `standard_class` values (confirmed by querying the real GeoPackage)
# mapped to short machine-friendly slugs used everywhere downstream.
CATEGORY_SLUGS: dict[str, str] = {
    "Sidewalk": "sidewalk",
    "Pedestrian Path": "pedestrian_path",
    "Multi-use Path": "multi_use_path",
    "Unpaved Path": "unpaved_path",
    "Pedestrian Zone": "pedestrian_zone",
    "Crosswalk": "crosswalk",
    "Bridge or Underpass": "bridge_or_underpass",
    "Stairway": "stairway",
}

# Reverse lookup for display purposes.
CATEGORY_LABELS: dict[str, str] = {slug: label for label, slug in CATEGORY_SLUGS.items()}

# Source GeoPackage column -> canonical column. Confirmed via ogrinfo against
# the real pedestrian_network.gpkg, not guessed from the metadata report.
SOURCE_TO_CANONICAL: dict[str, str] = {
    "id": "id",
    "source_id": "source_id",
    "prov_terr": "province_code",
    "municipality": "municipality_slug",
    "file_name": "source_file",
    "standard_class": "category_label",  # converted to `category` slug in normalize.py
    "source_class": "source_category",
    "width": "width_m",
    "material": "surface",
    "source_material": "source_surface",
    "street": "street",
    "csdname": "municipality_name",
    "csduid": "csd_uid",
}

# String values StatCan uses as a "missing" sentinel instead of NULL
# (confirmed: `material` and `source_material` use "..", `width` and
# `street` use real NULL instead).
MISSING_SENTINELS = {"..", ""}

# Final canonical column order for normalized GeoDataFrames.
CANONICAL_COLUMNS: list[str] = [
    "id",
    "source_id",
    "province_code",
    "municipality_slug",
    "municipality_name",
    "csd_uid",
    "category",
    "source_category",
    "width_m",
    "has_width",
    "surface",
    "source_surface",
    "has_surface",
    "street",
    "source_file",
    "geometry",
]

# All 13 Canadian provinces/territories, for gap-visibility reporting.
# Codes match the lowercase `province_code` values used in the source data.
PROVINCES_AND_TERRITORIES: dict[str, str] = {
    "ab": "Alberta",
    "bc": "British Columbia",
    "mb": "Manitoba",
    "nb": "New Brunswick",
    "nl": "Newfoundland and Labrador",
    "ns": "Nova Scotia",
    "nt": "Northwest Territories",
    "nu": "Nunavut",
    "on": "Ontario",
    "pe": "Prince Edward Island",
    "qc": "Quebec",
    "sk": "Saskatchewan",
    "yt": "Yukon",
}


def clean_missing(value):
    """Normalize StatCan's missing-value sentinels to None."""
    if value is None:
        return None
    if isinstance(value, str) and value.strip() in MISSING_SENTINELS:
        return None
    return value
