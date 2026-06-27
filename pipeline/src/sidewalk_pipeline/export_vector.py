"""Write normalized GeoDataFrames out as GeoParquet for bulk download.

GeoParquet is compressed and read natively by GeoPandas/pandas, DuckDB, and
QGIS 3.x, so a single file serves both the analytics and the GIS audience.

We deliberately do NOT emit FlatGeobuf: it's uncompressed (the price of its
HTTP-range spatial index), which makes it ~5x larger than the equivalent
GeoParquet. The full national + per-province + per-municipality set in FGB is
~1.2GB on its own and blows past Vercel Blob's 1GB Hobby-plan quota. GeoJSON
exports were dropped for the same reason -- the live PMTiles map already
covers the "preview before download" use case. If the Blob plan is ever
upgraded, FlatGeobuf can come back as a second format here.
"""

from __future__ import annotations

import logging
from pathlib import Path

import geopandas as gpd

logger = logging.getLogger(__name__)


def export_scope(gdf: gpd.GeoDataFrame, out_dir: Path, name: str) -> dict[str, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    written: dict[str, Path] = {}

    parquet_path = out_dir / f"{name}.parquet"
    gdf.to_parquet(parquet_path)
    written["parquet"] = parquet_path

    logger.info("Exported %s (%d features) -> %s", name, len(gdf), list(written))
    return written
