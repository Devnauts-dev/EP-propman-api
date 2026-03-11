const prisma = require('../../lib/prisma');

function toUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    tokenVersion: user.tokenVersion,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    passwordHash: user.passwordHash,
  };
}

function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function findById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return toUser(user);
}

async function findByEmail(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  return toUser(user);
}

async function createUser(payload) {
  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash: payload.passwordHash,
      role: payload.role,
      isActive: payload.isActive !== false,
    },
  });

  return toUser(user);
}

async function updateLastLoginAt(id) {
  const user = await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });

  return toUser(user);
}

async function incrementTokenVersion(id) {
  const user = await prisma.user.update({
    where: { id },
    data: { tokenVersion: { increment: 1 } },
  });

  return toUser(user);
}

module.exports = {
  toPublicUser,
  findById,
  findByEmail,
  createUser,
  updateLastLoginAt,
  incrementTokenVersion,
};
