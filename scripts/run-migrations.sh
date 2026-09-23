#!/usr/bin/env bash
# =============================================================================
# LinguaClass — Safe Database Migration Runner for Cloud SQL / PostgreSQL
# Usage: ./scripts/run-migrations.sh
# =============================================================================

set -e

echo "==> Running Prisma database migrations..."

if [ -z "$DATABASE_URL" ] && [ -z "$DIRECT_URL" ]; then
  echo "ERROR: Neither DATABASE_URL nor DIRECT_URL is set."
  echo "Please provide connection credentials to execute migrations."
  exit 1
fi

# Run migrate deploy (safe for production: applies unapplied migrations without resetting DB)
npm run -w @workspace/database db:migrate

echo "==> Prisma database migrations applied successfully!"
