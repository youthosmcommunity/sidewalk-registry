"""Normalize StatCan's raw GeoPackage into the canonical schema."""

from __future__ import annotations

import logging
from pathlib import Path

import geopandas as gpd
import shapely

from sidewalk_pipeline.schema import (
    CANONICAL_COLUMNS,
    CATEGORY_SLUGS,
    SOURCE_CRS,
    SOURCE_TO_CANONICAL,
    TARGET_CRS,
    clean_missing,
)

logger = logging.getLogger(__name__)

STRING_COLUMNS_WITH_SENTINELS = ["surface", "source_surface", "street", "source_category"]


def normalize(gpkg_path: Path) -> gpd.GeoDataFrame:
    logger.info("Reading %s", gpkg_path)
    gdf = gpd.read_file(gpkg_path, engine="pyogrio")

    if gdf.crs is None or gdf.crs.to_string() != SOURCE_CRS:
        logger.warning("Unexpected source CRS %s, expected %s -- proceeding anyway", gdf.crs, SOURCE_CRS)

    gdf = gdf.rename(columns=SOURCE_TO_CANONICAL)

    gdf["category"] = gdf["category_label"].map(CATEGORY_SLUGS)
    unmapped = gdf.loc[gdf["category"].isna(), "category_label"].unique()
    if len(unmapped):
        raise ValueError(f"Unrecognized standard_class values not in CATEGORY_SLUGS: {unmapped}")
    gdf = gdf.drop(columns=["category_label"])

    for col in STRING_COLUMNS_WITH_SENTINELS:
        gdf[col] = gdf[col].map(clean_missing)

    gdf["has_width"] = gdf["width_m"].notna()
    gdf["has_surface"] = gdf["surface"].notna()

    # Source data is 3D (Z always unused for this kind of street-level survey
    # data) -- drop it, it roughly doubles coordinate storage for no benefit
    # in a 2D web map.
    gdf["geometry"] = shapely.force_2d(gdf["geometry"])

    gdf = gdf.to_crs(TARGET_CRS)

    gdf = gdf[CANONICAL_COLUMNS]

    logger.info("Normalized %d features", len(gdf))
    return gdf
