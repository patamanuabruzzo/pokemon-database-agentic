# Install & Setup

## Purpose

Install all dependencies and configure the development environment for the Pokemon Database project.

## Instructions

- Execute the commands in the `Run` section
- Install dependencies for all workspaces (app, agent, adws)
- Setup environment variables
- Verify installation

## Run

# Install Node.js dependencies (uses Turborepo + npm workspaces)
npm install

# Verify frontend dependencies
npm list --workspace=app/client

# Verify backend dependencies
npm list --workspace=app/server

# Verify agent dependencies
npm list --workspace=agent

## Setup Environment Variables

# Copy environment template
cp .env.sample .env

# Edit .env and add your API keys
# Required for application:
# - ANTHROPIC_API_KEY (for agentic features)
# - PORT (backend server port, default: 3001)
# - POKEAPI_BASE_URL (default: https://pokeapi.co/api/v2)

# Required for ADW (optional, only for maintainers):
# - GITHUB_REPO_URL (for GitHub issue automation)
# - GITHUB_PAT (optional, only if using different account than gh CLI)

## Optional: Setup ADW (Python Development Automation)

# Only needed if you want to use automated GitHub issue processing

# Install Python dependencies (requires Python 3.12+ and uv)
cd adws && uv sync && cd ..

## Report

List installed packages for each workspace:

```bash
# Node.js workspaces
npm list --depth=0

# Python ADW dependencies (if installed)
cd adws && uv pip list && cd ..
```

## Next Steps

1. **Update `.env` file** with your API keys
   - Required: `ANTHROPIC_API_KEY`
   - Optional: ADW configuration if using automated workflows

2. **Start the application:**
   ```bash
   npm run dev:client  # Frontend on port 3000
   npm run dev:server  # Backend on port 3001
   ```

3. **Verify it works:**
   - Frontend: http://localhost:3000
   - Backend health: http://localhost:3001/health

4. **(Optional) Setup ADW** for automated GitHub issue processing:
   - See README.md "Development Automation (ADW)" section
   - Requires Python 3.12+, uv, GitHub CLI
