import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/nextjs-glassfaceworld',
  assetPrefix: '/nextjs-glassfaceworld',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
