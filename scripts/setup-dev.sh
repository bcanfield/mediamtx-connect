#!/bin/bash
# Complete development environment setup script
# Run this after cloning the repository to get started quickly

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=================================="
echo "MediaMTX Connect - Development Setup"
echo "=================================="
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing npm dependencies..."
npm install

# Step 2: Generate Prisma client
echo ""
echo "Step 2: Generating Prisma client..."
npx prisma generate

# Step 3: Run database migrations
echo ""
echo "Step 3: Running database migrations..."
npx prisma migrate deploy

# Step 4: Seed the database
echo ""
echo "Step 4: Seeding database with development config..."
npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/prisma/seed.ts

# Step 5: Setup test data
echo ""
echo "Step 5: Setting up test data (mock recordings)..."
./scripts/setup-test-data.sh

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "You can now start the development server:"
echo "  npm run dev"
echo ""
echo "The app will be available at: http://localhost:3000"
echo ""
echo "Note: Without MediaMTX running, the Streams page will show"
echo "a connection error (this is expected). The Recordings and"
echo "Config pages will work with the test data."
echo ""
echo "To run with MediaMTX (with fake streams):"
echo "  ./scripts/start-mediamtx.sh"
echo ""
echo "Or without fake streams:"
echo "  docker compose -f docker-compose.dev.yml up -d"
echo ""
echo "To run e2e tests:"
echo "  npm run test:e2e"
echo ""
