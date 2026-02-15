const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
  const results = {
    test_name: 'pokemon-e2e-tests',
    status: 'passed',
    screenshots: [],
    error: null
  };

  const basePath = 'C:\\Users\\Manu\\Projects\\pokemon_database_agentic';
  const screenshotDir = `${basePath}\\agents\\20dbe011\\e2e_test_runner_1_0\\img\\pokemon_e2e_tests`;

  let browser;
  let context;
  let page;

  try {
    // Launch browser in headed mode
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    console.log('Starting E2E tests...\n');

    // Step 1: Verify Home Page Loads
    console.log('Step 1: Verify Home Page Loads');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    if (!title.includes('Pokémon Database') && !title.includes('Pokemon Database')) {
      throw new Error(`(Step 1 ❌) Page title "${title}" does not contain "Pokémon Database" or "Pokemon Database"`);
    }

    const searchInput = page.locator('input[placeholder*="Search Pokemon"]');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });

    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.waitFor({ state: 'visible', timeout: 5000 });

    const placeholderMessage = page.locator('text=Start searching to see results');
    await placeholderMessage.waitFor({ state: 'visible', timeout: 5000 });

    const screenshot1 = `${screenshotDir}\\01_home_page.png`;
    await page.screenshot({ path: screenshot1, fullPage: true });
    results.screenshots.push(screenshot1.replace(/\\/g, '/'));
    console.log('✓ Step 1 passed\n');

    // Step 2: Test Basic Pokemon Search
    console.log('Step 2: Test Basic Pokemon Search');
    await searchInput.fill('pikachu');
    await searchButton.click();

    // Wait for results to appear
    await page.waitForSelector('.results-list .result-item', { timeout: 10000 });

    const firstResult = page.locator('.results-list .result-item').first();
    const firstResultText = await firstResult.textContent();
    if (!firstResultText.toLowerCase().includes('pikachu')) {
      throw new Error(`(Step 2 ❌) First result "${firstResultText}" does not contain "pikachu"`);
    }

    const screenshot2 = `${screenshotDir}\\02_pikachu_search_results.png`;
    await page.screenshot({ path: screenshot2, fullPage: true });
    results.screenshots.push(screenshot2.replace(/\\/g, '/'));
    console.log('✓ Step 2 passed\n');

    // Step 3: Test Pokemon Detail View
    console.log('Step 3: Test Pokemon Detail View');
    await firstResult.click();
    await page.waitForTimeout(1000);

    const detailPanel = page.locator('.pokemon-detail');
    await detailPanel.waitFor({ state: 'visible', timeout: 5000 });

    const pokemonName = page.locator('.pokemon-name');
    await pokemonName.waitFor({ state: 'visible', timeout: 5000 });
    const nameText = await pokemonName.textContent();
    if (!nameText.toLowerCase().includes('pikachu')) {
      throw new Error(`(Step 3 ❌) Pokemon name "${nameText}" does not contain "pikachu"`);
    }

    const typeBadge = page.locator('.type-badge').first();
    await typeBadge.waitFor({ state: 'visible', timeout: 5000 });

    const pokemonImage = page.locator('.pokemon-sprite');
    await pokemonImage.waitFor({ state: 'visible', timeout: 5000 });

    const screenshot3 = `${screenshotDir}\\03_pikachu_details.png`;
    await page.screenshot({ path: screenshot3, fullPage: true });
    results.screenshots.push(screenshot3.replace(/\\/g, '/'));
    console.log('✓ Step 3 passed\n');

    // Step 4: Test Partial Name Search
    console.log('Step 4: Test Partial Name Search');
    await searchInput.clear();
    await searchInput.fill('char');
    await searchButton.click();
    await page.waitForTimeout(2000);

    const charResults = page.locator('.results-list .result-item');
    const charCount = await charResults.count();
    if (charCount <= 1) {
      throw new Error(`(Step 4 ❌) Expected multiple results for "char", but got ${charCount}`);
    }

    // Verify all visible results contain "char"
    for (let i = 0; i < Math.min(charCount, 5); i++) {
      const resultText = await charResults.nth(i).textContent();
      if (!resultText.toLowerCase().includes('char')) {
        throw new Error(`(Step 4 ❌) Result "${resultText}" does not contain "char"`);
      }
    }

    const screenshot4 = `${screenshotDir}\\04_partial_search_results.png`;
    await page.screenshot({ path: screenshot4, fullPage: true });
    results.screenshots.push(screenshot4.replace(/\\/g, '/'));
    console.log('✓ Step 4 passed\n');

    // Step 5: Test Single Result Auto-Display
    console.log('Step 5: Test Single Result Auto-Display');
    await searchInput.clear();
    await searchInput.fill('ditto');
    await searchButton.click();
    await page.waitForTimeout(2000);

    // For single result, details should auto-display
    const dittoName = page.locator('.pokemon-name');
    await dittoName.waitFor({ state: 'visible', timeout: 5000 });
    const dittoNameText = await dittoName.textContent();
    if (!dittoNameText.toLowerCase().includes('ditto')) {
      throw new Error(`(Step 5 ❌) Expected "ditto" to be displayed, but got "${dittoNameText}"`);
    }

    const screenshot5 = `${screenshotDir}\\05_ditto_auto_display.png`;
    await page.screenshot({ path: screenshot5, fullPage: true });
    results.screenshots.push(screenshot5.replace(/\\/g, '/'));
    console.log('✓ Step 5 passed\n');

    // Step 6: Test No Results Scenario
    console.log('Step 6: Test No Results Scenario');
    await searchInput.clear();
    await searchInput.fill('nonexistentpokemon123');
    await searchButton.click();
    await page.waitForTimeout(2000);

    const noResultsMessage = page.locator('.no-results-message');
    await noResultsMessage.waitFor({ state: 'visible', timeout: 5000 });

    const screenshot6 = `${screenshotDir}\\06_no_results.png`;
    await page.screenshot({ path: screenshot6, fullPage: true });
    results.screenshots.push(screenshot6.replace(/\\/g, '/'));
    console.log('✓ Step 6 passed\n');

    // Step 7: Test Enter Key Search
    console.log('Step 7: Test Enter Key Search');
    await searchInput.clear();
    await searchInput.fill('mewtwo');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);

    // Either results list or pokemon detail should be visible
    const mewtwoElement = page.locator('.results-list .result-item, .pokemon-name').first();
    await mewtwoElement.waitFor({ state: 'visible', timeout: 10000 });

    const screenshot7 = `${screenshotDir}\\07_enter_key_search.png`;
    await page.screenshot({ path: screenshot7, fullPage: true });
    results.screenshots.push(screenshot7.replace(/\\/g, '/'));
    console.log('✓ Step 7 passed\n');

    // Step 8: Test Clear Button
    console.log('Step 8: Test Clear Button');
    await searchInput.fill('pokemon');

    const clearButton = page.locator('.clear-btn');
    await clearButton.waitFor({ state: 'visible', timeout: 5000 });
    await clearButton.click();

    const inputValue = await searchInput.inputValue();
    if (inputValue !== '') {
      throw new Error(`(Step 8 ❌) Expected search input to be empty, but got "${inputValue}"`);
    }

    const screenshot8 = `${screenshotDir}\\08_clear_button.png`;
    await page.screenshot({ path: screenshot8, fullPage: true });
    results.screenshots.push(screenshot8.replace(/\\/g, '/'));
    console.log('✓ Step 8 passed\n');

    // Step 9: Test Result Selection Highlighting
    console.log('Step 9: Test Result Selection Highlighting');
    await searchInput.fill('eevee');
    await searchButton.click();
    await page.waitForTimeout(2000);

    const eeveeResult = page.locator('.results-list .result-item').first();
    await eeveeResult.waitFor({ state: 'visible', timeout: 5000 });
    await eeveeResult.click();
    await page.waitForTimeout(500);

    // Check if the result has a selected class
    const classList = await eeveeResult.getAttribute('class');
    if (!classList.includes('selected')) {
      throw new Error(`(Step 9 ❌) Expected result to have "selected" class, but got "${classList}"`);
    }

    const screenshot9 = `${screenshotDir}\\09_selected_result.png`;
    await page.screenshot({ path: screenshot9, fullPage: true });
    results.screenshots.push(screenshot9.replace(/\\/g, '/'));
    console.log('✓ Step 9 passed\n');

    // Step 10: Test Pagination (if applicable)
    console.log('Step 10: Test Pagination (if applicable)');
    await searchInput.clear();
    await searchInput.fill('a');
    await searchButton.click();
    await page.waitForTimeout(2000);

    // Check if pagination exists
    const paginationControls = page.locator('.pagination, [class*="pagination"]');
    const hasPagination = await paginationControls.count() > 0;

    if (hasPagination) {
      console.log('  Pagination detected');
      const pageInfo = page.locator('text=/page 1/i');
      await pageInfo.waitFor({ state: 'visible', timeout: 5000 });

      const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next"]');
      await nextButton.waitFor({ state: 'visible', timeout: 5000 });
      await nextButton.click();
      await page.waitForTimeout(1000);

      const page2Info = page.locator('text=/page 2/i');
      await page2Info.waitFor({ state: 'visible', timeout: 5000 });
      console.log('  Pagination navigation works');
    } else {
      console.log('  No pagination controls found (may not be implemented or fewer than 20 results)');
    }

    const screenshot10 = `${screenshotDir}\\10_pagination.png`;
    await page.screenshot({ path: screenshot10, fullPage: true });
    results.screenshots.push(screenshot10.replace(/\\/g, '/'));
    console.log('✓ Step 10 passed\n');

    console.log('All tests passed! ✓');

  } catch (error) {
    results.status = 'failed';
    results.error = error.message;
    console.error(`\n❌ Test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return results;
}

runTests().then(results => {
  console.log('\n=== Test Results ===');
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.status === 'passed' ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
