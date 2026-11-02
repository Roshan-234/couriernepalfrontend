import { NextResponse, type NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api/')) {
    const headers = new Headers(request.headers);
    headers.set('X-Backend-Key', process.env.BACKEND_PROXY_SECRET || '');
    return NextResponse.next({ request: { headers } });
  }
  if (
    /^\/(admin|dashboard|protected)(\/|$)/.test(path) &&
    !request.cookies.has("access_token") &&
    !request.cookies.has("refresh_token")
  ) {
    // Passenger may expose an internal localhost origin to Next.js. Redirect
    // to the configured public origin; keep loopback previews on their host.
    const url = new URL("/auth/login", process.env.SITE_URL || request.url);
    const localHost = request.headers.get('host') || '';
    if (!process.env.SITE_URL && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(localHost)) {
      url.host = localHost;
    }
    url.searchParams.set("redirect", request.nextUrl.pathname);
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }
  // Flask validates tokens and roles; cookie presence is only a navigation hint.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const development = process.env.NODE_ENV !== 'production';
  const csp = ["default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https:", "font-src 'self' data:",
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com${development ? ' ws: wss:' : ''}`,
    "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join('; ');
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce); headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  if (/^\/(admin|dashboard|protected|auth|tracking)(\/|$)/.test(path)) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|images/|robots.txt|sitemap.xml).*)'],
};
