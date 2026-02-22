const app = require('./app');
const config = require('./config');
const prisma = require('./lib/prisma');
require('dotenv').config()

async function start() {
  try {
    console.log(process.env.DATABASE_URL)
    await prisma.$connect();
    console.log('PostgreSQL connected (Prisma)');
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.env})`);
  });

  const shutdown = () => {
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Server and Prisma disconnected');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
