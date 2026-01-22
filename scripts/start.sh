#!/bin/sh
set -e
echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy --schema=/app/prisma/schema.prisma
echo "Migrations complete. Starting server..."
node server.js