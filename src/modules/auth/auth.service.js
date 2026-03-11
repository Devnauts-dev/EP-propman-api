const bcrypt = require('bcryptjs');
const AppError = require('../../shared/errors/AppError');
const config = require('../../config');
const authRepository = require('./auth.repository');
const { normalizeRole, getAllowedRoleValues, ROLES } = require('../../shared/constants/roles');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../shared/utils/tokens');

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

function validateRegistrationPayload(payload) {
  const input = payload || {};
  const fullName = String(input.fullName || '').trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');
  const role = normalizeRole(input.role);

  if (!fullName || fullName.length < 2 || fullName.length > 120) {
    throw new AppError('Full name is required and must be between 2 and 120 characters', 400);
  }

  if (!email || !validateEmail(email)) {
    throw new AppError('A valid email is required', 400);
  }

  if (!validatePassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters and include at least one letter and one number',
      400
    );
  }

  if (!role) {
    throw new AppError(`Role is required. Allowed roles: ${getAllowedRoleValues().join(', ')}`, 400);
  }

  return {
    fullName,
    email,
    password,
    role,
  };
}

function issueTokens(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    tokenType: 'Bearer',
    accessTokenExpiresIn: config.jwt.accessExpiresIn,
    refreshTokenExpiresIn: config.jwt.refreshExpiresIn,
  };
}

async function register(payload) {
  const validated = validateRegistrationPayload(payload);

  const existing = await authRepository.findByEmail(validated.email);
  if (existing) {
    throw new AppError('A user with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(validated.password, SALT_ROUNDS);

  const user = await authRepository.createUser({
    fullName: validated.fullName,
    email: validated.email,
    passwordHash,
    role: validated.role,
  });

  return authRepository.toPublicUser(user);
}

async function login(payload) {
  const input = payload || {};
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await authRepository.findByEmail(email);
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const updatedUser = await authRepository.updateLastLoginAt(user.id);
  const tokens = issueTokens(updatedUser);

  return {
    user: authRepository.toPublicUser(updatedUser),
    tokens,
  };
}

async function refresh(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new AppError('Refresh token is required', 400);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid refresh token type', 401);
  }

  const userId = Number(payload.sub);
  if (Number.isNaN(userId)) {
    throw new AppError('Invalid refresh token subject', 401);
  }

  const user = await authRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Invalid refresh token user', 401);
  }

  if (payload.tokenVersion !== user.tokenVersion) {
    throw new AppError('Refresh token is no longer valid. Please login again.', 401);
  }

  return {
    user: authRepository.toPublicUser(user),
    tokens: issueTokens(user),
  };
}

async function logout(userId) {
  if (!userId) {
    throw new AppError('User id is required for logout', 400);
  }

  await authRepository.incrementTokenVersion(Number(userId));
  return { loggedOut: true };
}

async function getCurrentUser(userId) {
  const user = await authRepository.findById(Number(userId));
  if (!user || !user.isActive) {
    throw new AppError('User not found', 404);
  }
  return authRepository.toPublicUser(user);
}

async function bootstrapSuperAdminFromEnv() {
  const email = normalizeEmail(config.bootstrapAdmin.email);
  const password = config.bootstrapAdmin.password;
  const fullName = config.bootstrapAdmin.fullName;

  if (!email || !password) {
    return;
  }

  const existing = await authRepository.findByEmail(email);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await authRepository.createUser({
    fullName,
    email,
    passwordHash,
    role: ROLES.SUPER_ADMIN,
  });

  console.log(`Bootstrap super admin created: ${email}`);
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  bootstrapSuperAdminFromEnv,
};
