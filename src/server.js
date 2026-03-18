const app = require('./app');
const config = require('./config');
const prisma = require('./lib/prisma');
const { bootstrapSuperAdminFromEnv } = require('./modules/auth/auth.service');

async function start() {
  try {
    config.validateConfig();
    await prisma.$connect();
    console.log('PostgreSQL connected (Prisma)');
    await bootstrapSuperAdminFromEnv();
  } catch (err) {
    console.error('Server startup failed:', err.message);
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
