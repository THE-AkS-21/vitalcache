/**
 * lib/api/http.ts — Secure Axios Instance
 *
 * Security contracts:
 * ✅ withCredentials: true  → HttpOnly cookie sent on every request
 * ✅ accessToken from Zustand memory (never localStorage)
 * ✅ Silent refresh via /api/auth/session (Next.js proxy, not Go backend directly)
 * ✅ Concurrent 401s queued — only one refresh in-flight at a time
 * ✅ On refresh failure → Zustand cleared + hard redirect to /login
 *
 * Performance:
 * ✅ AbortSignal forwarded to Axios — React Query cancels stale/unmounted requests
 *    Pass signal from queryFn context: api.get('/path', { signal })
 *
 * Do NOT import in Server Components or Route Handlers.
 * Use native fetch() with Authorization header there instead.
 */

import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
});

// ── Request: attach access token + idempotency key ────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (['post', 'patch', 'put'].includes(config.method?.toLowerCase() ?? '')) {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = crypto.randomUUID();
    }
  }

  return config;
});

// ── Response: silent refresh on 401 ──────────────────────────────────────────
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function flushQueue(error: unknown, token: string | null): void {
  for (const entry of failedQueue) {
    if (error) entry.reject(error);
    else entry.resolve(token!);
  }
  failedQueue = [];
}

interface ExtendedAxiosConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface SessionResponse {
  access_token: string | null;
  user: unknown;
}

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err);

    // FIX 1: Check isCancel BEFORE inspecting err.response.status.
    // Cancelled requests (aborted by React Query) have no .response, so
    // `status` below would be `undefined`, causing them to fall through
    // into the 401 refresh path unintentionally.
    if (axios.isCancel(err)) return Promise.reject(err);

    const originalRequest = err.config as ExtendedAxiosConfig | undefined;
    if (!originalRequest) return Promise.reject(err);

    const status = err.response?.status;
    if (status !== 401 || originalRequest._retry) return Promise.reject(err);

    if (isRefreshing) {
      // FIX 2: Queued requests receive the new token and patch their own
      // Authorization header before re-dispatching, preventing stale token usage.
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.get<{ access_token: string }>(
        '/api/auth/session',
        {
          baseURL: '/', // Force use of Next.js origin
          withCredentials: true,
        }
      );

      if (!data.access_token) throw new Error('No access token in session response');

      useAuthStore.getState().setAccessToken(data.access_token);
      flushQueue(null, data.access_token);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${data.access_token}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
      return Promise.reject(refreshError);
    } finally {
      // FIX 3: Always reset isRefreshing in finally, not just on the happy path.
      // Without this, any thrown error leaves the flag permanently true,
      // causing every subsequent 401 to silently queue forever (especially
      // visible during Next.js dev-mode hot-reloads).
      isRefreshing = false;
    }
  }
);