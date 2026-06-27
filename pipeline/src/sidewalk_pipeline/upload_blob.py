"""Upload heavy derived artifacts (PMTiles, GeoParquet, FlatGeobuf) to Vercel
Blob. Shells out to upload-blob.mjs (the official @vercel/blob SDK) rather
than hand-rolling Vercel Blob's HTTP contract, which isn't published as a
stable public spec.
"""

from __future__ import annotations

import json
import logging
import shutil
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "upload"
UPLOAD_SCRIPT = UPLOAD_DIR / "upload-blob.mjs"


def _ensure_node_deps_installed() -> None:
    if not (UPLOAD_DIR / "node_modules").exists():
        logger.info("Installing @vercel/blob in %s", UPLOAD_DIR)
        subprocess.run(["npm", "install"], cwd=UPLOAD_DIR, check=True)


def upload_file(file_path: Path, pathname: str) -> str:
    node_bin = shutil.which("node")
    if node_bin is None:
        raise RuntimeError("node not found on PATH -- needed to upload to Vercel Blob")

    _ensure_node_deps_installed()

    result = subprocess.run(
        [node_bin, str(UPLOAD_SCRIPT), str(file_path), pathname],
        cwd=UPLOAD_DIR,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Upload failed for {pathname}:\n{result.stderr}")

    blob = json.loads(result.stdout)
    logger.info("Uploaded %s -> %s", pathname, blob["url"])
    return blob["url"]


def upload_artifacts(files: dict[str, Path]) -> dict[str, str]:
    """files: {pathname: local file path}. Returns {pathname: public URL}."""
    return {pathname: upload_file(path, pathname) for pathname, path in files.items()}
