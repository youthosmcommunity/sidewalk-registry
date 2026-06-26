"""Generate a PMTiles archive for the national map.

The tippecanoe available on this machine (1.34.3) predates native PMTiles
output (that landed in tippecanoe 2.x), so this goes tippecanoe -> .mbtiles
-> `pmtiles convert` (protomaps/go-pmtiles, a precompiled Go binary) rather
than assuming a newer tippecanoe than what's actually installed.

All 8 categories ship as one tile layer with a `category` property -- the
frontend filters by category client-side (standard vector-tile pattern)
rather than needing 8 separate tippecanoe layers.
"""

from __future__ import annotations

import logging
import subprocess
from pathlib import Path

import geopandas as gpd

logger = logging.getLogger(__name__)

LAYER_NAME = "pedestrian_network"


def export_tiles(gdf: gpd.GeoDataFrame, out_path: Path, tmp_dir: Path) -> Path:
    tmp_dir.mkdir(parents=True, exist_ok=True)
    geojson_path = tmp_dir / "national_for_tiles.geojson"
    mbtiles_path = tmp_dir / "national.mbtiles"

    logger.info("Writing intermediate GeoJSON for tippecanoe (%d features)", len(gdf))
    gdf.to_file(geojson_path, driver="GeoJSON")

    mbtiles_path.unlink(missing_ok=True)
    subprocess.run(
        [
            "tippecanoe",
            "-o", str(mbtiles_path),
            "-l", LAYER_NAME,
            "-zg",
            "--drop-densest-as-needed",
            "--extend-zooms-if-still-dropping",
            "-f",
            str(geojson_path),
        ],
        check=True,
    )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.unlink(missing_ok=True)
    subprocess.run(["pmtiles", "convert", str(mbtiles_path), str(out_path)], check=True)

    logger.info("Wrote %s (%d bytes)", out_path, out_path.stat().st_size)
    return out_path
