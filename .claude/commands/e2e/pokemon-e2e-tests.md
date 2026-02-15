# Pokemon E2E Tests

Run all Playwright end-to-end tests for the Pokemon database application.

## Test Description

This test suite validates the complete Pokemon search application functionality including:
- Pokemon search by name
- Search results display
- Pokemon detail view
- API integration with PokeAPI
- Pagination controls

## Setup

Ensure both frontend and backend are running:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Test Command

```bash
npm run test:e2e
```

## Success Criteria

- All Playwright tests pass
- No console errors
- Search functionality works correctly
- Pokemon details are displayed properly
- API responses are successful

## Expected Output

Playwright test results showing all tests passing with detailed test execution logs.
