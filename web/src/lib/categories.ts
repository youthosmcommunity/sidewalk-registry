// Mirrors pipeline/src/sidewalk_pipeline/schema.py CATEGORY_SLUGS.
export const CATEGORY_LABELS: Record<string, string> = {
  sidewalk: "Sidewalk",
  pedestrian_path: "Pedestrian path",
  multi_use_path: "Multi-use path",
  unpaved_path: "Unpaved path",
  pedestrian_zone: "Pedestrian zone",
  crosswalk: "Crosswalk",
  bridge_or_underpass: "Bridge or underpass",
  stairway: "Stairway",
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_LABELS);

export const CATEGORY_COLORS: Record<string, string> = {
  sidewalk: "#1d4ed8",
  pedestrian_path: "#16a34a",
  multi_use_path: "#ca8a04",
  unpaved_path: "#92400e",
  pedestrian_zone: "#db2777",
  crosswalk: "#dc2626",
  bridge_or_underpass: "#0891b2",
  stairway: "#7c3aed",
};
