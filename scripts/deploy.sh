#!/bin/bash

ENVIRONMENT="production"  # change to staging or dev if needed

echo "=== Phkasla Deployment Started ($ENVIRONMENT) ==="

cd /www/wwwroot/project || exit

git reset --hard
git pull origin main

pnpm install --frozen-lockfile

echo "=== Loading Environment ($ENVIRONMENT) ==="
if [ "$ENVIRONMENT" = "production" ]; then
  cp apps/backend/.env.production apps/backend/.env
  cp apps/web/.env.production apps/web/.env
else
  cp apps/backend/.env.$ENVIRONMENT apps/backend/.env
  cp apps/web/.env.$ENVIRONMENT apps/web/.env
fi

echo "=== Building backend ==="
pnpm --filter ./apps/backend build

echo "=== Building Next.js standalone ==="
pnpm --filter ./apps/web build
cp -R apps/web/.next/static apps/web/.next/standalone/.next/static

echo "=== Reloading PM2 in $ENVIRONMENT mode ==="
pm2 reload ecosystem.config.js --env $ENVIRONMENT

pm2 flush

echo "=== Deployment Complete ($ENVIRONMENT) ==="
exit 0
