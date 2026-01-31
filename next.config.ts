import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/glassfaceworld-site',
  assetPrefix: '/glassfaceworld-site',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
