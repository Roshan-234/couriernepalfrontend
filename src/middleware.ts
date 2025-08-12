import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/about',
    '/contact',
    '/services',
    '/pricing',
    '/tracking',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/tracking',
    '/blog',
    '/blog/category',
    '/blog/tag',
  ];

  // Check if the path starts with any of the public paths
  const isPublicPath = publicPaths.some(publicPath => 
    path.startsWith(publicPath) || path.includes('/api/tracking/')
  );

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes that require authentication
  if (path.startsWith('/api/') && !isPublicPath && !token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Continue to the route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
