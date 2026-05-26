/**
 * e2e/smoke/protected-pages.spec.ts — Page-Level Smoke Tests (Authenticated)
 *
 * Phase 1: Verifies every protected route renders its primary content
 * (heading, key UI elements) when an authenticated session is present.
 *
 * Strategy:
 *   We use Playwright's storageState to inject a valid session cookie.
 *   The `authenticated` fixture sets the `refresh_token` HttpOnly cookie
 *   directly using page.context().addCookies(), bypassing the need for
 *   a live backend during smoke tests.
 *
 *   NOTE: These tests verify UI rendering only. They will show loading/empty
 *   states for data-driven sections (tables, lists) since no backend is running.
 *   That is intentional — smoke tests assert the page doesn't crash, not that
 *   data loads correctly (that's Phase 2 — full happy-path tests).
 */

import { test, expect, type Page } from '@playwright/test';

// ── Session Fixture ───────────────────────────────────────────────────────────
// Inject a fake refresh_token cookie so middleware lets us through.
// The cookie presence check in middleware.ts only checks `cookies.has('refresh_token')`.
// The actual token value is only validated by the Go backend on real API calls.
async function injectSessionCookie(page: Page) {
  await page.context().addCookies([
    {
      name: 'refresh_token',
      value: 'e2e-smoke-test-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false, // dev server is HTTP
      sameSite: 'Lax',
    },
  ]);
}

// ── Shared setup ──────────────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await injectSessionCookie(page);
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
test.describe('Dashboard page smoke test', () => {
  test('renders the Dashboard heading', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeVisible();
  });

  test('renders stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    // Stat card labels are rendered server-side — always visible
    await expect(page.getByText(/today.*appointments|appointments.*today/i)).toBeVisible();
    await expect(page.getByText(/total patients/i)).toBeVisible();
  });

  test('renders Upcoming Appointments section heading', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /upcoming appointments/i })).toBeVisible();
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await page.goto('/dashboard');
    // Sidebar renders server-side — should always be present
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

// ── Patients ──────────────────────────────────────────────────────────────────
test.describe('Patients page smoke test', () => {
  test('renders the Patients heading', async ({ page }) => {
    await page.goto('/patients');
    await expect(page.getByRole('heading', { name: /patients/i, level: 1 })).toBeVisible();
  });

  test('renders a "New Patient" or "Add Patient" button', async ({ page }) => {
    await page.goto('/patients');
    await expect(
      page.getByRole('button', { name: /new patient|add patient/i })
    ).toBeVisible();
  });
});

// ── Appointments ──────────────────────────────────────────────────────────────
test.describe('Appointments page smoke test', () => {
  test('renders the Appointments heading', async ({ page }) => {
    await page.goto('/appointments');
    await expect(page.getByRole('heading', { name: /appointments/i, level: 1 })).toBeVisible();
  });

  test('renders a "New Appointment" button', async ({ page }) => {
    await page.goto('/appointments');
    await expect(
      page.getByRole('button', { name: /new appointment/i })
    ).toBeVisible();
  });
});

// ── Prescriptions ─────────────────────────────────────────────────────────────
test.describe('Prescriptions page smoke test', () => {
  test('renders the Prescriptions heading', async ({ page }) => {
    await page.goto('/prescriptions');
    await expect(page.getByRole('heading', { name: /prescriptions/i, level: 1 })).toBeVisible();
  });
});

// ── Medicines ─────────────────────────────────────────────────────────────────
test.describe('Medicines page smoke test', () => {
  test('renders the Medicines heading', async ({ page }) => {
    await page.goto('/medicines');
    await expect(page.getByRole('heading', { name: /medicines/i, level: 1 })).toBeVisible();
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────
test.describe('Settings page smoke test', () => {
  test('renders the Settings heading', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /settings/i, level: 1 })).toBeVisible();
  });
});

// ── Certificates ──────────────────────────────────────────────────────────────
test.describe('Certificates page smoke test', () => {
  test('renders the Certificates heading', async ({ page }) => {
    await page.goto('/certificates');
    await expect(page.getByRole('heading', { name: /certificates/i, level: 1 })).toBeVisible();
  });
});

// ── Authenticated user cannot access /login ───────────────────────────────────
test.describe('Auth redirect (authenticated)', () => {
  test('redirects /login to /dashboard when session cookie is present', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
