# Project Structure

This document explains the architecture and organization of the Pokémon Database Agentic project.

## Architecture Overview

The project is organized into two main layers:

### 1. Application Layer (`/app`)
Contains the core application functionality - the web interface and API server.

```
app/
├── client/          # Frontend React application
│   ├── src/
│   │   ├── main.jsx       # Application entry point
│   │   ├── App.jsx        # Main App component
│   │   ├── App.css        # App styles
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
│
└── server/          # Backend Node.js/Express API
    ├── src/
    │   └── index.js       # Server entry point
    ├── api/               # API route handlers (to be added)
    └── package.json       # Backend dependencies
```

### 2. Agentic Layer (`/agent`)
Contains AI-powered features and agent logic, completely separated from application code.

```
agent/
├── src/
│   └── index.js     # Agent initialization
├── tools/           # Agent tools and utilities
├── prompts/         # Agent prompts and templates
└── package.json     # Agent dependencies
```

### 3. Configuration (`/.claude`)
Claude Code configuration and commands.

## Technology Stack

### Application Layer
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **API**: PokéAPI integration

### Agentic Layer
- **AI SDK**: Anthropic SDK
- **Runtime**: Node.js

## Workspace Management

This project uses **npm workspaces** with **Turborepo** for monorepo management:

- Root `package.json` defines workspaces
- Each layer has its own dependencies
- Turborepo orchestrates builds and caching
- Shared scripts in root for coordination

### Turborepo Configuration

The `turbo.json` file defines tasks and caching strategies:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Benefits:**
- Fast, incremental builds
- Intelligent caching
- Parallel task execution
- Native Vercel integration

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Run frontend**: `npm run dev:client` (port 3000)
3. **Run backend**: `npm run dev:server` (port 3001)
4. **Run agent**: `npm run dev:agent`
5. **Build for production**: `npm run build:client`

## Deployment

### Vercel Deployment Structure

```
pokemon-database-agentic/
├── app/client/dist/     # Static files (deployed to CDN)
├── api/                 # Serverless functions
│   └── index.js         # API handler
├── vercel.json          # Vercel configuration
└── turbo.json           # Build orchestration
```

**Important:** When deploying to Vercel, you must configure Build & Development Settings:

- **Build Command**: `npm run build:client`
- **Output Directory**: `app/client/dist`
- **Install Command**: `npm install`
- **Framework**: Other or Vite

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

### What Gets Deployed

**Frontend (Static):**
- Built React app from `app/client/dist/`
- Served globally via Vercel Edge Network
- SPA routing handled by Vercel

**API (Serverless):**
- `api/index.js` deployed as serverless function
- Handles `/api/*` routes
- Cold start optimization included

**Not Deployed:**
- `app/server/` - Development-only Express server
- `agent/` - Agentic layer (runs separately if needed)
- Source files - Only built outputs deployed

## Separation of Concerns

- **Application layer** handles user interface and data management
- **Agentic layer** provides AI-powered enhancements
- Clear boundaries enable independent development and testing
- Deployment only includes necessary frontend and API components
