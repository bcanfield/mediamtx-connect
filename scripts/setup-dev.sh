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
echo "Step 1: Installing dependencies (pnpm)..."
pnpm install

# Step 2: Setup test data
echo ""
echo "Step 2: Setting up test data (mock recordings)..."
./scripts/setup-test-data.sh

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Start MediaMTX (with fake streams) and the dev servers together:"
echo "  pnpm dev:all"
echo ""
echo "Web dev server: http://localhost:5173 (api on :3000)"
echo ""
echo "Or run them separately:"
echo "  pnpm mediamtx   # MediaMTX with fake streams"
echo "  pnpm dev        # web + api dev servers"
echo ""
echo "To run e2e tests (needs a prior pnpm build):"
echo "  pnpm test:e2e"
echo ""
