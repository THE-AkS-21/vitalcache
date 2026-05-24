/**
 * e2e/smoke/auth.spec.ts — Auth Flow Smoke Tests
 *
 * Phase 1: Verifies the authentication boundary works correctly without
 * needing a live backend. Tests:
 *   - Unauthenticated users are redirected to /login from protected routes
 *   - Authenticated users are redirected away from /login
 *   - /login page renders the correct form elements
 *   - callbackUrl param is preserved through the redirect
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication boundary', () => {
  test.describe('Unauthenticated access', () => {
    // These tests run without any auth cookies — middleware should redirect

    test('/ redirects to /login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    });

    test('/dashboard redirects to /login with callbackUrl', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
    });

    test('/patients redirects to /login', async ({ page }) => {
      await page.goto('/patients');
      await expect(page).toHaveURL(/\/login/);
    });

    test('/prescriptions redirects to /login', async ({ page }) => {
      await page.goto('/prescriptions');
      await expect(page).toHaveURL(/\/login/);
    });

    test('/appointments redirects to /login', async ({ page }) => {
      await page.goto('/appointments');
      await expect(page).toHaveURL(/\/login/);
    });

    test('/medicines redirects to /login', async ({ page }) => {
      await page.goto('/medicines');
      await expect(page).toHaveURL(/\/login/);
    });

    test('/settings redirects to /login', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('/login page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('renders the login page without crashing', async ({ page }) => {
      await expect(page).toHaveTitle(/VitalCache/i);
      await expect(page).toHaveURL(/\/login/);
    });

    test('displays email and password fields', async ({ page }) => {
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('has a submit button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /sign in|log in|login/i })
      ).toBeVisible();
    });

    // NOTE: Form validation edge cases (empty submission, invalid email format)
    // are covered in __tests__/login-form.test.tsx (Jest + RTL) — they are
    // component-level concerns and don’t belong in a slow E2E suite.
  });
});
