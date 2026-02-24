#!/bin/sh
set -e
# Apply pending migrations when using Prisma Migrate (no-op if none pending).
if [ -d "prisma/migrations" ]; then
  npx prisma migrate deploy
fi
exec node src/server.js
