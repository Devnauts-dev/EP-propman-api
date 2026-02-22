require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  databaseUrl: process.env.DATABASE_URL,
};
