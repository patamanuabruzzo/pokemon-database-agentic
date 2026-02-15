# Bug: Vercel API Fetch Failure - Hardcoded Localhost URL

## Bug Description
The search feature works correctly when running locally in development mode but fails when deployed to Vercel. The deployed application attempts to make API requests to `http://localhost:3001/api/pokemon/search`, which causes a `net::ERR_CONNECTION_REFUSED` error because `localhost:3001` doesn't exist in the Vercel production environment. This results in "Failed to fetch" errors and prevents users from searching for Pokemon.

**Symptoms:**
- Local development: Search works as expected
- Vercel deployment: Search returns `TypeError: Failed to fetch`
- Console shows attempted connection to `http://localhost:3001/api/pokemon/search`

**Expected Behavior:**
- API calls should use relative URLs (`/api/pokemon/search`) so they work in both development (proxied to localhost:3001) and production (serverless functions)

**Actual Behavior:**
- API calls are hardcoded to `http://localhost:3001`, which only exists in local development

## Problem Statement
The frontend API client (`app/client/src/utils/api.js`) uses a hardcoded base URL that defaults to `http://localhost:3001` when the `VITE_API_URL` environment variable is not set. In Vercel production deployments, this causes all API requests to fail because:
1. The `VITE_API_URL` environment variable is not configured in Vercel
2. The hardcoded fallback points to localhost, which doesn't exist in the browser's context on Vercel
3. The Vercel serverless API functions are served from the same origin at `/api/*`, so relative URLs should be used

## Solution Statement
Update the API client to use relative URLs for API requests, which will work correctly in both development and production:
- **Development:** Vite's dev server proxy (configured in `vite.config.js`) forwards `/api/*` requests to `http://localhost:3001`
- **Production:** Vercel routes `/api/*` requests to the serverless function at `api/index.js`

The fix involves changing the `API_BASE_URL` to use an empty string (relative URLs) instead of the absolute `http://localhost:3001` URL. This leverages existing infrastructure without requiring environment variable configuration.

## Steps to Reproduce
1. Deploy the application to Vercel (or use existing deployment)
2. Navigate to the deployed application URL (e.g., `https://your-project.vercel.app`)
3. Open browser DevTools Console
4. Enter a search query in the Pokemon search field (e.g., "Char")
5. Observe the console error:
   ```
   GET http://localhost:3001/api/pokemon/search?q=Char&limit=20&offset=0 net::ERR_CONNECTION_REFUSED
   API search error: TypeError: Failed to fetch
   ```
6. Verify the search returns no results and shows an error state

## Root Cause Analysis
The root cause is in `app/client/src/utils/api.js:1`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

**Why this causes the issue:**
1. **No environment variable in production:** The `VITE_API_URL` variable is not set in Vercel deployment, so the code falls back to `'http://localhost:3001'`
2. **Absolute URL doesn't work in browser:** The browser running the deployed app tries to connect to `localhost:3001`, which is the user's local machine, not the Vercel server
3. **Unnecessary absolute URL:** The application architecture already supports relative URLs:
   - Vite dev server proxy handles `/api` → `http://localhost:3001` in development
   - Vercel routes `/api` → `api/index.js` serverless function in production

**Why relative URLs are the correct solution:**
- They work with existing Vite proxy configuration (development)
- They work with existing Vercel routing configuration (production)
- They require no environment variable configuration
- They follow best practices for same-origin API calls

## Relevant Files
Use these files to fix the bug:

- **app/client/src/utils/api.js** - Contains the hardcoded `API_BASE_URL` that needs to be changed to use relative URLs. This is the only file that requires modification.

- **app/client/vite.config.js** - Contains the Vite dev server proxy configuration that forwards `/api` requests to `localhost:3001` in development. This file validates that relative URLs will work in development (no changes needed).

- **vercel.json** - Contains the Vercel routing configuration that forwards `/api/*` requests to `api/index.js` serverless function. This file validates that relative URLs will work in production (no changes needed).

- **api/index.js** - The Vercel serverless function that handles API requests in production. Validates that the backend is properly configured (no changes needed).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Fix API base URL to use relative URLs
- Open `app/client/src/utils/api.js`
- Change line 1 from `const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';` to `const API_BASE_URL = import.meta.env.VITE_API_URL || '';`
- This ensures API requests use relative URLs when `VITE_API_URL` is not set
- Relative URLs work in both development (Vite proxy) and production (Vercel routing)

### Step 2: Verify the fix works locally
- Start the backend server: `npm run dev:server` (in a separate terminal)
- Start the frontend dev server: `npm run dev:client`
- Open browser to `http://localhost:3000`
- Test the search functionality by entering "Char" or another query
- Verify search results appear correctly without console errors
- Confirm requests are being proxied to `http://localhost:3001/api/pokemon/search`

### Step 3: Test API health endpoint
- With both servers running, test the API health endpoint
- Open browser to `http://localhost:3000/api/health`
- Verify it returns JSON: `{"status":"ok","message":"Pokemon Database API is running"}`
- This confirms the Vite proxy is working correctly

### Step 4: Build and preview production build locally
- Stop both dev servers
- Build the client: `npm run build:client`
- Preview the production build with a local server
- Test search functionality to ensure relative URLs work in production-like environment

### Step 5: Deploy to Vercel and validate
- Commit the change: `git add app/client/src/utils/api.js && git commit -m "fix: use relative URLs for API requests to support Vercel deployment"`
- Push to repository: `git push`
- Wait for Vercel deployment to complete
- Open deployed application URL
- Test search functionality with browser DevTools Console open
- Verify no `localhost:3001` connection errors appear
- Verify search results are returned successfully
- Test the `/api/health` endpoint on the deployed URL

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `npm run dev:server` - Start the backend API server (run in separate terminal)
- `npm run dev:client` - Start the frontend dev server and verify search works locally
- `curl http://localhost:3000/api/health` - Verify Vite proxy forwards API requests correctly
- `npm run build:client` - Build the production bundle and verify no build errors
- Manual test on Vercel deployment - Search for "Char" and verify results appear without console errors
- `curl https://your-deployment.vercel.app/api/health` - Verify API routes work on Vercel (replace with actual URL)

## Notes
- **No environment variables needed:** This fix works without configuring `VITE_API_URL` in Vercel, simplifying deployment
- **Preserves flexibility:** If `VITE_API_URL` is set, it will still be used (useful for custom API endpoints or staging environments)
- **Zero backend changes:** The fix is entirely in the frontend API client; no changes to Express server or Vercel functions
- **Follows best practices:** Using relative URLs for same-origin API calls is the standard approach for modern web applications
- **Backwards compatible:** The change works seamlessly with existing Vite proxy and Vercel routing configurations
