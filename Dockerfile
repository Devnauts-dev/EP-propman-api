FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .
# Prisma config needs DATABASE_URL at build time (generate only). Real URL comes from .env.docker at runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate

EXPOSE 5050

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
