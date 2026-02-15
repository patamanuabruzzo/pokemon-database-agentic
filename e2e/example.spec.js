// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Example E2E test for Pokemon Database
 *
 * This is a placeholder test to demonstrate the setup.
 * Replace with actual tests for Pokemon search functionality.
 */

test.describe('Pokemon Database', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the title contains "Pokémon"
    await expect(page).toHaveTitle(/Pokémon/);

    // Check that the header is visible
    const header = page.locator('h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Pokémon');
  });

  test('API health check works', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });
});
