import { NextResponse, type NextRequest } from "next/server";

/**
 * The visitor's address, as the hosting layer reported it.
 *
 * LiteSpeed/Passenger put the real client at the head of `x-forwarded-for`;
 * everything after it is the chain of proxies. `x-real-ip` is the fallback
 * when a host sets only that.
 */
function clientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api/')) {
    const headers = new Headers(request.headers);
    headers.set('X-Backend-Key', process.env.BACKEND_PROXY_SECRET || '');
    // Flask sees this proxy as the peer on every request, so without a
    // forwarded address its rate limits become one bucket shared by every
    // visitor and its audit log records the same source for everything.
    // Overwritten, never appended, so a client cannot inject its own value;
    // the backend trusts it only when X-Backend-Key matched.
    headers.set('X-Real-Client-IP', clientAddress(request));
    return NextResponse.next({ request: { headers } });
  }
  if (
    /^\/(admin|dashboard)(\/|$)/.test(path) &&
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
  // /tracking is intentionally absent: it answers the highest-intent query
  // this site gets and holds nothing private until a number is entered.
  // The blog editor is added, because it was indexable from any link to it.
  if (/^\/(admin|dashboard|auth)(\/|$)/.test(path) || /^\/blog\/[^/]+\/edit\/?$/.test(path)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|images/|robots.txt|sitemap.xml).*)'],
};
