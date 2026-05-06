const prisma = require('../../lib/prisma');

async function findAll({ page = 1, limit = 20, search, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: { _count: { select: { companies: true, estates: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      companies: { where: { isActive: true }, orderBy: { name: 'asc' } },
      estates: { where: { isActive: true }, orderBy: { name: 'asc' } },
    },
  });
}

async function create(data) {
  return prisma.client.create({ data });
}

async function update(id, data) {
  return prisma.client.update({ where: { id }, data });
}

async function remove(id) {
  return prisma.client.update({ where: { id }, data: { isActive: false } });
}

module.exports = { findAll, findById, create, update, remove };
