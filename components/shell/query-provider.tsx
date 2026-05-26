'use client';

/**
 * QueryProvider — React Query client boundary
 *
 * Production QueryClient config:
 * - staleTime: 60s  → data is considered fresh for 60s; no redundant background refetches
 * - gcTime: 5m      → cached data kept for 5 min after component unmounts (formerly cacheTime)
 * - retry: 1        → only 1 retry on failure (not 3) — faster UX on genuine errors
 * - refetchOnWindowFocus: false → do NOT refetch when the user alt-tabs back
 *   (healthcare data changes server-side, not on user focus; use explicit invalidations instead)
 *
 * Singleton pattern: QueryClient is created once per app lifecycle via useState(() => new ...)
 * This prevents a new client being created on every render while still being SSR-safe.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Module-level singleton — exported so non-React code (Axios interceptor,
// Zustand logout) can call queryClient.clear() to evict all PHI from the
// cache the instant the session is invalidated.
export let queryClient: QueryClient;

function makeQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 60 seconds — prevents redundant background refetches
        staleTime: 60 * 1_000,
        // Keep cached data for 5 minutes after component unmounts
        gcTime: 5 * 60 * 1_000,
        // Only retry once on failure, but never on 401 Unauthorized
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401) return false;
          return failureCount < 1;
        },
        // Do NOT refetch when window regains focus — use explicit invalidation instead
        refetchOnWindowFocus: false,
        // Do NOT refetch when the component reconnects after going offline
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 0, // mutations should never auto-retry (idempotency is not guaranteed)
      },
    },
  });
  queryClient = client;
  return client;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState initializer runs once; prevents new QueryClient on every render
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
