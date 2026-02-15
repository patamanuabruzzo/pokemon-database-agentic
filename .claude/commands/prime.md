# Prime

Execute the `Run`, `Read` and `Report` sections to understand the codebase then summarize your understanding.

## Run
git ls-files

## Read
README.md
PROJECT_STRUCTURE.md
DEPLOYMENT.md
package.json
app/client/package.json
app/server/package.json
agent/package.json
turbo.json
vercel.json

## Report

Summarize your understanding of the codebase including:

### Project Overview
- Project name and purpose (Pokemon database application)
- Key features and functionality

### Architecture
- Application layer (/app): Node.js/React structure
  - Frontend: React + Vite (port 3000)
  - Backend: Express API (port 3001)
- Agent layer (/agent): Node.js agentic features (to be implemented)
- ADW layer (/adws): Python development automation (processes GitHub issues)

### Technology Stack
- Frontend: React 18, Vite, JavaScript (not TypeScript)
- Backend: Node.js, Express, Axios
- Build System: Turborepo with npm workspaces
- Deployment: Vercel with serverless architecture
- Development Automation: Python 3.12+ with ADW scripts

### Development Workflow
- How to start the application (npm run dev:client, npm run dev:server)
- How to build for production (npm run build:client)
- How the ADW system automates GitHub issue processing
- How the three layers (app, agent, adws) interact

### Key Configuration Files
- turbo.json: Turborepo task configuration
- vercel.json: Deployment configuration
- package.json files: Workspace structure and scripts