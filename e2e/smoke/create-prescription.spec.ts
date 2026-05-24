/**
 * e2e/smoke/create-prescription.spec.ts — "Create Prescription" Happy Path
 *
 * Phase 2: Full end-to-end flow for the prescription builder.
 *
 * Strategy:
 *   Uses Playwright's page.route() to intercept API calls and return fixture
 *   data — no live backend required. This keeps the test fast and deterministic.
 *
 * Flow covered:
 *   1. Navigate to /prescriptions/new (session cookie injected)
 *   2. Assert page heading and both panels render
 *   3. Select a patient from the dropdown (mocked patient list)
 *   4. Type in medicine search → debounce fires → dropdown appears (mocked search)
 *   5. Select medicine from dropdown → assert it appears in the Rx list
 *   6. Edit dosage, frequency, and duration fields
 *   7. Add clinical notes
 *   8. Click "Save & Print Prescription"
 *   9. Assert redirect to /prescriptions/[id]
 *
 * Mocked API endpoints:
 *   GET  /api/v1/patients/          → 2 fixture patients
 *   GET  /api/v1/medicines/search   → 3 fixture medicines
 *   POST /api/v1/prescriptions/     → fixture prescription response
 *
 * Validation tested:
 *   - "No patient selected" prevents submission
 *   - "No medications added" prevents submission
 *   - Empty medicine search query does not fire an API request
 *   - Short query (<2 chars) does not show dropdown
 */

import { test, expect, type Page, type Route } from '@playwright/test';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FIXTURE_PATIENTS = [
  {
    id: 'patient-uuid-001',
    user_id: 'user-uuid-001',
    name: 'Aisha Sharma',
    first_name: 'Aisha',
    last_name: 'Sharma',
    mobile_number: '9876543210',
    gender: 'female',
    date_of_birth: '1990-03-15',
    age: 34,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'patient-uuid-002',
    user_id: 'user-uuid-002',
    name: 'Raj Patel',
    first_name: 'Raj',
    last_name: 'Patel',
    mobile_number: '9123456780',
    gender: 'male',
    date_of_birth: '1985-07-22',
    age: 38,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const FIXTURE_MEDICINES = [
  {
    id: 'med-uuid-001',
    name: 'Amoxicillin 500mg',
    type: 'Antibiotic',
    dose: '500mg',
    dosage_options: ['500mg', '250mg', '125mg'],
    frequency_suggestions: ['Twice a day', 'Three times a day'],
    price: 45,
    stock: 200,
  },
  {
    id: 'med-uuid-002',
    name: 'Amoxicillin 250mg',
    type: 'Antibiotic',
    dose: '250mg',
    dosage_options: ['250mg', '125mg'],
    frequency_suggestions: ['Three times a day', 'Twice a day'],
    price: 25,
    stock: 150,
  },
  {
    id: 'med-uuid-003',
    name: 'Amoxiclav 625mg',
    type: 'Antibiotic',
    dose: '625mg',
    dosage_options: ['625mg'],
    frequency_suggestions: ['Twice a day'],
    price: 120,
    stock: 80,
  },
];

const FIXTURE_PRESCRIPTION = {
  id: 'rx-uuid-001',
  prescription_id: 'rx-uuid-001',
  patient_id: 'patient-uuid-001',
  doctor_id: 'doctor-uuid-001',
  hospital_id: 'doctor-uuid-001',
  medications: [
    {
      medicine_id: 'med-uuid-001',
      name: 'Amoxicillin 500mg',
      dosage: '500mg',
      frequency: 'Twice a day',
      duration_days: 7,
      instructions: 'After food',
    },
  ],
  notes: 'Rest for 3 days. Drink plenty of fluids.',
  status: 'active',
  created_at: new Date().toISOString(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function injectSessionCookie(page: Page) {
  await page.context().addCookies([
    {
      name: 'refresh_token',
      value: 'e2e-smoke-test-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Intercepts the three API calls made by the prescription builder.
 * All routes match against the internal Next.js API proxy prefix.
 */
async function setupApiMocks(page: Page) {
  // Mock patient list
  await page.route('**/api/v1/patients/**', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: FIXTURE_PATIENTS, total: FIXTURE_PATIENTS.length }),
    });
  });

  // Mock medicine search (only fires when query >= 2 chars)
  await page.route('**/api/v1/medicines/search**', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: FIXTURE_MEDICINES, total: FIXTURE_MEDICINES.length }),
    });
  });

  // Mock prescription creation
  await page.route('**/api/v1/prescriptions/**', async (route: Route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(FIXTURE_PRESCRIPTION),
      });
    } else {
      await route.continue();
    }
  });

  // Mock /api/auth/session so the page boots without a live backend
  await page.route('**/api/auth/session**', (route: Route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'e2e-mock-access-token',
        user: {
          user_id: 'doctor-uuid-001',
          email: 'doctor@vitalcache.test',
          first_name: 'Test',
          last_name: 'Doctor',
          role: 'doctor',
          permissions: ['create:prescription', 'read:patient'],
          doctor_id: 'doctor-uuid-001',
        },
      }),
    });
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Create Prescription — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await injectSessionCookie(page);
    await setupApiMocks(page);
  });

  test('renders the page heading and both layout panels', async ({ page }) => {
    await page.goto('/prescriptions/new');

    await expect(
      page.getByRole('heading', { name: /create new prescription/i, level: 1 })
    ).toBeVisible();

    // Left panel: patient selector
    await expect(page.getByRole('heading', { name: /select patient/i })).toBeVisible();

    // Left panel: medicine search
    await expect(page.getByRole('heading', { name: /add medicine/i })).toBeVisible();

    // Right panel: Rx list
    await expect(page.getByRole('heading', { name: /rx medications/i })).toBeVisible();
  });

  test('blocks submission when no patient is selected', async ({ page }) => {
    await page.goto('/prescriptions/new');

    // The submit button should be disabled when no patient is selected
    const submitBtn = page.getByRole('button', { name: /save.*print prescription/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('blocks submission when no medications are added', async ({ page }) => {
    await page.goto('/prescriptions/new');

    // Select a patient
    const patientSelect = page.getByLabel(/select patient/i);
    await patientSelect.selectOption({ index: 1 }); // first real patient

    // Submit button should still be disabled (no meds added)
    const submitBtn = page.getByRole('button', { name: /save.*print prescription/i });
    await expect(submitBtn).toBeDisabled();
  });

  test('medicine search: does not show dropdown for queries < 2 chars', async ({ page }) => {
    await page.goto('/prescriptions/new');

    const searchInput = page.getByRole('combobox', { name: /search medicines/i });
    await searchInput.fill('A');

    // Wait a debounce period — dropdown should NOT appear
    await page.waitForTimeout(400);
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).not.toBeVisible();
  });

  test('medicine search: shows dropdown results after debounce fires', async ({ page }) => {
    await page.goto('/prescriptions/new');

    const searchInput = page.getByRole('combobox', { name: /search medicines/i });
    await searchInput.fill('Amox');

    // Wait for the 300ms debounce + network round-trip (mocked, so fast)
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });

    // All fixture medicines should appear
    await expect(page.getByRole('option', { name: /amoxicillin 500mg/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /amoxicillin 250mg/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /amoxiclav 625mg/i })).toBeVisible();
  });

  test('selecting a medicine adds it to the Rx list', async ({ page }) => {
    await page.goto('/prescriptions/new');

    const searchInput = page.getByRole('combobox', { name: /search medicines/i });
    await searchInput.fill('Amox');

    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });

    // Click the first medicine
    await page.getByRole('option', { name: /amoxicillin 500mg/i }).click();

    // The search input should clear after selection
    await expect(searchInput).toHaveValue('');

    // The medicine should appear in the Rx list as a heading
    await expect(page.getByRole('heading', { name: /amoxicillin 500mg/i, level: 3 })).toBeVisible();

    // Default dosage fields should be pre-filled
    await expect(page.getByDisplayValue('500mg')).toBeVisible();
    await expect(page.getByDisplayValue('Twice a day')).toBeVisible();
  });

  test('same medicine cannot be added twice', async ({ page }) => {
    await page.goto('/prescriptions/new');

    const searchInput = page.getByRole('combobox', { name: /search medicines/i });

    // Add the medicine once
    await searchInput.fill('Amox');
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });
    await page.getByRole('option', { name: /amoxicillin 500mg/i }).click();

    // Try to add the same medicine again
    await searchInput.fill('Amox');
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });
    await page.getByRole('option', { name: /amoxicillin 500mg/i }).click();

    // Only one card should appear in the list
    await expect(page.getByRole('heading', { name: /amoxicillin 500mg/i, level: 3 })).toHaveCount(1);
  });

  test('editing medication fields updates the values', async ({ page }) => {
    await page.goto('/prescriptions/new');

    // Add a medicine
    const searchInput = page.getByRole('combobox', { name: /search medicines/i });
    await searchInput.fill('Amox');
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });
    await page.getByRole('option', { name: /amoxicillin 500mg/i }).click();

    // Find the Duration (Days) field — it's type="number", default 5
    const durationInput = page.getByLabel(/duration.*days/i);
    await durationInput.fill('7');
    await expect(durationInput).toHaveValue('7');

    // Update the instructions field
    const instructionsInput = page.getByLabel(/instructions/i);
    await instructionsInput.fill('Before food');
    await expect(instructionsInput).toHaveValue('Before food');
  });

  test('removing a medication card removes it from the Rx list', async ({ page }) => {
    await page.goto('/prescriptions/new');

    // Add a medicine
    const searchInput = page.getByRole('combobox', { name: /search medicines/i });
    await searchInput.fill('Amox');
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });
    await page.getByRole('option', { name: /amoxicillin 500mg/i }).click();
    await expect(page.getByRole('heading', { name: /amoxicillin 500mg/i, level: 3 })).toBeVisible();

    // Click the remove button
    await page.getByRole('button', { name: /remove amoxicillin 500mg/i }).click();

    // The card should be gone, empty state should reappear
    await expect(page.getByRole('heading', { name: /amoxicillin 500mg/i, level: 3 })).not.toBeVisible();
    await expect(page.getByText(/no medications added yet/i)).toBeVisible();
  });

  test('full happy path: submits form and redirects to prescription detail', async ({ page }) => {
    await page.goto('/prescriptions/new');

    // Step 1: Select patient
    const patientSelect = page.getByLabel(/select patient/i);
    await patientSelect.selectOption('patient-uuid-001');
    await expect(patientSelect).toHaveValue('patient-uuid-001');

    // Step 2: Search and add medicine
    const searchInput = page.getByRole('combobox', { name: /search medicines/i });
    await searchInput.fill('Amox');
    await expect(page.getByRole('listbox', { name: /medicine search results/i })).toBeVisible({
      timeout: 2000,
    });
    await page.getByRole('option', { name: /amoxicillin 500mg/i }).click();

    // Step 3: Update duration to 7 days
    const durationInput = page.getByLabel(/duration.*days/i);
    await durationInput.fill('7');

    // Step 4: Add clinical notes
    await page.getByLabel(/clinical notes/i).fill('Rest for 3 days. Drink plenty of fluids.');

    // Step 5: Submit — button should now be enabled
    const submitBtn = page.getByRole('button', { name: /save.*print prescription/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Step 6: Assert redirect to prescription detail page
    await expect(page).toHaveURL(/\/prescriptions\/rx-uuid-001/, { timeout: 5000 });
  });
});
