"""Write normalized GeoDataFrames out as GeoParquet, FlatGeobuf, and (for
small scopes only) GeoJSON.

GeoParquet targets analytics/data-science consumers (pandas/DuckDB);
FlatGeobuf targets GIS-tool consumers (QGIS etc.) who benefit from its
HTTP-range-readable spatial index. GeoJSON is for small previews only --
it's not a sane bulk-download format at national scale.
"""

from __future__ import annotations

import logging
from pathlib import Path

import geopandas as gpd

logger = logging.getLogger(__name__)

# Above this feature count, skip GeoJSON -- it's meant for small previews only.
GEOJSON_FEATURE_LIMIT = 50_000


def export_scope(gdf: gpd.GeoDataFrame, out_dir: Path, name: str) -> dict[str, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    written: dict[str, Path] = {}

    parquet_path = out_dir / f"{name}.parquet"
    gdf.to_parquet(parquet_path)
    written["parquet"] = parquet_path

    fgb_path = out_dir / f"{name}.fgb"
    gdf.to_file(fgb_path, driver="FlatGeobuf")
    written["fgb"] = fgb_path

    if len(gdf) <= GEOJSON_FEATURE_LIMIT:
        geojson_path = out_dir / f"{name}.geojson"
        gdf.to_file(geojson_path, driver="GeoJSON")
        written["geojson"] = geojson_path

    logger.info("Exported %s (%d features) -> %s", name, len(gdf), list(written))
    return written
