import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(process.env.ENABLE_HSTS === 'true' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
    ] }];
  },
  ...(process.env.NEXT_LOW_MEMORY_BUILD === "1" ? { experimental: { cpus: 1, webpackBuildWorker: false } } : {}),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${(process.env.BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')}/api/:path*` }];
  },
};
export default nextConfig;
