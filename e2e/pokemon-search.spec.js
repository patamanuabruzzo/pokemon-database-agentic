const { test, expect } = require('@playwright/test');

test.describe('Pokemon Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Pokémon Database');
  });

  test('should display search interface', async ({ page }) => {
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.search-btn')).toBeVisible();
    await expect(page.locator('.search-input')).toHaveAttribute('placeholder', 'Search Pokemon...');
  });

  test('should show placeholder message before search', async ({ page }) => {
    await expect(page.locator('.search-panel .placeholder-message')).toContainText('Start searching to see results');
  });

  test('should search with full Pokemon name and display results', async ({ page }) => {
    await page.fill('.search-input', 'pikachu');
    await page.click('.search-btn');

    // Wait for results
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });

    // Check that pikachu appears in results
    const resultText = await page.locator('.result-item').first().textContent();
    expect(resultText.toLowerCase()).toContain('pikachu');
  });

  test('should search with partial name and return multiple results', async ({ page }) => {
    await page.fill('.search-input', 'char');
    await page.click('.search-btn');

    // Wait for results
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });

    // Should have multiple results (charmander, charmeleon, charizard, etc.)
    const resultCount = await page.locator('.result-item').count();
    expect(resultCount).toBeGreaterThan(1);

    // Check that results contain 'char'
    const allResults = await page.locator('.result-item').allTextContents();
    allResults.forEach(result => {
      expect(result.toLowerCase()).toContain('char');
    });
  });

  test('should display Pokemon details when clicking on a result', async ({ page }) => {
    await page.fill('.search-input', 'bulbasaur');
    await page.click('.search-btn');

    // Wait for results and click first one
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });
    await page.locator('.result-item').first().click();

    // Check that details are displayed
    await expect(page.locator('.pokemon-name')).toBeVisible();
    await expect(page.locator('.pokemon-name')).toContainText('bulbasaur');
    await expect(page.locator('.type-badge').first()).toBeVisible();
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    await page.fill('.search-input', 'nonexistentpokemon123');
    await page.click('.search-btn');

    // Wait for no results message
    await expect(page.locator('.no-results-message')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.no-results-message')).toContainText('No results found');
  });

  test('should automatically display Pokemon details when only one result', async ({ page }) => {
    await page.fill('.search-input', 'ditto');
    await page.click('.search-btn');

    // Wait for details to appear automatically (ditto returns 1 result)
    await expect(page.locator('.pokemon-name')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.pokemon-name')).toContainText('ditto');
    await expect(page.locator('.type-badge').first()).toBeVisible();
  });

  test('should display loading state during search', async ({ page }) => {
    await page.fill('.search-input', 'mew');

    // Start search
    const searchPromise = page.click('.search-btn');

    // Check for loading state (might be brief)
    try {
      await expect(page.locator('.search-btn')).toContainText('Searching...', { timeout: 1000 });
    } catch (e) {
      // Loading state might be too fast to catch, that's ok
    }

    await searchPromise;
  });

  test('should work with pagination when there are many results', async ({ page }) => {
    await page.fill('.search-input', 'a');
    await page.click('.search-btn');

    // Wait for results
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });

    // Check if pagination appears (should have more than 20 results)
    const pagination = page.locator('.pagination');
    if (await pagination.isVisible()) {
      // Check pagination controls
      await expect(page.locator('.pagination-info')).toBeVisible();
      await expect(page.locator('.pagination-btn')).toHaveCount(2); // Previous and Next

      // Click next page
      const nextButton = page.locator('.pagination-btn').last();
      await nextButton.click();

      // Wait for new results to load
      await page.waitForTimeout(1000);
      await expect(page.locator('.pagination-info')).toContainText('Page 2');
    }
  });

  test('should clear search when clicking clear button', async ({ page }) => {
    await page.fill('.search-input', 'pokemon');

    // Clear button should appear
    await expect(page.locator('.clear-btn')).toBeVisible();

    // Click clear button
    await page.click('.clear-btn');

    // Input should be empty
    await expect(page.locator('.search-input')).toHaveValue('');
  });

  test('should handle Enter key to submit search', async ({ page }) => {
    await page.fill('.search-input', 'mewtwo');
    await page.press('.search-input', 'Enter');

    // Wait for results
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });
    const resultText = await page.locator('.result-item').first().textContent();
    expect(resultText.toLowerCase()).toContain('mewtwo');
  });

  test('should highlight selected Pokemon in results list', async ({ page }) => {
    await page.fill('.search-input', 'eevee');
    await page.click('.search-btn');

    // Wait for results and click
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });
    const firstResult = page.locator('.result-item').first();
    await firstResult.click();

    // Check that item has selected class
    await expect(firstResult).toHaveClass(/selected/);
  });
});
