/**
 * Auth Store — In-Memory Only
 *
 * Security contract:
 * ✅ accessToken  → Zustand in-memory ONLY. Cleared on page refresh (re-hydrated via /api/auth/session).
 * ✅ user         → Zustand in-memory ONLY. No localStorage. No sessionStorage. No cookies.
 * ✅ refresh_token → HttpOnly cookie set by the Go backend. NEVER accessible to JavaScript.
 *
 * Why no persist middleware?
 * - Persisting `user` to localStorage leaks PII (email, role, doctor_id) to browser storage.
 * - Any localStorage data is readable by XSS. In-memory data is not.
 * - On page refresh, the session is restored by calling GET /api/auth/session which
 *   uses the HttpOnly cookie to issue a new access token and return the user profile.
 */

import { create } from 'zustand';
import { queryClient } from '@/components/shell/query-provider';

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  designation?: string;
  permissions: string[];
  doctor_id?: string;
  patient_id?: string;
}

interface AuthState {
  /** Short-lived JWT. Lives ONLY in memory. Never written to storage. */
  accessToken: string | null;
  /** User profile. Lives ONLY in memory. Re-hydrated from server on boot. */
  user: User | null;
  /** Whether the session has been checked against the server at least once. */
  sessionChecked: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSessionChecked: (checked: boolean) => void;
  /** Clears all in-memory auth state. Cookie cleared server-side via POST /api/auth/logout. */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  sessionChecked: false,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setSessionChecked: (checked) => set({ sessionChecked: checked }),

  logout: () => {
    // Evict all cached PHI from React Query before wiping auth state.
    // Critical for shared-terminal environments: prevents a new user from
    // seeing the previous session's patient/prescription data.
    queryClient?.clear();
    set({
      accessToken: null,
      user: null,
      sessionChecked: true, // don't trigger another session check after logout
    });
  },
}));