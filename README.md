# Pokémon Database Agentic

A practice project demonstrating agentic application development with a Pokémon search and information display system.

## Purpose

This is a practice project focused on building an agentic web application. It provides an interactive interface where users can search for Pokémon using various filters and view detailed information about their selections.

## Features

- **Search Functionality**: Search for Pokémon by name or characteristics
- **Advanced Filters**: Filter results by type, generation, abilities, and more
- **Results Display**: Browse a list of matching Pokémon with key information
- **Detailed View**: Select a Pokémon to view comprehensive details including:
  - Stats and abilities
  - Evolution chain
  - Type advantages/disadvantages
  - Sprite images

## Architecture

This project features a clean separation between two distinct layers:

- **Application Layer** (`/app`): Contains the React frontend and Express backend for the Pokemon search interface
- **Agentic Layer** (`/agent`): Houses AI-powered features using Anthropic's Claude SDK

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture documentation.

## Technology Stack

### Application
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **API**: PokéAPI (https://pokeapi.co/)

### Agentic
- **AI SDK**: Anthropic SDK
- **Runtime**: Node.js

### Deployment
- Vercel-compatible serverless architecture

## Project Goals

This project serves as a hands-on practice for:
- Building agentic applications
- Integrating with external REST APIs
- Implementing search and filter functionality
- Creating responsive user interfaces
- Deploying serverless applications on Vercel

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install:all
   ```
3. Copy the environment file:
   ```bash
   cp .env.sample .env
   ```
4. Update `.env` with your configuration (especially `ANTHROPIC_API_KEY` if using agentic features)

### Development

Run the application in development mode:

```bash
# Start the frontend (port 3000)
npm run dev:client

# Start the backend API (port 3001)
npm run dev:server

# Start the agentic layer
npm run dev:agent
```

### Building

```bash
# Build frontend for production
npm run build:client

# Build backend (no build step required)
npm run build:server
```

## Deployment

### Deploying to Vercel

This project uses **Turborepo** for monorepo management and is optimized for Vercel deployment.

#### Initial Setup

1. Push your code to GitHub
2. Import the project in Vercel: https://vercel.com/new
3. Select your repository

#### Required Configuration

**IMPORTANT:** In Vercel Project Settings → Build & Development Settings, configure:

```
Framework Preset: Other (or Vite)
Build Command: npm run build:client
Output Directory: app/client/dist
Install Command: npm install
Root Directory: (leave empty)
```

**Make sure to check the "Override" checkbox** for each setting so Vercel uses your configuration instead of auto-detection.

#### Verification

After deployment, check:
- Frontend: `https://your-project.vercel.app/` - Should display the React app
- API Health: `https://your-project.vercel.app/api/health` - Should return JSON status

#### Common Issues

- **404 NOT_FOUND Error**: Vercel project settings are not configured correctly. Ensure Build & Development Settings match the configuration above and "Override" is enabled.
- **Build takes < 1 second**: Build command is not running. Check project settings and redeploy.
- **API routes not working**: Verify `vercel.json` routes configuration is present.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment troubleshooting.

## Monorepo Management

This project uses **Turborepo** to manage the monorepo structure:

- Efficient build caching and parallelization
- Proper workspace dependency resolution
- Native Vercel integration for optimized deployments

All build commands use Turborepo under the hood:
```bash
npm run build          # Build all workspaces
npm run build:client   # Build only frontend (turbo run build --filter=@pokemon-db/client)
npm run dev:client     # Run frontend dev server
```

## Development Automation (ADW)

This project includes a **Python-based AI Developer Workflow (ADW)** system for automating GitHub issue processing. The ADW system is separate from the Node.js application and is used by maintainers to automate development tasks.

### Architecture Overview

```
pokemon-database-agentic/
├── app/          # Node.js application (React + Express)
├── agent/        # Node.js agentic features (to be implemented)
└── adws/         # Python development automation (GitHub issue processing)
```

### ADW Setup (Optional - For Project Maintainers Only)

The ADW system automates development workflows by processing GitHub issues and creating pull requests automatically.

**Prerequisites:**
- Python 3.12 or higher
- [uv](https://docs.astral.sh/uv/) package manager
- GitHub CLI (`gh`) authenticated
- Claude Code CLI

**Installation:**

1. **Install Python and uv:**
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **Install GitHub CLI and authenticate:**
   ```bash
   # macOS
   brew install gh

   # Ubuntu/Debian
   sudo apt install gh

   # Windows
   winget install --id GitHub.cli

   # Authenticate
   gh auth login
   ```

3. **Configure environment variables in `.env`:**
   ```bash
   # Required for ADW
   GITHUB_REPO_URL=https://github.com/your-username/pokemon-database-agentic
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Optional - only if using different account than 'gh auth login'
   GITHUB_PAT=your_github_personal_access_token
   ```

4. **Install ADW dependencies:**
   ```bash
   cd adws
   uv sync
   ```

### Using ADW

**Process a specific GitHub issue:**
```bash
cd adws

# Plan and implement solution for issue #123
uv run adw_plan_build.py 123

# Full pipeline with testing
uv run adw_plan_build_test.py 123
```

**Enable automatic issue processing:**
```bash
cd adws

# Polls GitHub every 20 seconds for new issues
uv run adw_triggers/trigger_cron.py

# Or start webhook server for instant processing
uv run adw_triggers/trigger_webhook.py
```

**What ADW does:**
1. Fetches issue details from GitHub
2. Classifies issue type (`/feature`, `/bug`, `/chore`)
3. Creates a feature branch
4. Generates implementation plan using Claude
5. Implements the solution
6. Runs tests
7. Creates commits and pull request
8. Links everything back to the original issue

See [adws/README.md](./adws/README.md) for complete ADW documentation.

**Note:** ADW is optional. Contributors can work on the project without setting up the Python automation system. It's primarily for maintainers who want to automate their development workflow.

## License

This is a practice project for educational purposes.
