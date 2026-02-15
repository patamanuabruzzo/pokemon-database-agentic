# Deployment Guide

This guide covers deploying the Pokémon Database Agentic application to Vercel.

## Prerequisites

- GitHub account with your repository pushed
- Vercel account (free tier works fine)
- Project uses Turborepo for monorepo management

## Vercel Deployment

### Step 1: Initial Vercel Setup

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will attempt to auto-detect your project settings

### Step 2: Configure Build Settings

**⚠️ CRITICAL:** Vercel's auto-detection may not work correctly with monorepo structures. You MUST manually configure these settings.

1. In Vercel dashboard, go to: **Project → Settings → General → Build & Development Settings**

2. Configure the following (and **check the Override checkbox for each**):

   | Setting | Value | Override |
   |---------|-------|----------|
   | Framework Preset | `Other` or `Vite` | ✅ Checked |
   | Build Command | `npm run build:client` | ✅ Checked |
   | Output Directory | `app/client/dist` | ✅ Checked |
   | Install Command | `npm install` | ✅ Checked |
   | Root Directory | (empty) | ✅ Checked |

3. Click **"Save"**

### Step 3: Deploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** or push a new commit to trigger deployment
3. Wait for build to complete (should take 15-30 seconds)

### Step 4: Verify Deployment

Check these endpoints:

```bash
# Frontend - Should display React app
https://your-project.vercel.app/

# API Health Check - Should return JSON
https://your-project.vercel.app/api/health
```

Expected API response:
```json
{
  "status": "ok",
  "message": "Pokemon Database API is running"
}
```

## Troubleshooting

### Issue: 404 NOT_FOUND Error

**Symptoms:**
- Vercel deployment succeeds but shows 404 on all routes
- Build logs show completion in < 1 second
- "Skipping cache upload because no files were prepared"

**Cause:** Vercel is not running your build command. It's using zero-config mode and ignoring `vercel.json`.

**Solution:**
1. Go to Project Settings → Build & Development Settings
2. Verify all settings match Step 2 above
3. **Most important:** Check the "Override" checkboxes
4. Save and redeploy

### Issue: Build Fails on Vercel (Works Locally)

**Symptoms:**
- Local `npm run build:client` works fine
- Vercel build fails with dependency errors

**Solution:**
```bash
# Clear local cache and test clean build
rm -rf node_modules .turbo app/client/node_modules
npm install
npm run build:client
```

If this fails locally, fix the issues before pushing to Vercel.

### Issue: Turborepo Not Detected

**Symptoms:**
- Build logs don't show Turborepo output
- Workspace dependencies not resolved

**Solution:**
Ensure `package.json` has:
```json
{
  "packageManager": "npm@10.0.0",
  "workspaces": ["app/client", "app/server", "agent"]
}
```

And `turbo.json` exists at project root.

### Issue: API Routes Return 404

**Symptoms:**
- Frontend works but `/api/*` routes return 404

**Cause:** `api/index.js` not detected or routes not configured

**Solution:**
1. Verify `api/index.js` exists at project root
2. Check `vercel.json` has proper routes configuration
3. Ensure Express app is exported: `module.exports = app;`

## Build Process Explained

### What Happens During Deployment:

1. **Clone Repository**
   ```
   Cloning github.com/your-username/pokemon-database-agentic
   ```

2. **Install Dependencies**
   ```
   Running "npm install"
   → Installs all workspace dependencies
   → Turborepo detects workspaces
   ```

3. **Run Build Command**
   ```
   Running "npm run build:client"
   → turbo run build --filter=@pokemon-db/client
   → Vite builds React app
   → Outputs to app/client/dist/
   ```

4. **Deploy Static Files**
   ```
   Deploying from app/client/dist/
   → index.html
   → assets/*.js
   → assets/*.css
   ```

5. **Configure Routing**
   ```
   API routes → /api/index.js (serverless function)
   Static files → app/client/dist/*
   SPA fallback → /index.html
   ```

### Expected Build Time:
- **15-30 seconds** for typical builds
- **< 5 seconds** with Turborepo cache hit
- **< 1 second = ERROR** (build not running)

## Environment Variables

### Required for Agentic Features:

In Vercel Project Settings → Environment Variables, add:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### For Local Development:

Copy `.env.sample` to `.env` and fill in values.

## Continuous Deployment

Vercel automatically deploys on:
- **Push to `main` branch** → Production deployment
- **Pull request** → Preview deployment
- **Push to other branches** → Preview deployment

To disable auto-deployment:
1. Project Settings → Git
2. Configure which branches trigger deployments

## Project Structure

```
pokemon-database-agentic/
├── app/
│   ├── client/          # React frontend
│   │   └── dist/        # Build output (deployed)
│   └── server/          # Express API (not deployed to Vercel)
├── agent/               # Agentic layer
├── api/                 # Vercel serverless functions
│   └── index.js         # Main API handler
├── vercel.json          # Vercel configuration
├── turbo.json           # Turborepo configuration
└── package.json         # Root workspace config
```

## Performance Optimization

### Turborepo Caching

Turborepo automatically caches build outputs. On subsequent deployments:
- Unchanged workspaces are skipped
- Only changed workspaces rebuild
- Significantly faster deployment times

### Vercel Edge Network

Static files are automatically distributed to Vercel's global CDN:
- Served from edge locations near users
- Minimal latency
- Automatic HTTPS

## Support

For issues:
1. Check build logs in Vercel dashboard
2. Review this troubleshooting guide
3. Verify local build works: `npm run build:client`
4. Check Vercel project settings match requirements

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
