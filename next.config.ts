import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // basePath solo se aplica en GitHub Actions (GITHUB_ACTIONS=true por defecto)
  basePath: process.env.GITHUB_ACTIONS ? "/fm26-scoutlab" : "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
