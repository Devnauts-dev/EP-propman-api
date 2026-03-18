const config = require('../config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = config.databaseUrl;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;
