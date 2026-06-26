"""Single entrypoint chaining the whole pipeline: fetch -> normalize ->
split -> export -> tiles -> registry -> (optional) upload.

Usage: uv run python -m sidewalk_pipeline.cli run-all [--skip-upload] [--skip-tiles]
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import pyarrow as pa

# pyarrow's default multi-threaded reader/writer pools deadlock/severely
# thrash under this sandbox's CPU scheduling (observed: a parquet read of
# 1.7M rows hangs for minutes with ~0% measured CPU time, vs <1 minute
# single-threaded). Force single-threaded before any parquet I/O happens.
pa.set_cpu_count(1)
pa.set_io_thread_count(1)

from sidewalk_pipeline import export_tiles, export_vector, fetch, normalize, registry_build, split, upload_blob

logger = logging.getLogger(__name__)

PIPELINE_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = PIPELINE_ROOT / "data"
OUTPUT_DIR = DATA_DIR / "output"
TMP_DIR = DATA_DIR / "tmp"
WEB_PUBLIC_REGISTRY = PIPELINE_ROOT.parent / "web" / "public" / "registry" / "sources.json"


def run_all(skip_upload: bool = False, skip_tiles: bool = False) -> None:
    extract_dir = fetch.fetch()
    gpkg_path = extract_dir / "EN" / "pedestrian_network.gpkg"
    data_sources_csv = extract_dir / "EN" / "data_sources.csv"

    gdf = normalize.normalize(gpkg_path)

    artifacts: dict[str, Path] = {}

    national_files = export_vector.export_scope(gdf, OUTPUT_DIR / "national", "national")
    for fmt, path in national_files.items():
        artifacts[f"downloads/national.{fmt}"] = path

    for province_code, province_gdf in split.by_province(gdf).items():
        files = export_vector.export_scope(province_gdf, OUTPUT_DIR / "provinces", province_code)
        for fmt, path in files.items():
            artifacts[f"downloads/provinces/{province_code}.{fmt}"] = path

    for (province_code, municipality_slug), muni_gdf in split.by_municipality(gdf).items():
        files = export_vector.export_scope(
            muni_gdf, OUTPUT_DIR / "municipalities" / province_code, municipality_slug
        )
        for fmt, path in files.items():
            artifacts[f"downloads/municipalities/{province_code}/{municipality_slug}.{fmt}"] = path

    if not skip_tiles:
        tiles_path = export_tiles.export_tiles(gdf, OUTPUT_DIR / "tiles" / "national.pmtiles", TMP_DIR)
        artifacts["tiles/national.pmtiles"] = tiles_path

    registry = registry_build.build_registry(gdf, data_sources_csv)

    if not skip_upload:
        blob_urls = upload_blob.upload_artifacts(artifacts)
        registry["artifact_urls"] = blob_urls
    else:
        logger.warning("Skipping upload -- registry will not have artifact_urls populated")

    registry_build.write_registry(
        registry,
        full_path=PIPELINE_ROOT / "registry" / "generated_sources.json",
        trimmed_path=WEB_PUBLIC_REGISTRY,
    )

    logger.info("Pipeline complete.")


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    run_all_parser = subparsers.add_parser("run-all")
    run_all_parser.add_argument("--skip-upload", action="store_true")
    run_all_parser.add_argument("--skip-tiles", action="store_true")

    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)

    if args.command == "run-all":
        run_all(skip_upload=args.skip_upload, skip_tiles=args.skip_tiles)


if __name__ == "__main__":
    main()
