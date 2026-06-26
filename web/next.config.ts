import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Avoids Next.js inferring the wrong workspace root from an unrelated
  // package-lock.json elsewhere on this machine.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
