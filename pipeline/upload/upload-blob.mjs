// Thin wrapper around the official @vercel/blob SDK, called from
// upload_blob.py via subprocess. Vercel Blob's underlying HTTP contract
// isn't published as a stable public spec, so this uses the real SDK
// instead of hand-rolled REST calls. Needs BLOB_READ_WRITE_TOKEN in env.
import { put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const [, , filePath, pathnameArg] = process.argv;

if (!filePath) {
  console.error("usage: node upload-blob.mjs <file-path> [pathname]");
  process.exit(1);
}

const data = await readFile(filePath);
const blob = await put(pathnameArg ?? basename(filePath), data, {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
});

console.log(JSON.stringify(blob));
