#!/bin/bash
set -e

echo "Building client for Vercel..."
cd app/client
npm install
npm run build
echo "Build complete!"
