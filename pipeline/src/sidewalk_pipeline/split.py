"""Split the normalized national GeoDataFrame into download-able subsets."""

from __future__ import annotations

import geopandas as gpd


def by_province(gdf: gpd.GeoDataFrame) -> dict[str, gpd.GeoDataFrame]:
    return {code: group for code, group in gdf.groupby("province_code")}


def by_municipality(gdf: gpd.GeoDataFrame) -> dict[tuple[str, str], gpd.GeoDataFrame]:
    return {
        key: group
        for key, group in gdf.groupby(["province_code", "municipality_slug"])
    }
