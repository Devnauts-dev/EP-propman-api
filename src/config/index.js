const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..', '..');

function resolveEnvFilePath() {
  const explicitPath = process.env.DOTENV_CONFIG_PATH || process.env.APP_ENV_FILE;
  if (explicitPath) {
    return path.resolve(projectRoot, explicitPath);
  }

  const defaultPath = path.resolve(projectRoot, '.env');
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }

  const envName = process.env.NODE_ENV || 'development';
  const namedEnvFiles = {
    development: '.env.dev',
    production: '.env.prod',
  };

  const preferredFile = namedEnvFiles[envName];
  if (preferredFile) {
    const preferredPath = path.resolve(projectRoot, preferredFile);
    if (fs.existsSync(preferredPath)) {
      return preferredPath;
    }
  }

  return null;
}

const envFilePath = resolveEnvFilePath();

if (envFilePath) {
  dotenv.config({ path: envFilePath });
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5050,
  databaseUrl: process.env.DATABASE_URL,
  envFilePath,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bootstrapAdmin: {
    email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD,
    fullName: process.env.BOOTSTRAP_SUPER_ADMIN_NAME || 'System Super Admin',
  },
};

function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  ...config,
  validateConfig,
};
