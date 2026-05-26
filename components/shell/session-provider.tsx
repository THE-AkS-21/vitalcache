'use client';

/**
 * SessionProvider — Session Hydration Client Component
 *
 * This is the ONLY component that calls /api/auth/session on app boot.
 * It runs once after mount, restores the access token and user profile
 * from the server (via the HttpOnly cookie), and hydrates Zustand.
 *
 * Mount sequence:
 *   1. App boots → middleware already redirected unauthenticated users
 *   2. SessionProvider mounts → calls GET /api/auth/session
 *   3. Server exchanges HttpOnly cookie for new access token + user profile
 *   4. Zustand hydrated in-memory (no localStorage)
 *   5. Children rendered with full session context
 *
 * Why a client component?
 * - useEffect runs only on the client, preventing SSR/RSC issues
 * - Keeps the fetch call to the browser's network tab (observable, debuggable)
 * - The route handler itself is a Server Component — no secrets exposed
 */

import { useEffect } from 'react';
import { useAuthStore, type User } from '@/store/authStore';

interface SessionResponse {
  access_token: string | null;
  user: User | null;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include', // ensure cookies are sent
          cache: 'no-store',
        });

        if (!res.ok || cancelled) return;

        const data = (await res.json()) as SessionResponse;

        if (!cancelled) {
          if (data.access_token && data.user) {
            setAccessToken(data.access_token);
            setUser(data.user);
          } else {
            // Force logout if we have no valid token
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }
        }
      } catch {
        // Network error — leave Zustand as-is (null).
        // Middleware already redirected unauthenticated users, so this is safe.
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [setAccessToken, setUser, setSessionChecked]);

  return <>{children}</>;
}
