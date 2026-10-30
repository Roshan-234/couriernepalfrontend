import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.NEXT_LOW_MEMORY_BUILD === "1" ? { experimental: { cpus: 1, webpackBuildWorker: false } } : {}),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${(process.env.BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')}/api/:path*` }];
  },
};
export default nextConfig;
