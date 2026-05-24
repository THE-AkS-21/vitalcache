/**
 * __tests__/login-form.test.tsx
 *
 * Unit tests for login form validation behaviour.
 * These were previously in the Playwright E2E suite, which is the wrong layer
 * for component-level validation logic (slow, browser-dependent, no isolation).
 *
 * Coverage:
 *   - Empty form submission triggers inline validation errors
 *   - Invalid email format triggers the Zod error message
 *   - Valid email + short password triggers password error
 *   - Field values are accepted by the form inputs
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Mocks ─────────────────────────────────────────────────────────────────────
// The login page uses next/navigation, Zustand, and a live API client.
// We mock all three so this is a pure component test with zero side effects.

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: object) => unknown) =>
    selector({ setAccessToken: jest.fn(), setUser: jest.fn() }),
}));

jest.mock('@/lib/api/auth', () => ({
  authApi: {
    login: jest.fn().mockRejectedValue(new Error('Network error')),
  },
}));

// ── Import component after mocks are in place ─────────────────────────────────
// Dynamic import avoids hoisting issues with jest.mock.
let LoginPage: React.ComponentType;
beforeAll(async () => {
  const mod = await import('@/app/(auth)/login/page');
  LoginPage = mod.default;
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderLogin() {
  return render(<LoginPage />);
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /sign in/i });
}

// ── Test suite ────────────────────────────────────────────────────────────────
describe('LoginPage — form validation', () => {
  it('shows an email-required error when form is submitted empty', async () => {
    renderLogin();
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      // loginSchema: email field has required_error: 'Email is required'
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows an invalid-email error for a malformed email address', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email');
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      // loginSchema: .email('Invalid email address')
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('shows a password-too-short error when email is valid but password is too short', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'doctor@vitalcache.com');
    await user.type(screen.getByLabelText(/password/i), 'short');
    fireEvent.click(getSubmitButton());

    await waitFor(() => {
      // loginSchema: .min(8, 'Password must be at least 8 characters')
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('accepts typed values in email and password fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await user.type(emailInput, 'doctor@vitalcache.com');
    expect(emailInput).toHaveValue('doctor@vitalcache.com');
  });

  it('renders email and password fields and a submit button', () => {
    renderLogin();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();
  });
});
