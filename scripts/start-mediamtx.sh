#!/bin/bash
# Start MediaMTX with fake streams for development/testing
# Usage: ./scripts/start-mediamtx.sh [--wait]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Starting MediaMTX with fake streams..."
docker compose -f docker-compose.dev.yml --profile streams up -d --build

# Wait for MediaMTX API to be ready
echo "Waiting for MediaMTX API..."
for i in {1..30}; do
  if curl -s http://localhost:9997/v3/paths/list > /dev/null 2>&1; then
    echo "MediaMTX API is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "ERROR: MediaMTX API did not become ready in time"
    docker logs mediamtx 2>&1 | tail -20
    exit 1
  fi
  echo "Attempt $i/30: Waiting..."
  sleep 2
done

# Wait for fake streams to initialize
echo "Waiting for fake streams to start..."
sleep 8

# Verify streams
STREAM_COUNT=$(curl -s http://localhost:9997/v3/paths/list | jq '.itemCount' 2>/dev/null || echo "0")
echo "Active streams: $STREAM_COUNT"

if [ "$STREAM_COUNT" -lt 1 ]; then
  echo "WARNING: No streams detected"
  echo "=== MediaMTX logs ==="
  docker logs mediamtx 2>&1 | tail -20
  echo "=== Fake streams logs ==="
  docker logs fake-streams 2>&1 | tail -20
  exit 1
fi

echo "MediaMTX is ready with $STREAM_COUNT streams"
