# EP PropMan API

Backend API for authentication and role-based access control (RBAC) using:

- Node.js + Express
- PostgreSQL + Prisma
- JWT (access + refresh tokens)
- Jest tests

## Roles

The API supports exactly these four roles:

- `SUPER_ADMIN`
- `PROPERTY_MANAGER`
- `ACCOUNTANT`
- `COMPLIANCE_OFFICER`

## API Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/health` | Public | Health check |
| POST | `/api/auth/login` | Public | Login and receive access/refresh tokens |
| POST | `/api/auth/refresh` | Public | Refresh tokens |
| GET | `/api/auth/me` | Authenticated | Get current user |
| GET | `/api/auth/roles` | Super Admin | List allowed roles |
| POST | `/api/auth/register` | Super Admin | Create user with role |
| POST | `/api/auth/logout` | Authenticated | Revoke session token version |

## API Collection

Use:

- [api_collection.http](./api_collection.http) for REST Client style requests
- [api_collection.json](./api_collection.json) for Postman import

## Environment Variables

Copy `.env.example` to `.env` and set:

```bash
NODE_ENV=development
PORT=5050
DATABASE_URL="postgresql://postgres:your_password@localhost:5433/propman_db?schema=public"

JWT_ACCESS_SECRET="replace-with-long-random-string"
JWT_REFRESH_SECRET="replace-with-another-long-random-string"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Optional first super admin bootstrap (recommended for first setup)
BOOTSTRAP_SUPER_ADMIN_EMAIL=superadmin@example.com
BOOTSTRAP_SUPER_ADMIN_PASSWORD=ChangeMe123!
BOOTSTRAP_SUPER_ADMIN_NAME="System Super Admin"
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Push schema to DB:

```bash
npm run db:push
```

3. Run server:

```bash
npm run dev
```

API base URL: `http://localhost:5050`

## Tests (Jest)

Run all tests:

```bash
npm test
```

Current test coverage focus:

- Auth service unit tests
- Auth routes tests with mocked middleware/service

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema |
| `npm run db:migrate` | Create/apply migration in dev |
| `npm run test` | Run Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
