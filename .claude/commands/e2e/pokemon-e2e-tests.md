# Pokemon E2E Tests

Comprehensive end-to-end test suite validating the Pokemon database application functionality.

## User Story

As a user of the Pokemon database application, I want to search for Pokemon by name and view their details so that I can learn more about specific Pokemon.

## Test Steps

### Step 1: Verify Home Page Loads
- Navigate to http://localhost:3000
- **Verify** the page title contains "Pokémon Database"
- **Verify** the search input field is visible with placeholder "Search Pokemon..."
- **Verify** the search button is visible
- **Verify** the placeholder message "Start searching to see results" is displayed
- Take screenshot: `01_home_page.png`

### Step 2: Test Basic Pokemon Search
- Enter "pikachu" in the search input field
- Click the search button
- **Verify** search results appear within 10 seconds
- **Verify** the first result contains "pikachu" (case-insensitive)
- Take screenshot: `02_pikachu_search_results.png`

### Step 3: Test Pokemon Detail View
- Click on the first search result (pikachu)
- **Verify** the Pokemon detail panel displays
- **Verify** the Pokemon name "pikachu" is visible
- **Verify** at least one type badge is visible
- **Verify** the Pokemon sprite/image is displayed
- Take screenshot: `03_pikachu_details.png`

### Step 4: Test Partial Name Search
- Clear the search input
- Enter "char" in the search input
- Click the search button
- **Verify** multiple results are returned (more than 1)
- **Verify** all visible results contain "char" in their name
- Take screenshot: `04_partial_search_results.png`

### Step 5: Test Single Result Auto-Display
- Clear the search input
- Enter "ditto" in the search input
- Click the search button
- **Verify** the Pokemon details for "ditto" automatically display (single result behavior)
- **Verify** the Pokemon name "ditto" is visible
- Take screenshot: `05_ditto_auto_display.png`

### Step 6: Test No Results Scenario
- Clear the search input
- Enter "nonexistentpokemon123" in the search input
- Click the search button
- **Verify** a "No results found" message is displayed
- **Verify** no Pokemon details are shown
- Take screenshot: `06_no_results.png`

### Step 7: Test Enter Key Search
- Clear the search input
- Enter "mewtwo" in the search input
- Press the Enter key
- **Verify** search results appear for mewtwo
- Take screenshot: `07_enter_key_search.png`

### Step 8: Test Clear Button
- Enter "pokemon" in the search input
- **Verify** a clear button appears
- Click the clear button
- **Verify** the search input is empty
- Take screenshot: `08_clear_button.png`

### Step 9: Test Result Selection Highlighting
- Enter "eevee" in the search input
- Click the search button
- Wait for results to appear
- Click on the first result
- **Verify** the clicked result has a "selected" highlight style
- Take screenshot: `09_selected_result.png`

### Step 10: Test Pagination (if applicable)
- Clear the search input
- Enter "a" in the search input (will return many results)
- Click the search button
- Wait for results to appear
- **Verify** if pagination controls appear when there are more than 20 results
- If pagination is visible:
  - **Verify** pagination info shows "Page 1"
  - **Verify** "Next" button is present
  - Click the "Next" button
  - **Verify** pagination info updates to "Page 2"
- Take screenshot: `10_pagination.png`

## Success Criteria

- All test steps complete without errors
- Search functionality works with full names, partial names, and single results
- Pokemon details display correctly with name, types, and image
- No results scenario is handled gracefully
- Keyboard navigation (Enter key) works
- Clear button functions properly
- Result selection provides visual feedback
- Pagination works correctly when many results are returned

## Output Format

Return results in the following JSON format:

```json
{
  "test_name": "pokemon-e2e-tests",
  "status": "passed|failed",
  "screenshots": [
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/01_home_page.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/02_pikachu_search_results.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/03_pikachu_details.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/04_partial_search_results.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/05_ditto_auto_display.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/06_no_results.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/07_enter_key_search.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/08_clear_button.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/09_selected_result.png",
    "<absolute path>/agents/<adw_id>/<agent_name>/img/pokemon_e2e_tests/10_pagination.png"
  ],
  "error": null
}
```
