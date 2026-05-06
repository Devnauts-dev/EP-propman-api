const prisma = require('../../lib/prisma');

async function findAll({ page = 1, limit = 20, search, clientId, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (clientId) where.clientId = clientId;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      estates: { where: { isActive: true }, orderBy: { name: 'asc' } },
    },
  });
}

async function create(data) {
  return prisma.company.create({
    data,
    include: { client: { select: { id: true, name: true } } },
  });
}

async function update(id, data) {
  return prisma.company.update({
    where: { id },
    data,
    include: { client: { select: { id: true, name: true } } },
  });
}

async function remove(id) {
  return prisma.company.update({ where: { id }, data: { isActive: false } });
}

module.exports = { findAll, findById, create, update, remove };
