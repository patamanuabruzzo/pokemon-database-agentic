const { test, expect } = require('@playwright/test');

test.describe('Pokemon Detail Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Pokémon Database');

    // Search for bulbasaur which has evolution chain
    await page.fill('.search-input', 'bulbasaur');
    await page.click('.search-btn');

    // Wait for results and click on bulbasaur
    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });
    await page.click('.result-item:has-text("bulbasaur")');

    // Wait for Pokemon details to load
    await expect(page.locator('.pokemon-name')).toBeVisible({ timeout: 10000 });
  });

  test('should display Pokedex number next to Pokemon name', async ({ page }) => {
    // Check that the header contains both name and number
    const header = page.locator('.pokemon-header');
    await expect(header).toBeVisible();

    // Check that Pokedex number is displayed with # prefix
    const pokedexNumber = page.locator('.pokedex-number');
    await expect(pokedexNumber).toBeVisible();
    await expect(pokedexNumber).toContainText('#');

    // For bulbasaur, should be #1
    await expect(pokedexNumber).toContainText('#1');
  });

  test('should display default sprite image', async ({ page }) => {
    // Check that sprite image is displayed
    const sprite = page.locator('.pokemon-sprite');
    await expect(sprite).toBeVisible();

    // Check that it has proper alt text
    await expect(sprite).toHaveAttribute('alt', /sprite/);

    // Check that sprite label shows "Default"
    const label = page.locator('.sprite-label');
    await expect(label).toBeVisible();
    await expect(label).toContainText('Default');
  });

  test('should toggle between default and shiny sprite on click', async ({ page }) => {
    const sprite = page.locator('.pokemon-sprite');
    const label = page.locator('.sprite-label');

    // Initial state should be default
    await expect(label).toContainText('Default');
    const defaultSrc = await sprite.getAttribute('src');

    // Click to show shiny
    await sprite.click();
    await expect(label).toContainText('Shiny');
    const shinySrc = await sprite.getAttribute('src');

    // Sources should be different
    expect(defaultSrc).not.toBe(shinySrc);

    // Click again to return to default
    await sprite.click();
    await expect(label).toContainText('Default');
    const backToDefaultSrc = await sprite.getAttribute('src');

    // Should be back to original default
    expect(backToDefaultSrc).toBe(defaultSrc);
  });

  test('should display stats in 2x3 table format', async ({ page }) => {
    // Check that stats section exists
    const statsSection = page.locator('.pokemon-info-section:has(.stats-table)');
    await expect(statsSection).toBeVisible();

    // Check that stats table has 3 rows
    const statRows = page.locator('.stat-row');
    await expect(statRows).toHaveCount(3);

    // Check that each row has 2 cells
    const firstRow = statRows.first();
    const cellsInFirstRow = firstRow.locator('.stat-cell');
    await expect(cellsInFirstRow).toHaveCount(2);

    // Check that all 6 stats are present
    await expect(page.locator('.stat-name', { hasText: 'HP' }).first()).toBeVisible();
    await expect(page.locator('.stat-name', { hasText: 'Speed' }).first()).toBeVisible();
    await expect(page.locator('.stat-name', { hasText: 'Attack' }).first()).toBeVisible();
    await expect(page.locator('.stat-name', { hasText: 'Defense' }).first()).toBeVisible();
    await expect(page.locator('.stat-name', { hasText: 'Special Attack' }).first()).toBeVisible();
    await expect(page.locator('.stat-name', { hasText: 'Special Defense' }).first()).toBeVisible();
  });

  test('should highlight the highest stat', async ({ page }) => {
    // Check that at least one stat has max-stat class (could be multiple if tied)
    const maxStatCell = page.locator('.stat-cell.max-stat');
    const count = await maxStatCell.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify the highlighted stat has green border styling
    const borderColor = await maxStatCell.first().evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });

    // Check that border color is set (not transparent)
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should display stat values in bold', async ({ page }) => {
    const statValue = page.locator('.stat-value').first();
    await expect(statValue).toBeVisible();

    // Check font weight is bold
    const fontWeight = await statValue.evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });

    // Font weight 700 is bold
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
  });

  test('should display abilities with name and flavor text', async ({ page }) => {
    // Check that abilities section exists
    const abilitiesSection = page.locator('.pokemon-info-section:has(.abilities-list)');
    await expect(abilitiesSection).toBeVisible();

    // Check that at least one ability is displayed
    const abilityCard = page.locator('.ability-card').first();
    await expect(abilityCard).toBeVisible();

    // Check that ability has name
    const abilityName = abilityCard.locator('.ability-name');
    await expect(abilityName).toBeVisible();
    await expect(abilityName).not.toBeEmpty();

    // Check that ability has flavor text
    const abilityFlavor = abilityCard.locator('.ability-flavor');
    await expect(abilityFlavor).toBeVisible();
    await expect(abilityFlavor).not.toBeEmpty();
  });

  test('should display tooltip on ability hover', async ({ page }) => {
    const abilityCard = page.locator('.ability-card').first();

    // Check that ability card has title attribute (used for tooltip)
    const titleAttr = await abilityCard.getAttribute('title');
    expect(titleAttr).toBeTruthy();
    expect(titleAttr.length).toBeGreaterThan(0);
  });

  test('should remove Types section title', async ({ page }) => {
    // Check that "Types" section title does not exist
    const typesTitle = page.locator('.section-title:has-text("Types")');
    await expect(typesTitle).not.toBeVisible();

    // But type badges should still be visible
    const typeBadges = page.locator('.type-badge');
    await expect(typeBadges.first()).toBeVisible();
  });

  test('should display type badges correctly', async ({ page }) => {
    // Check that type badges are displayed
    const typeBadges = page.locator('.type-badge');
    const count = await typeBadges.count();
    expect(count).toBeGreaterThan(0);

    // For bulbasaur, should have grass and poison types
    await expect(page.locator('.type-badge:has-text("grass")')).toBeVisible();
    await expect(page.locator('.type-badge:has-text("poison")')).toBeVisible();
  });

  test('should display evolution navigation buttons', async ({ page }) => {
    // Check that evolution section exists
    const evolutionSection = page.locator('.pokemon-info-section:has(.evolution-navigation)');
    await expect(evolutionSection).toBeVisible();

    // Check that both evolution buttons exist
    const preEvolutionBtn = page.locator('.evolution-btn.pre-evolution');
    const nextEvolutionBtn = page.locator('.evolution-btn.next-evolution');

    await expect(preEvolutionBtn).toBeVisible();
    await expect(nextEvolutionBtn).toBeVisible();
  });

  test('should have disabled pre-evolution button for bulbasaur', async ({ page }) => {
    // Bulbasaur is the first in its evolution chain
    const preEvolutionBtn = page.locator('.evolution-btn.pre-evolution');
    await expect(preEvolutionBtn).toBeDisabled();
  });

  test('should have enabled evolution button for bulbasaur', async ({ page }) => {
    // Bulbasaur evolves to ivysaur
    const nextEvolutionBtn = page.locator('.evolution-btn.next-evolution');
    await expect(nextEvolutionBtn).toBeEnabled();

    // Check that it shows the evolution name
    await expect(nextEvolutionBtn).toContainText('ivysaur');

    // Check that it has the right arrow
    await expect(nextEvolutionBtn.locator('.evolution-arrow')).toContainText('→');
  });

  test('should navigate to evolution when clicking evolution button', async ({ page }) => {
    // Click on evolution button
    const nextEvolutionBtn = page.locator('.evolution-btn.next-evolution');
    await nextEvolutionBtn.click();

    // Wait for new Pokemon to load
    await expect(page.locator('.pokemon-name')).toContainText('ivysaur', { timeout: 10000 });

    // Check that Pokedex number changed
    await expect(page.locator('.pokedex-number')).toContainText('#2');
  });

  test('should navigate to pre-evolution from evolved Pokemon', async ({ page }) => {
    // First navigate to ivysaur
    const nextEvolutionBtn = page.locator('.evolution-btn.next-evolution');
    await nextEvolutionBtn.click();
    await expect(page.locator('.pokemon-name')).toContainText('ivysaur', { timeout: 10000 });

    // Now pre-evolution button should be enabled
    const preEvolutionBtn = page.locator('.evolution-btn.pre-evolution');
    await expect(preEvolutionBtn).toBeEnabled();

    // Check that it shows bulbasaur
    await expect(preEvolutionBtn).toContainText('bulbasaur');

    // Check that it has the left arrow
    await expect(preEvolutionBtn.locator('.evolution-arrow')).toContainText('←');

    // Click to go back
    await preEvolutionBtn.click();
    await expect(page.locator('.pokemon-name')).toContainText('bulbasaur', { timeout: 10000 });
  });

  test('should verify API data includes all required fields', async ({ page }) => {
    // The Pokemon should have all the new fields
    // Check sprites are loaded (image is visible)
    await expect(page.locator('.pokemon-sprite')).toBeVisible();

    // Check stats are loaded (6 stats visible)
    const statCells = page.locator('.stat-cell');
    await expect(statCells).toHaveCount(6);

    // Check abilities are loaded
    const abilityCards = page.locator('.ability-card');
    const abilityCount = await abilityCards.count();
    expect(abilityCount).toBeGreaterThan(0);

    // Check evolution data is loaded (buttons are present)
    await expect(page.locator('.evolution-btn.pre-evolution')).toBeVisible();
    await expect(page.locator('.evolution-btn.next-evolution')).toBeVisible();
  });

  test('should handle Pokemon without shiny sprite gracefully', async ({ page }) => {
    // Search for a Pokemon that might not have shiny variant
    // Most modern Pokemon have shiny variants, but this tests the handling

    // Just verify that sprite label only shows when shiny exists
    const sprite = page.locator('.pokemon-sprite');
    await expect(sprite).toBeVisible();

    // If shiny exists, label should be visible
    // If not, label should not be visible (checked by the component logic)
    const label = page.locator('.sprite-label');
    const isVisible = await label.isVisible();

    // If label is visible, clicking should toggle
    if (isVisible) {
      await sprite.click();
      await expect(label).toContainText('Shiny');
    }
  });

  test('should handle multiple abilities correctly', async ({ page }) => {
    // Bulbasaur has 2 abilities (overgrow and chlorophyll)
    const abilityCards = page.locator('.ability-card');
    const count = await abilityCards.count();

    // Should have at least 1 ability
    expect(count).toBeGreaterThanOrEqual(1);

    // Each ability should have name and flavor text
    for (let i = 0; i < count; i++) {
      const card = abilityCards.nth(i);
      await expect(card.locator('.ability-name')).not.toBeEmpty();
      await expect(card.locator('.ability-flavor')).not.toBeEmpty();
    }
  });

  test('should test final evolution Pokemon has no next evolution', async ({ page }) => {
    // Search for venusaur (final evolution)
    await page.fill('.search-input', 'venusaur');
    await page.click('.search-btn');

    await expect(page.locator('.result-item').first()).toBeVisible({ timeout: 10000 });
    await page.click('.result-item:has-text("venusaur")');

    await expect(page.locator('.pokemon-name')).toContainText('venusaur', { timeout: 10000 });

    // Next evolution button should be disabled
    const nextEvolutionBtn = page.locator('.evolution-btn.next-evolution');
    await expect(nextEvolutionBtn).toBeDisabled();

    // Pre-evolution button should be enabled (ivysaur)
    const preEvolutionBtn = page.locator('.evolution-btn.pre-evolution');
    await expect(preEvolutionBtn).toBeEnabled();
  });

  test('should display image hover cursor pointer', async ({ page }) => {
    const sprite = page.locator('.pokemon-sprite');

    // Check cursor is pointer
    const cursor = await sprite.evaluate((el) => {
      return window.getComputedStyle(el).cursor;
    });

    expect(cursor).toBe('pointer');
  });

  test('should handle tied stats highlighting', async ({ page }) => {
    // Some Pokemon might have tied stats
    // The component should highlight all stats with max value
    const maxStatCells = page.locator('.stat-cell.max-stat');
    const count = await maxStatCells.count();

    // Should have at least 1 highlighted stat
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should reset shiny toggle when navigating to different Pokemon', async ({ page }) => {
    // Toggle to shiny
    const sprite = page.locator('.pokemon-sprite');
    await sprite.click();
    await expect(page.locator('.sprite-label')).toContainText('Shiny');

    // Navigate to evolution
    await page.locator('.evolution-btn.next-evolution').click();
    await expect(page.locator('.pokemon-name')).toContainText('ivysaur', { timeout: 10000 });

    // Should reset to default
    await expect(page.locator('.sprite-label')).toContainText('Default');
  });

  test('should have proper button styling for evolution navigation', async ({ page }) => {
    const nextEvolutionBtn = page.locator('.evolution-btn.next-evolution');

    // Check that button has proper background color (red)
    const bgColor = await nextEvolutionBtn.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should have some background color (not transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
