#!/bin/bash
# Run MediaMTX (with fake streams) and the web+api dev servers together.
# Brings the docker stack down on exit.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

cleanup() {
  echo ""
  echo "Stopping MediaMTX..."
  docker compose -f docker-compose.dev.yml --profile streams down
}
trap cleanup EXIT INT TERM

./scripts/start-mediamtx.sh

echo ""
echo "Starting web + api dev servers..."
pnpm dev
