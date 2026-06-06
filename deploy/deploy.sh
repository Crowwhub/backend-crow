#!/usr/bin/env bash
# Idempotent deploy/redeploy for the crow-api backend.
# Run from the repo root on the VM:  bash deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest main"
git pull --ff-only origin main

echo "==> Installing dependencies (incl. dev, needed for build)"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building"
npm run build

echo "==> Reloading under PM2"
if pm2 describe crow-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

echo "==> Done. Status:"
pm2 status crow-api
