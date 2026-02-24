#!/bin/sh
set -e
# Apply schema: use migrations if present, otherwise db push (e.g. first-time deploy).
if [ -d "prisma/migrations" ]; then
  npx prisma migrate deploy
else
  npx prisma db push
fi
exec node src/server.js
