import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Flask API answers with and without a trailing slash (strict_slashes
  // is off), and several of its routes are declared with one. Without this,
  // Next answers `/api/branches/` with a 308 of its own before the rewrite
  // runs — a wasted round trip on every such call, and a redirect that
  // resolves to the backend's own origin once the two are on separate hosts.
  skipTrailingSlashRedirect: true,
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
    return [{ source: '/api/:path*', destination: `${(process.env.BACKEND_ORIGIN || process.env.BACKEND_URL || 'http://127.0.0.1:5000').replace(/\/$/, '')}/api/:path*` }];
  },
};
export default nextConfig;
