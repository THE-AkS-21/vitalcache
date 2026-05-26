'use client';

/**
 * app/error.tsx — Next.js App Router global error page
 *
 * This file is the Next.js convention for handling uncaught errors at the
 * root layout level. It runs OUTSIDE the root layout (which may itself be
 * broken), so it must be a self-contained client component with no imports
 * from the broken subtree.
 *
 * Triggered by: Server Component throws, async Server Action fails, or
 * any error escapes all nested error boundaries.
 *
 * `reset` is provided by Next.js to attempt re-rendering the segment.
 */

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              padding: '2.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
              Application Error
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem' }}>
              A critical error occurred. The team has been notified.
            </p>

            {error.digest && (
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace', margin: '0 0 1.5rem' }}>
                Error ID: {error.digest}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: '#4f46e5',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <a
                href="/dashboard"
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
