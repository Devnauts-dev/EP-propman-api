# Postgres local setup (Docker)

This guide walks you through running PostgreSQL locally in Docker and connecting the app to it.

## Prerequisites

- **Docker** and **Docker Compose** installed
- Project cloned and dependencies installed (`npm install`)

## 1. Configure environment

From the project root, copy the example env file and edit it:

```bash
cp .env.example .env
```

In `.env`, set:

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Used by the app (Prisma). Must use **port 5433** for local Docker. | `postgresql://postgres:your_password@localhost:5433/propman_db?schema=public` |
| `POSTGRES_DB` | Database name (used by the Postgres container) | `propman_db` |
| `POSTGRES_USER` | Postgres user | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password | Your chosen password |

**Important:** Use the **same** database name, user, and password in both `DATABASE_URL` and the `POSTGRES_*` variables so the app and container match.

Example `.env`:

```env
NODE_ENV=development
PORT=5050

DATABASE_URL="postgresql://postgres:mysecret@localhost:5433/propman_db?schema=public"

POSTGRES_DB=propman_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mysecret
```

## 2. Start Postgres in Docker

From the project root:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

This will:

- Pull the `postgres:16-alpine` image if needed
- Create a container named `postgres`
- Expose Postgres on **localhost:5433** (host port 5433 → container port 5432)
- Persist data in a Docker volume
- Run any scripts in `postgres/init/` on first start (e.g. `postgres/init/01-init.sql`)

Check that the container is running:

```bash
docker ps
```

You should see the `postgres` container with port `5433->5432`.

## 3. Apply the database schema (Prisma)

After Postgres is up, create tables using Prisma:

```bash
npm run db:push
```

Or, to use migrations:

```bash
npm run db:migrate
```

## 4. Run the app

Start the API (it will connect using `DATABASE_URL` from `.env`):

```bash
npm run dev
```

You should see something like: `PostgreSQL connected (Prisma)` and `Server running on port 5050`.

## 5. Optional: init scripts

Scripts in `postgres/init/` (e.g. `01-init.sql`) run **only the first time** the Postgres container is created (when the data volume is empty). Use them for:

- Creating extensions (e.g. `uuid-ossp`)
- Extra databases or roles
- Any one-time SQL

After changing init scripts, recreate the volume to run them again:

```bash
docker compose -f docker-compose.postgres.yml down -v
docker compose -f docker-compose.postgres.yml up -d
```

**Warning:** `-v` removes the volume and **deletes all data**.

## Useful commands

| Command | Description |
|--------|-------------|
| `docker compose -f docker-compose.postgres.yml up -d` | Start Postgres in the background |
| `docker compose -f docker-compose.postgres.yml down` | Stop and remove the container (keeps data) |
| `docker compose -f docker-compose.postgres.yml down -v` | Stop and remove the container and volume (deletes data) |
| `docker compose -f docker-compose.postgres.yml logs -f postgres` | Follow Postgres logs |
| `docker exec -it postgres psql -U postgres -d propman_db` | Open a `psql` shell in the container |

## Troubleshooting

**Port 5433 already in use**

- Another process is using 5433. Stop it or change the host port in `docker-compose.postgres.yml` (e.g. `"5434:5432"`) and use that port in `DATABASE_URL`.

**Connection refused / app can’t connect**

- Ensure the container is running: `docker ps`
- Ensure `DATABASE_URL` uses **localhost** and **5433**
- Ensure user, password, and database name match the `POSTGRES_*` values used by the container

**“Database does not exist” or schema errors**

- Run `npm run db:push` (or `npm run db:migrate`) after Postgres is up so Prisma creates the schema.

**Env vars not applied**

- Compose reads `.env` from the directory where you run `docker compose`. Run the command from the **project root** where `.env` lives.
