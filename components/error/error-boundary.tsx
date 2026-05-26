'use client';

/**
 * GlobalErrorBoundary
 *
 * Catches any unhandled render error in the React tree below it.
 * Placed at the root of the protected layout so every page is covered.
 *
 * Why a class component?
 * React's getDerivedStateFromError and componentDidCatch are only available
 * on class components — there is no hook equivalent as of React 18.
 *
 * Usage:
 *   <GlobalErrorBoundary>
 *     <YourPageTree />
 *   </GlobalErrorBoundary>
 *
 * The fallback is intentionally simple — enough for the user to understand
 * something went wrong and to have a clear recovery action (reload or go home).
 */

import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback. Defaults to the built-in error UI. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    // In production, send to your error tracking (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center p-8 bg-slate-50"
        >
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center space-y-5">
            {/* Icon */}
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-sm text-gray-500 mt-2">
                An unexpected error occurred while rendering this page.
              </p>
              {this.state.errorMessage && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-mono break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Try again
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * QueryErrorBoundary — lightweight boundary for React Query suspense errors.
 * Wraps individual data-fetching sections (tables, cards) rather than full pages.
 *
 * Usage:
 *   <QueryErrorBoundary message="Failed to load patients">
 *     <PatientsTable />
 *   </QueryErrorBoundary>
 */
interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  message?: string;
}

interface QueryErrorBoundaryState {
  hasError: boolean;
}

export class QueryErrorBoundary extends React.Component<
  QueryErrorBoundaryProps,
  QueryErrorBoundaryState
> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): QueryErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error('[QueryErrorBoundary]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{this.props.message ?? 'Failed to load data. Please refresh the page.'}</span>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
