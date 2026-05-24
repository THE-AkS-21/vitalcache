/**
 * Next.js Edge Middleware — Auth Guard
 *
 * Runs at the edge BEFORE any React component renders.
 * Reads the HttpOnly `refresh_token` cookie to determine session validity.
 * - Unauthenticated requests to protected routes → redirect to /login (no FOUC)
 * - Authenticated requests to /login → redirect to /dashboard
 *
 * NOTE: We intentionally do NOT validate the JWT signature here.
 * The edge runtime has crypto APIs but validating against the Go backend's
 * key would require an outbound fetch on every request — too expensive.
 * We check for cookie PRESENCE only. The Go backend validates the token
 * on every protected API call. If the cookie is expired/revoked, the
 * /api/auth/session proxy returns 401 and the client handles logout.
 */

import { NextRequest, NextResponse } from 'next/server';

// Routes that require an authenticated session
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/patients',
  '/appointments',
  '/prescriptions',
  '/medicines',
  '/billing',
  '/bundles',
  '/certificates',
  '/settings',
];

// Routes only accessible when NOT authenticated
const AUTH_ONLY_ROUTES = ['/login'];

// Routes that bypass middleware entirely
const PUBLIC_PREFIXES = [
  '/api/',         // all Next.js route handlers
  '/_next/',       // Next.js internals
  '/favicon.ico',
  '/robots.txt',
];

const REFRESH_COOKIE_NAME = 'refresh_token';

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);

  // Authenticated user trying to access /login → send to dashboard
  if (isAuthOnly(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user trying to access a protected route → send to login
  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination for post-login redirect
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes EXCEPT:
   * - _next/static (static files)
   * - _next/image  (image optimisation)
   * - favicon.ico
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
