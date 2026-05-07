const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const requiredTables = [
  'User',
  'clients',
  'companies',
  'estates',
  'portfolios',
  'properties',
  'units',
];

function describeDatabase(url) {
  const parsed = new URL(url);
  return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}${parsed.search}`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to apply the database schema');
  }

  const migrationPath = path.join(
    __dirname,
    '..',
    'prisma',
    'migrations',
    '20260507193500_initial_schema',
    'migration.sql'
  );
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  const client = new Client({ connectionString });

  console.log(`Applying schema to ${describeDatabase(connectionString)}`);

  await client.connect();
  try {
    await client.query(migrationSql);

    const { rows } = await client.query(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
      `,
      [requiredTables]
    );

    const existing = new Set(rows.map((row) => row.table_name));
    const missing = requiredTables.filter((table) => !existing.has(table));

    if (missing.length > 0) {
      throw new Error(`Schema apply did not create required tables: ${missing.join(', ')}`);
    }

    console.log(`Verified tables: ${requiredTables.join(', ')}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
