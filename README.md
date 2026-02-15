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

## License

This is a practice project for educational purposes.
