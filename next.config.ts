import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray lockfiles in parent directories
  // don't break module resolution.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
