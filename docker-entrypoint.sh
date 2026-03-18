#!/bin/sh
set -e

for required_var in DATABASE_URL JWT_ACCESS_SECRET JWT_REFRESH_SECRET
do
  eval "required_value=\${$required_var}"

  if [ -z "$required_value" ]; then
    echo "Missing required environment variable: $required_var"
    exit 1
  fi
done

# Apply schema: use migrations if present, otherwise db push (e.g. first-time deploy).
if [ -d "prisma/migrations" ]; then
  npx prisma migrate deploy
else
  npx prisma db push
fi
exec node src/server.js
