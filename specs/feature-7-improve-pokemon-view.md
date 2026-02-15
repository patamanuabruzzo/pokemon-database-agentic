# Feature: Improve Pokemon View

## Feature Description
Enhance the Pokemon detail view to display comprehensive information in a friendly, well-organized layout. The current implementation shows only basic information (name, types, and simple stats). This feature will add sprite images with shiny toggle functionality, a structured stats table with highlighting, detailed abilities with tooltips, and evolution chain navigation buttons. The enhancement will create a richer, more interactive experience that helps users explore Pokemon data more effectively.

## User Story
As a Pokemon database user
I want to view comprehensive Pokemon information in a well-organized layout with interactive elements
So that I can easily understand Pokemon characteristics, abilities, and evolution relationships

## Problem Statement
The current Pokemon detail view is minimal and doesn't leverage the rich data available from the PokeAPI. Users cannot:
- See what Pokemon look like (no sprite images)
- Easily compare stats or identify strongest attributes
- Understand ability effects without navigating away
- Navigate through evolution chains
- View shiny variants
- See the Pokedex number prominently displayed

This limited presentation makes it difficult for users to get a complete picture of a Pokemon's characteristics and relationships.

## Solution Statement
Transform the Pokemon detail view into a comprehensive information display by:
- Adding the Pokedex number next to the Pokemon name (right-aligned)
- Displaying Pokemon sprite images (default and shiny variants) with click-to-toggle functionality
- Restructuring stats into a 2x3 table layout with the highest stat highlighted
- Showing abilities with their flavor text and hover tooltips for full descriptions
- Adding evolution navigation buttons (pre-evolution and evolution) with appropriate arrows
- Removing redundant "Types" section title for cleaner presentation
- Fetching additional data from PokeAPI (sprites, stats, abilities, species/evolution chain)
- Creating comprehensive E2E tests for all new interactive features

## Relevant Files
Use these files to implement the feature:

- **app/server/src/services/pokeapi.js** - Service layer for PokeAPI integration. Currently fetches basic Pokemon data (name, types, id, height, weight). Needs to be extended to fetch sprites, stats, abilities, and species/evolution chain data.

- **app/server/src/routes/pokemon.js** - API route handler for Pokemon endpoints. Passes through data from pokeapi service. May need updates if response structure changes significantly.

- **app/client/src/utils/api.js** - Client-side API utility for fetching Pokemon data. Should continue to work with enhanced data structure from backend.

- **app/client/src/components/PokemonDetail/PokemonDetail.jsx** - Main Pokemon detail component. Needs significant updates to display: Pokedex number, sprite images with toggle, stats table, abilities with tooltips, and evolution navigation.

- **app/client/src/components/PokemonDetail/PokemonDetail.css** - Styles for Pokemon detail component. Needs new styles for: image display, stats table layout, ability cards with tooltips, evolution navigation buttons, and highlight colors.

- **app/client/src/App.jsx** - Main app component managing state and navigation. May need minor updates if evolution navigation requires Pokemon selection changes.

### New Files
- **e2e/pokemon-detail-enhancements.spec.js** - E2E test suite for new Pokemon detail functionality including image toggle, ability tooltips, stat highlighting, evolution navigation, and API data validation.

## Implementation Plan

### Phase 1: Foundation
Extend the backend API service to fetch comprehensive Pokemon data from PokeAPI. This includes sprites (default and shiny), base stats, abilities with descriptions, and species data for evolution chain information. Update the data transformation layer to structure this information for frontend consumption while maintaining backwards compatibility.

### Phase 2: Core Implementation
Transform the Pokemon detail component to display the enhanced data in an organized layout. Implement the 2x3 stats table with highlighting logic, sprite image display with toggle functionality, ability cards with hover tooltips, and visual layout improvements. Add state management for image toggle between default and shiny sprites.

### Phase 3: Integration
Add evolution chain navigation by fetching species data and implementing navigation buttons that trigger Pokemon selection changes. Integrate with existing App.jsx state management to ensure smooth navigation. Create comprehensive E2E tests to validate all interactive features and data accuracy.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extend Backend API - Fetch Additional Pokemon Data
- Open `app/server/src/services/pokeapi.js`
- Update the `getPokemonByName` function to fetch additional data from the Pokemon API response:
  - Sprites: `response.data.sprites.front_default` and `response.data.sprites.front_shiny`
  - Stats: `response.data.stats` array (hp, attack, defense, special-attack, special-defense, speed)
  - Abilities: `response.data.abilities` array with ability names and URLs
- Add a new function `getAbilityDetails(abilityUrl)` to fetch ability descriptions from the PokeAPI:
  - Fetch from ability URL
  - Extract `flavor_text_entries` (short description) in English
  - Extract `effect_entries` (full effect description) in English
  - Return both flavor text and effect text
- Add a new function `getSpeciesData(pokemonId)` to fetch evolution chain information:
  - Fetch from `https://pokeapi.co/api/v2/pokemon-species/{id}`
  - Extract `evolution_chain.url`
  - Fetch evolution chain from that URL
  - Parse the chain to identify pre-evolution and evolution Pokemon names
  - Return an object with `preEvolution` and `evolution` properties
- Update the `getPokemonByName` return object to include:
  - `sprites: { default: string, shiny: string }`
  - `stats: [{ name: string, value: number }]`
  - `abilities: [{ name: string, flavorText: string, effect: string }]`
  - `evolution: { preEvolution: string|null, evolution: string|null }`
- Add proper error handling for cases where sprites, abilities, or evolution data are not available
- Ensure all API calls have appropriate timeouts

### 2. Update Pokemon Detail Component - Add State for Image Toggle
- Open `app/client/src/components/PokemonDetail/PokemonDetail.jsx`
- Import `useState` from React at the top of the file
- Add state variable: `const [showShiny, setShowShiny] = useState(false);`
- Add effect to reset shiny state when Pokemon changes: `useEffect(() => { setShowShiny(false); }, [pokemon?.name]);`
- Create toggle handler: `const handleImageClick = () => { setShowShiny(!showShiny); };`

### 3. Update Pokemon Detail Component - Redesign Layout Structure
- In `app/client/src/components/PokemonDetail/PokemonDetail.jsx`, restructure the JSX:
  - Move Pokedex number next to the Pokemon name (in header section)
  - Add image section below the name (before types)
  - Remove the "Types" h2 section title, keep just the badges
  - Add stats section with 2x3 table layout below types
  - Add abilities section below stats
  - Add evolution navigation section at the bottom
- Implement the header with name and Pokedex number:
  ```jsx
  <div className="pokemon-header">
    <h1 className="pokemon-name">{pokemon.name}</h1>
    {pokemon.id && <span className="pokedex-number">#{pokemon.id}</span>}
  </div>
  ```

### 4. Update Pokemon Detail Component - Add Sprite Image Display
- Add image section after the header:
  ```jsx
  <div className="pokemon-image-section">
    {pokemon.sprites?.default ? (
      <img
        src={showShiny && pokemon.sprites.shiny ? pokemon.sprites.shiny : pokemon.sprites.default}
        alt={`${pokemon.name} sprite`}
        className="pokemon-sprite"
        onClick={handleImageClick}
        title={showShiny ? "Click to show default sprite" : "Click to show shiny sprite"}
      />
    ) : (
      <div className="no-image-message">No image available</div>
    )}
    {pokemon.sprites?.shiny && (
      <div className="sprite-label">{showShiny ? "Shiny" : "Default"}</div>
    )}
  </div>
  ```

### 5. Update Pokemon Detail Component - Add Stats Table with Highlighting
- Calculate the maximum stat value to determine which stat to highlight
- Add stats section with 2x3 table layout:
  ```jsx
  {pokemon.stats && pokemon.stats.length > 0 && (
    <div className="pokemon-info-section">
      <h2 className="section-title">Stats</h2>
      <div className="stats-table">
        <div className="stat-row">
          <div className={`stat-cell ${isMaxStat('hp')}`}>
            <span className="stat-name">HP</span>
            <span className="stat-value">{getStatValue('hp')}</span>
          </div>
          <div className={`stat-cell ${isMaxStat('speed')}`}>
            <span className="stat-name">Speed</span>
            <span className="stat-value">{getStatValue('speed')}</span>
          </div>
        </div>
        {/* Repeat for attack/defense, special-attack/special-defense */}
      </div>
    </div>
  )}
  ```
- Add helper functions to get stat values and determine max stat
- Ensure stat values are displayed in bold

### 6. Update Pokemon Detail Component - Add Abilities with Tooltips
- Add abilities section below stats:
  ```jsx
  {pokemon.abilities && pokemon.abilities.length > 0 && (
    <div className="pokemon-info-section">
      <h2 className="section-title">Abilities</h2>
      <div className="abilities-list">
        {pokemon.abilities.map((ability, index) => (
          <div key={index} className="ability-card" title={ability.effect}>
            <div className="ability-name">{ability.name}</div>
            <div className="ability-flavor">{ability.flavorText}</div>
          </div>
        ))}
      </div>
    </div>
  )}
  ```
- Use the native `title` attribute for tooltip functionality

### 7. Update Pokemon Detail Component - Add Evolution Navigation
- Add evolution navigation section at the bottom:
  ```jsx
  {pokemon.evolution && (
    <div className="pokemon-info-section">
      <h2 className="section-title">Evolution</h2>
      <div className="evolution-navigation">
        <button
          className="evolution-btn pre-evolution"
          disabled={!pokemon.evolution.preEvolution}
          onClick={() => pokemon.evolution.preEvolution && onSelectPokemon(pokemon.evolution.preEvolution)}
        >
          {pokemon.evolution.preEvolution && (
            <>
              <span className="evolution-arrow">←</span>
              <span className="evolution-name">{pokemon.evolution.preEvolution}</span>
            </>
          )}
        </button>
        <button
          className="evolution-btn next-evolution"
          disabled={!pokemon.evolution.evolution}
          onClick={() => pokemon.evolution.evolution && onSelectPokemon(pokemon.evolution.evolution)}
        >
          {pokemon.evolution.evolution && (
            <>
              <span className="evolution-name">{pokemon.evolution.evolution}</span>
              <span className="evolution-arrow">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  )}
  ```
- Accept `onSelectPokemon` prop from parent component

### 8. Update App Component - Pass Pokemon Selection Handler
- Open `app/client/src/App.jsx`
- Update the `PokemonDetail` component call to pass the selection handler:
  ```jsx
  <PokemonDetail
    pokemon={pokemonDetail}
    loading={detailLoading}
    error={detailError}
    onSelectPokemon={handleSelectPokemon}
  />
  ```

### 9. Update Pokemon Detail Styles - Header and Layout
- Open `app/client/src/components/PokemonDetail/PokemonDetail.css`
- Update `.pokemon-name` styles to work with flex layout header
- Add styles for `.pokemon-header`:
  ```css
  .pokemon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  ```
- Add styles for `.pokedex-number`:
  ```css
  .pokedex-number {
    font-size: 1.5rem;
    font-weight: 600;
    color: #6B6B6B;
  }
  ```

### 10. Update Pokemon Detail Styles - Image Display
- Add styles for image section:
  ```css
  .pokemon-image-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  .pokemon-sprite {
    width: 200px;
    height: 200px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .pokemon-sprite:hover {
    transform: scale(1.1);
  }

  .sprite-label {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6B6B6B;
  }

  .no-image-message {
    padding: 3rem;
    background-color: #F5F5F5;
    border-radius: 0.5rem;
    color: #6B6B6B;
    font-style: italic;
  }
  ```

### 11. Update Pokemon Detail Styles - Stats Table
- Add styles for stats table with 2x3 grid layout:
  ```css
  .stats-table {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #F5F5F5;
    border-radius: 0.375rem;
    border: 2px solid transparent;
  }

  .stat-cell.max-stat {
    border-color: #10B981;
    background-color: rgba(16, 185, 129, 0.1);
  }

  .stat-name {
    color: #6B6B6B;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .stat-value {
    color: #1A1A1A;
    font-size: 1.125rem;
    font-weight: 700;
  }
  ```

### 12. Update Pokemon Detail Styles - Abilities
- Add styles for ability cards with hover effects:
  ```css
  .abilities-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ability-card {
    padding: 1rem;
    background-color: #F5F5F5;
    border-radius: 0.375rem;
    cursor: help;
    transition: background-color 0.2s;
  }

  .ability-card:hover {
    background-color: #E5E5E5;
  }

  .ability-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1A1A1A;
    text-transform: capitalize;
    margin-bottom: 0.5rem;
  }

  .ability-flavor {
    font-size: 0.875rem;
    color: #6B6B6B;
    line-height: 1.5;
  }
  ```

### 13. Update Pokemon Detail Styles - Evolution Navigation
- Add styles for evolution navigation buttons:
  ```css
  .evolution-navigation {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .evolution-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #DC0A2D;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    text-transform: capitalize;
  }

  .evolution-btn:hover:not(:disabled) {
    background-color: #B30920;
  }

  .evolution-btn:disabled {
    background-color: #E5E5E5;
    color: #A0A0A0;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .evolution-btn.pre-evolution {
    justify-content: flex-start;
  }

  .evolution-btn.next-evolution {
    justify-content: flex-end;
  }

  .evolution-arrow {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .evolution-name {
    font-weight: 600;
  }
  ```

### 14. Create E2E Tests - Setup Test File
- Create new file `e2e/pokemon-detail-enhancements.spec.js`
- Add Playwright imports and test suite structure
- Add `beforeEach` hook to navigate to the app and search for a Pokemon with comprehensive data (e.g., "bulbasaur" which has evolution chain)

### 15. Create E2E Tests - Pokedex Number Display
- Add test to verify Pokedex number is displayed next to Pokemon name
- Check that the number is on the right side of the header
- Verify format includes "#" prefix

### 16. Create E2E Tests - Sprite Image Display and Toggle
- Add test to verify default sprite image is displayed
- Add test to click image and verify it changes to shiny sprite
- Add test to click again and verify it returns to default sprite
- Add test to verify sprite label changes ("Default" vs "Shiny")
- Add test for Pokemon without images showing "No image available" message

### 17. Create E2E Tests - Stats Table Layout and Highlighting
- Add test to verify stats are displayed in 2x3 table format
- Verify all six stats are present (HP, Attack, Defense, Special Attack, Special Defense, Speed)
- Add test to verify the highest stat has highlighting (different visual style)
- Verify stat values are in bold

### 18. Create E2E Tests - Abilities Display and Tooltips
- Add test to verify abilities are listed below stats
- Verify ability name and flavor text are displayed
- Add test to hover over ability and verify tooltip with full effect appears
- Test with Pokemon that have multiple abilities

### 19. Create E2E Tests - Evolution Navigation
- Add test to verify evolution buttons are displayed
- Add test to click evolution button and verify navigation to evolved Pokemon
- Add test to verify pre-evolution button navigates to previous form
- Add test to verify disabled state for Pokemon without pre-evolution (e.g., starter Pokemon)
- Add test to verify disabled state for Pokemon without evolution (e.g., final evolution)
- Verify buttons show correct Pokemon names and arrow directions

### 20. Create E2E Tests - API Data Validation
- Add test to verify correct data is fetched from backend API
- Validate that Pokemon details include all new fields (sprites, stats, abilities, evolution)
- Add test for error handling when Pokemon data is incomplete
- Test API response structure matches expected format

### 21. Create E2E Tests - Types Section Update
- Add test to verify "Types" section title is removed
- Verify type badges are still displayed correctly
- Ensure types appear in correct position (below image, above stats)

### 22. Run Validation Commands
- Execute `npm run test:e2e` to run all E2E tests
- Verify all new tests pass with zero failures
- Check that existing Pokemon search and API tests still pass (no regressions)
- Manually test the application by starting both client and server
- Verify all interactive features work correctly in the browser

## Testing Strategy

### Unit Tests
No unit tests are required for this feature as it primarily involves UI enhancements and data transformation. The backend service functions should be tested through E2E tests that validate the complete data flow.

### Integration Tests
E2E tests will serve as integration tests, validating:
- Backend API correctly fetches and structures data from PokeAPI
- Frontend correctly displays all data fields
- Interactive features (image toggle, navigation) work correctly
- Data flows properly from API through backend to frontend

### Edge Cases
- Pokemon without sprite images (show "No image available" message)
- Pokemon without shiny sprites (disable toggle functionality or show same image)
- Pokemon at the start of evolution chain (pre-evolution button disabled)
- Pokemon at the end of evolution chain (evolution button disabled)
- Pokemon with no evolution chain (both buttons disabled)
- Pokemon with single ability vs multiple abilities
- Pokemon with missing ability descriptions
- Pokemon with very long ability descriptions (tooltip should handle overflow)
- API timeouts or failures (display appropriate error messages)
- Pokemon with tied stats (multiple stats with same highest value - highlight all)

## Acceptance Criteria
- [ ] Pokedex number is displayed on the right side next to Pokemon name with "#" prefix
- [ ] Pokemon sprite image is displayed below the name and above types
- [ ] Clicking the sprite image toggles between default and shiny versions
- [ ] "No image available" message appears when sprite is not available
- [ ] Sprite label indicates "Default" or "Shiny" based on current display
- [ ] "Types" section title is removed, but type badges remain visible
- [ ] Stats are displayed in a 2x3 table format (HP/Speed, Attack/Defense, SpAtk/SpDef)
- [ ] Each stat shows name and value, with value in bold
- [ ] The highest stat value is highlighted with green color (not red)
- [ ] Abilities are listed below stats with name and flavor text
- [ ] Hovering over an ability displays a tooltip with the full effect description
- [ ] Evolution navigation buttons are displayed at the bottom
- [ ] Pre-evolution button shows left arrow and Pokemon name (or is disabled if none)
- [ ] Evolution button shows Pokemon name and right arrow (or is disabled if none)
- [ ] Clicking evolution buttons navigates to the respective Pokemon
- [ ] Backend API successfully fetches sprites, stats, abilities, and evolution data
- [ ] All E2E tests pass, including new tests for image toggle, tooltips, and navigation
- [ ] No regressions in existing search and API functionality
- [ ] Application handles all edge cases gracefully (missing data, API failures, etc.)

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `npm run dev:client` - Start client development server (manual testing)
- `npm run dev:server` - Start server development server (manual testing)
- `npm run test:e2e` - Run all E2E tests including new Pokemon detail enhancement tests
- `npm run test:e2e:headed` - Run E2E tests in headed mode to visually verify interactions

## Notes

### PokeAPI Data Structure
- Pokemon endpoint: `https://pokeapi.co/api/v2/pokemon/{name}`
  - Sprites: `sprites.front_default` and `sprites.front_shiny`
  - Stats: `stats` array with `stat.name` and `base_stat`
  - Abilities: `abilities` array with `ability.name` and `ability.url`
- Ability endpoint: `https://pokeapi.co/api/v2/ability/{id}`
  - Flavor text: `flavor_text_entries` (filter for English language)
  - Effect: `effect_entries` (filter for English language)
- Species endpoint: `https://pokeapi.co/api/v2/pokemon-species/{id}`
  - Evolution chain URL: `evolution_chain.url`
- Evolution chain endpoint: URL from species data
  - Chain structure: nested `chain.evolves_to` array

### Color Palette Consistency
The feature should use the existing Pokeball color scheme established in the application:
- Primary Red: `#DC0A2D` (for buttons and accents)
- Highlight Green: `#10B981` (for max stat highlight - different than red as required)
- Black text: `#1A1A1A`
- Gray text: `#6B6B6B`
- Light backgrounds: `#F5F5F5`
- White backgrounds: `#FFFFFF`

### Future Enhancements
- Add animations for image toggle transition
- Include more sprite variants (back, animated)
- Add stat comparison bars/charts
- Link abilities to more detailed ability pages
- Display full evolution chain visually (not just pre/next)
- Add move list and type effectiveness
- Cache evolution chain data to reduce API calls
