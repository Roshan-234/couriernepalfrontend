import { NextResponse, type NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  if (
    !request.cookies.has("access_token") &&
    !request.cookies.has("refresh_token")
  ) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  // Flask validates tokens and roles; cookie presence is only a navigation hint.
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/protected/:path*"],
};
