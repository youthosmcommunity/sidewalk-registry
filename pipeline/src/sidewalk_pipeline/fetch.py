"""Download and unpack Statistics Canada's Canadian Pedestrian Network Database.

Catalogue 34260004. The direct zip URL isn't documented anywhere on StatCan's
own catalogue page (it's behind a JS-rendered download UI) -- this was found
by probing candidate URLs directly. If StatCan reorganizes their release
structure, this will start failing with a clear error rather than silently
downloading a junk file.
"""

from __future__ import annotations

import logging
import zipfile
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

CPND_URL = "https://www150.statcan.gc.ca/n1/pub/34-26-0004/2025001/zip/canadian_pedestrian_network.zip"
MIN_EXPECTED_SIZE_BYTES = 50_000_000  # the real file is ~130MB; fail loudly if far smaller
ZIP_MAGIC_BYTES = b"PK"

DATA_DIR = Path(__file__).resolve().parents[3] / "data"


def download_cpnd_zip(dest_dir: Path = DATA_DIR) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    zip_path = dest_dir / "cpnd.zip"

    logger.info("Downloading %s", CPND_URL)
    with httpx.stream("GET", CPND_URL, follow_redirects=True, timeout=120.0) as response:
        response.raise_for_status()
        with zip_path.open("wb") as f:
            for chunk in response.iter_bytes():
                f.write(chunk)

    size = zip_path.stat().st_size
    if size < MIN_EXPECTED_SIZE_BYTES:
        raise RuntimeError(
            f"Downloaded file is only {size} bytes (expected >= {MIN_EXPECTED_SIZE_BYTES}). "
            "StatCan likely changed their URL structure -- check "
            "https://www150.statcan.gc.ca/n1/en/catalogue/34260004 for the current link."
        )

    with zip_path.open("rb") as f:
        magic = f.read(2)
    if magic != ZIP_MAGIC_BYTES:
        raise RuntimeError(
            f"Downloaded file doesn't look like a zip (got magic bytes {magic!r}). "
            "StatCan likely served an HTML error page instead of the real file."
        )

    logger.info("Downloaded %s (%d bytes)", zip_path, size)
    return zip_path


def extract_cpnd_zip(zip_path: Path, dest_dir: Path = DATA_DIR) -> Path:
    extract_dir = dest_dir / "cpnd_extracted"
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(extract_dir)

    gpkg_path = extract_dir / "EN" / "pedestrian_network.gpkg"
    if not gpkg_path.exists():
        raise RuntimeError(
            f"Expected {gpkg_path} after extraction but it's not there -- "
            "StatCan likely changed the internal archive layout."
        )
    logger.info("Extracted to %s", extract_dir)
    return extract_dir


def fetch() -> Path:
    """Download + extract if not already present locally. Returns the extracted dir."""
    extract_dir = DATA_DIR / "cpnd_extracted"
    gpkg_path = extract_dir / "EN" / "pedestrian_network.gpkg"
    if gpkg_path.exists():
        logger.info("Using already-extracted data at %s", extract_dir)
        return extract_dir

    zip_path = download_cpnd_zip()
    return extract_cpnd_zip(zip_path)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    fetch()
