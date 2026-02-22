# DevOps-Practice

E-Commerce REST API backend built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma**.

## Project structure (scalable)

```
prisma/
└── schema.prisma           # Prisma schema (models, datasource)

src/
├── app.js                  # Express app (middleware, routes)
├── server.js               # Entry point, Prisma connect, listen
├── config/
│   └── index.js            # Env/config
├── lib/
│   └── prisma.js           # Prisma Client singleton
├── modules/
│   └── products/           # Products feature module
│       ├── index.js
│       ├── product.routes.js
│       ├── product.controller.js
│       ├── product.service.js
│       └── product.repository.js   # Uses Prisma
└── shared/
    ├── middleware/         # errorHandler, notFound
    ├── errors/             # AppError
    └── utils/              # slugify, etc.
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```
   This runs `prisma generate` automatically (postinstall).

2. **PostgreSQL & environment**

   Copy `.env.example` to `.env` and set `DATABASE_URL` (app uses only this):

   ```bash
   cp .env.example .env
   # Set DATABASE_URL (e.g. postgresql://user:password@localhost:5433/dbname?schema=public)
   # POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD are for the Postgres container only
   ```

3. **Apply schema to the database**

   **Option A – push schema (no migration history):**
   ```bash
   npm run db:push
   ```

   **Option B – create a migration (recommended for production):**
   ```bash
   npm run db:migrate
   ```

4. **Run the server**

   ```bash
   npm start
   # or with auto-reload
   npm run dev
   ```

   API base: `http://localhost:5050`

## Docker

### Postgres only (connect from code)

Run Postgres in Docker and connect from your app on the host:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Postgres is exposed on **localhost:5433**. Set `DATABASE_URL` in `.env` (host=localhost, port=5433) and run your app (e.g. `npm run dev`). The container needs `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` in `.env`.

### Full stack (Postgres + backend in Docker)

```bash
docker compose up -d
```

Put `DATABASE_URL` in `.env.docker` with host `postgres` (e.g. `postgresql://user:pass@postgres:5432/dbname?schema=public`). The Postgres container uses `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` from `.env`.

First time, apply schema:

```bash
docker compose exec backend npx prisma db push
```

## Prisma commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client after schema changes |
| `npm run db:push` | Push schema to DB (dev / prototyping) |
| `npm run db:migrate` | Create and run migrations |

## Products API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products (search, category, pagination) |
| GET | `/api/products/slug/:slug` | Get product by slug |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PATCH/PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### List & search

- `GET /api/products?search=keyword` – search in name, description, SKU
- `GET /api/products?category=Electronics`
- `GET /api/products?page=1&limit=20`
- `GET /api/products?isActive=true`

### Create product body (JSON)

```json
{
  "name": "Product Name",
  "price": 29.99,
  "description": "Optional description",
  "slug": "optional-slug",
  "sku": "SKU-001",
  "stock": 100,
  "category": "Electronics",
  "imageUrl": "https://...",
  "isActive": true
}
```

Responses: `{ "success": true, "data": { ... } }` or list with `"pagination": { "page", "limit", "total", "totalPages" }`.

## Health

- `GET /health` – returns `{ "success": true, "message": "OK" }`
