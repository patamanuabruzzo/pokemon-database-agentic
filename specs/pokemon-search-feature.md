# Feature: Pokemon Search with Results Display

## Feature Description
A comprehensive Pokemon search interface that allows users to search for Pokemon by name (full or partial), view paginated search results, and display detailed information about selected Pokemon. The interface is split into two main sections: a left panel containing the search field and results list, and a right panel displaying the selected Pokemon's details (name and types).

## User Story
As a Pokemon enthusiast
I want to search for Pokemon by entering full or partial names
So that I can quickly find and view information about Pokemon that match my search criteria

## Problem Statement
Users currently have no way to search and explore Pokemon data within the application. Without a search interface, users cannot discover Pokemon or view their characteristics. The application needs an intuitive search mechanism that supports partial name matching, handles pagination for large result sets, and provides clear feedback when no results are found.

## Solution Statement
Implement a two-panel layout with a search interface on the left and Pokemon details on the right. The left panel will include a text input field and search button that query the PokeAPI for matching Pokemon names. Results will be displayed in a paginated list below the search field. When a user selects a Pokemon (or when only one result is found), the right panel will display the Pokemon's name and types. The solution will use the PokeAPI (https://pokeapi.co/api/v2) for all Pokemon data, with the backend server acting as a proxy to handle API calls and implement partial name search logic.

## Relevant Files
Use these files to implement the feature:

- **app/client/src/App.jsx** - Main application component that will host the two-panel layout
- **app/client/src/App.css** - Existing styles that need to be extended for the search interface layout
- **app/client/src/index.css** - Global styles for consistent design
- **app/server/src/index.js** - Backend server where API routes will be added for Pokemon search
- **app/server/package.json** - Server dependencies (already includes axios for API calls)
- **app/client/package.json** - Client dependencies (may need to add for API communication)
- **playwright.config.js** - E2E test configuration
- **e2e/example.spec.js** - Example E2E test file to reference for test patterns

### New Files

- **app/client/src/components/SearchPanel/SearchPanel.jsx** - Search field and results list component
- **app/client/src/components/SearchPanel/SearchPanel.css** - Styles for search panel
- **app/client/src/components/PokemonDetail/PokemonDetail.jsx** - Pokemon information display component
- **app/client/src/components/PokemonDetail/PokemonDetail.css** - Styles for detail panel
- **app/client/src/components/Pagination/Pagination.jsx** - Reusable pagination component
- **app/client/src/components/Pagination/Pagination.css** - Pagination styles
- **app/server/src/routes/pokemon.js** - Pokemon API route handlers
- **app/server/src/services/pokeapi.js** - Service layer for PokeAPI integration
- **e2e/pokemon-search.spec.js** - E2E tests for search functionality
- **e2e/pokemon-api.spec.js** - E2E tests for API endpoint validation

## Implementation Plan

### Phase 1: Foundation
Set up the backend infrastructure to communicate with PokeAPI and implement the search logic. Since PokeAPI doesn't support partial name search directly, we'll fetch a list of all Pokemon names and filter them on the backend. Create service layer and API routes following Express best practices.

### Phase 2: Core Implementation
Build React components for the search interface, results display, and Pokemon details panel. Implement state management for search queries, results, selected Pokemon, and pagination. Create a clean two-panel layout with responsive design considerations.

### Phase 3: Integration
Connect frontend components to backend API endpoints. Implement error handling, loading states, and edge cases (no results, API failures). Add comprehensive E2E tests to validate the complete user flow and API integration.

## Step by Step Tasks

### 1. Backend API - PokeAPI Service Layer
- Create `app/server/src/services/pokeapi.js` service module
- Implement `getAllPokemonNames()` function to fetch complete Pokemon list from PokeAPI `/pokemon?limit=10000`
- Implement `getPokemonByName(name)` function to fetch detailed Pokemon data including types
- Implement `searchPokemonByPartialName(query)` function to filter Pokemon names containing the search query (case-insensitive)
- Add error handling for API failures and timeouts
- Cache the complete Pokemon list in memory to avoid repeated API calls

### 2. Backend API - Pokemon Routes
- Create `app/server/src/routes/pokemon.js` route module
- Implement `GET /api/pokemon/search?q={query}&limit={limit}&offset={offset}` endpoint
  - Query parameter `q` for search string (full or partial name)
  - Query parameters `limit` and `offset` for pagination (default limit: 20)
  - Return paginated results with total count
- Implement `GET /api/pokemon/:name` endpoint to fetch detailed Pokemon data
- Handle edge cases: empty query, no results found, invalid Pokemon name
- Update `app/server/src/index.js` to import and use the Pokemon routes

### 3. Frontend API Client Utility
- Create `app/client/src/utils/api.js` utility module
- Implement `searchPokemon(query, limit, offset)` function
- Implement `getPokemonDetails(name)` function
- Configure base URL to use environment variable or default to `http://localhost:3001`
- Add error handling for network failures

### 4. Search Panel Component
- Create `app/client/src/components/SearchPanel/SearchPanel.jsx` component
- Implement text input field with placeholder "Search Pokemon..."
- Implement search button with onClick handler
- Add form submission support (Enter key triggers search)
- Implement loading state indicator during search
- Add clear button to reset search
- Create corresponding CSS file with pleasant styling

### 5. Results List Component (within SearchPanel)
- Add results list section to SearchPanel component
- Display each Pokemon result as a clickable list item showing the name
- Implement click handler to select a Pokemon and notify parent component
- Show "No results found" message when search returns empty
- Show "Start searching to see results" message before first search
- Style list items with hover effects and selected state

### 6. Pagination Component
- Create `app/client/src/components/Pagination/Pagination.jsx` reusable component
- Implement Previous/Next buttons with disabled state at boundaries
- Display current page number and total pages
- Add click handlers to change pages
- Create corresponding CSS file for styling
- Handle edge case: hide pagination if only one page of results

### 7. Pokemon Detail Component
- Create `app/client/src/components/PokemonDetail/PokemonDetail.jsx` component
- Display Pokemon name as heading
- Display Pokemon types as styled badges/tags
- Fetch and display Pokemon details when a Pokemon is selected
- Show placeholder message "Select a Pokemon to view details" when none selected
- Add loading state while fetching details
- Create corresponding CSS file with attractive styling for types

### 8. Main App Layout Integration
- Update `app/client/src/App.jsx` to create two-panel layout
- Add SearchPanel component on the left side
- Add PokemonDetail component on the right side
- Implement state management for selected Pokemon
- Implement state management for search results and pagination
- Pass props and callbacks between components
- Update `app/client/src/App.css` with two-column grid/flexbox layout
- Ensure layout is responsive (stack vertically on mobile)

### 9. State Management and Data Flow
- Implement `useState` for search query, results, selectedPokemon, loading, and error states
- Implement pagination state (currentPage, totalPages, itemsPerPage)
- Create handler functions: `handleSearch`, `handleSelectPokemon`, `handlePageChange`
- Ensure proper state updates and re-renders
- Handle automatic selection when only one result is found

### 10. Error Handling and User Feedback
- Add error state display in SearchPanel for failed searches
- Add error state display in PokemonDetail for failed detail fetches
- Implement retry mechanism or helpful error messages
- Add loading spinners/skeletons for better UX
- Handle network timeouts gracefully

### 11. E2E Tests - Search Functionality
- Create `e2e/pokemon-search.spec.js`
- Test: Search with full Pokemon name (e.g., "Pikachu") returns correct results
- Test: Search with partial name (e.g., "Char") returns multiple matching results (Charizard, Charmander, Charmeleon)
- Test: Click on a search result displays Pokemon details in right panel
- Test: Pagination buttons work correctly and load different pages
- Test: Search with no matches shows "No results found" message
- Test: Single result automatically displays Pokemon details
- Test: Loading states appear during API calls

### 12. E2E Tests - API Integration
- Create `e2e/pokemon-api.spec.js`
- Test: `/api/pokemon/search?q=pikachu` endpoint returns correct data structure
- Test: `/api/pokemon/search?q=char&limit=10&offset=0` endpoint respects pagination
- Test: `/api/pokemon/pikachu` endpoint returns Pokemon with name and types
- Test: `/api/pokemon/invalidname` endpoint returns 404 error
- Test: Search endpoint handles empty query parameter appropriately
- Test: API responses match expected schema (name, types array)

### 13. Run Validation Commands
- Execute all validation commands listed below to ensure zero regressions
- Fix any failing tests or build issues
- Verify frontend and backend work together correctly
- Test user workflows manually if needed

## Testing Strategy

### Unit Tests
- PokeAPI service functions (getAllPokemonNames, searchPokemonByPartialName, getPokemonByName)
- API route handlers (search endpoint, detail endpoint)
- React component rendering (SearchPanel, PokemonDetail, Pagination)
- State management logic (search handlers, selection handlers, pagination handlers)

### Integration Tests
- Frontend to backend API communication
- Complete search flow: input → API call → results display → selection → detail display
- Pagination flow: search → page 1 → next page → page 2 → previous page
- Error handling flow: invalid search → error message display

### Edge Cases
- Empty search query
- Search query with no matching Pokemon
- Search query matching only one Pokemon (auto-select behavior)
- Search query matching all Pokemon
- Invalid Pokemon name in detail fetch
- API timeout or network failure
- Very long Pokemon names (UI overflow)
- Special characters in search query
- Case sensitivity (should be case-insensitive)
- Pagination at boundaries (first page, last page)
- Clicking on already selected Pokemon

## Acceptance Criteria

1. ✅ User can enter full or partial Pokemon name in search field
2. ✅ Clicking search button or pressing Enter triggers search
3. ✅ Search results display in paginated list below search field
4. ✅ Pagination controls allow navigating through result pages (20 results per page)
5. ✅ Clicking a Pokemon in results list displays its details on the right panel
6. ✅ When only one result is found, it is automatically displayed
7. ✅ Pokemon details show name and types in an attractive layout
8. ✅ "No results found" message appears when search has no matches
9. ✅ Search field and results list are on the left side of the page
10. ✅ Pokemon details are on the right side of the page
11. ✅ Layout is pleasant and uses good spacing/design principles
12. ✅ Loading states are shown during API calls
13. ✅ Error messages are displayed for failed API calls
14. ✅ All E2E tests pass successfully
15. ✅ Application works with zero regressions to existing functionality

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `npm run dev:client` - Start frontend development server and verify it runs without errors
- `npm run dev:server` - Start backend development server and verify it runs without errors
- `npm run build:client` - Build frontend for production and verify build succeeds
- `npm run test:e2e` - Run all E2E tests including new Pokemon search tests (must pass 100%)
- `curl http://localhost:3001/health` - Verify backend health check still works
- `curl "http://localhost:3001/api/pokemon/search?q=char"` - Verify search endpoint returns results
- `curl http://localhost:3001/api/pokemon/pikachu` - Verify detail endpoint returns Pokemon data

## Notes

### PokeAPI Limitations
- PokeAPI does not provide a built-in partial name search endpoint
- Solution: Fetch complete Pokemon list once and cache in memory, then filter on backend
- The `/pokemon?limit=10000` endpoint returns all Pokemon names with URLs
- Individual Pokemon details require separate API calls to `/pokemon/{name}`

### Performance Considerations
- Cache the complete Pokemon list on backend startup to avoid repeated fetches
- Consider implementing request caching or debouncing on frontend to reduce API calls
- Pagination helps manage large result sets and improves perceived performance

### Design Principles
- Follow existing color scheme (purple gradient from App.css)
- Use consistent spacing and typography from index.css
- Pokemon types should have color-coded badges for visual appeal
- Ensure accessibility (keyboard navigation, ARIA labels, focus states)

### Future Enhancements (Not in Scope)
- Advanced filters (type, generation, abilities)
- Pokemon sprites/images
- Evolution chain display
- Stats and abilities
- Sorting options (alphabetical, by number)
- Search history
- Favorites/bookmarks

### Dependencies
- No new frontend dependencies required (use fetch API or existing tools)
- Backend already has axios for HTTP requests
- Backend already has express and cors configured
- Playwright already configured for E2E testing
