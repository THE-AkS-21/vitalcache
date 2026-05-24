/**
 * (protected)/layout.tsx — Server Component Shell
 *
 * Auth enforced by middleware.ts (edge runtime) BEFORE this renders.
 * No client-side token check — that was the original FOUC source.
 *
 * Client boundaries (minimal):
 *   - QueryProvider: React Query context
 *   - SessionProvider: hydrates Zustand on mount
 *   - GlobalErrorBoundary: catches unhandled render errors in the page tree
 *   - Sidebar, Header: only their interactive parts are 'use client'
 */

import QueryProvider from '@/components/shell/query-provider';
import SessionProvider from '@/components/shell/session-provider';
import { GlobalErrorBoundary } from '@/components/error/error-boundary';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <GlobalErrorBoundary>
          <div className="flex min-h-screen w-full bg-white dark:bg-gray-950">
            <Sidebar />
            <div className="flex flex-col w-full">
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-gray-50/50 dark:bg-gray-900/50">
                {children}
              </main>
            </div>
          </div>
        </GlobalErrorBoundary>
      </SessionProvider>
    </QueryProvider>
  );
}
