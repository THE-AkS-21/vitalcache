/**
 * Route Handler: GET /api/auth/session
 *
 * Server-side session probe. Called by the client on app boot to:
 * 1. Check if a valid HttpOnly refresh cookie exists
 * 2. Exchange it for a new access token (via Go backend)
 * 3. Return the decoded user profile so Zustand can hydrate WITHOUT exposing
 *    the access token to the window object or localStorage
 *
 * Route Handler: POST /api/auth/session
 *
 * Called after a successful login to decode the profile from the
 * in-memory access token and persist user metadata in Zustand.
 *
 * Architecture:
 *   Browser → Next.js /api/auth/session → Go /api/auth/refresh → rotated tokens
 *
 * The Go backend sets a NEW HttpOnly cookie on the response. Next.js forwards
 * the Set-Cookie header to the browser. The access token is returned to the
 * browser in the JSON body and stored ONLY in Zustand (in-memory).
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const GO_API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ALLOWED_ORIGINS is a comma-separated list of origins permitted to call this proxy.
// Set ALLOWED_ORIGINS="https://app.vitalcache.com" in production.
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);

/**
 * Validates the Origin (or Referer fallback) header against the allow-list.
 * Returns true when the request is considered same-origin / trusted.
 */
function validateOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (origin) return ALLOWED_ORIGINS.has(origin);

  // Fallback: parse just the origin from the Referer header (present in most browsers
  // for same-origin navigations when Origin is absent).
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const { origin: refOrigin } = new URL(referer);
      return ALLOWED_ORIGINS.has(refOrigin);
    } catch {
      return false;
    }
  }

  // No Origin or Referer — reject. Server-to-server callers must use INTERNAL_API_URL.
  return false;
}

interface GoRefreshResponse {
  success: boolean;
  data: {
    access_token: string;
  };
}

interface GoProfileResponse {
  success: boolean;
  data: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    designation?: string;
    permissions: string[];
    doctor_id?: string;
    patient_id?: string;
  };
}

/**
 * GET /api/auth/session
 * Called on app boot to restore the session from the HttpOnly cookie.
 * Returns the user profile + a fresh access token.
 */
export async function GET(req: Request): Promise<NextResponse> {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ user: null, access_token: null }, { status: 200 });
  }

  try {
    // Forward the HttpOnly cookie to the Go backend
    const refreshRes = await fetch(`${GO_API}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
      body: JSON.stringify({}),
      // No caching — auth must always be fresh
      cache: 'no-store',
    });

    if (!refreshRes.ok) {
      // Cookie is expired/revoked — clear it and tell client to clear Zustand and go to /login
      const res = NextResponse.json({ user: null, access_token: null }, { status: 200 });
      res.cookies.delete('refresh_token');
      return res;
    }

    const refreshData = (await refreshRes.json()) as GoRefreshResponse;
    const newAccessToken = refreshData.data.access_token;

    // Fetch user profile using the fresh access token
    const profileRes = await fetch(`${GO_API}/profiles/me`, {
      headers: {
        Authorization: `Bearer ${newAccessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!profileRes.ok) {
      const res = NextResponse.json({ user: null, access_token: null }, { status: 200 });
      res.cookies.delete('refresh_token');
      return res;
    }

    const profileData = (await profileRes.json()) as GoProfileResponse;

    const response = NextResponse.json(
      {
        access_token: newAccessToken,
        user: profileData.data,
      },
      { status: 200 }
    );

    // Critical: forward ALL rotated cookies from Go backend to the browser.
    // Use getSetCookie() (Node 18+ fetch) to get each Set-Cookie header as a
    // separate array entry, then append individually — .set() would silently
    // drop all but one if the backend issues multiple cookies (e.g. csrf_token).
    const goSetCookies = refreshRes.headers.getSetCookie();
    for (const cookie of goSetCookies) {
      response.headers.append('set-cookie', cookie);
    }

    return response;
  } catch (error) {
    // Network error to Go backend — return empty session, do not crash
    console.error('[/api/auth/session] Upstream error:', error);
    return NextResponse.json({ user: null, access_token: null }, { status: 200 });
  }
}
