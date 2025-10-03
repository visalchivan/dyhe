#!/bin/sh
set -e

cd /app/apps/api

# Ensure prisma generates at runtime (safety)
pnpm --silent db:generate || true

# Run migrations in production-safe way
if [ -n "$DATABASE_URL" ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
else
  echo "DATABASE_URL not set; skipping migrations"
fi

# Start API
node dist/main.js
