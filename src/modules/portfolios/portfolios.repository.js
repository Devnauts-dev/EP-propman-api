const prisma = require('../../lib/prisma');

async function findAll({ page = 1, limit = 20, search, estateId, companyId, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (estateId) where.estateId = estateId;
  if (companyId) where.estate = { companyId };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.portfolio.findMany({
      where,
      include: {
        estate: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        _count: { select: { properties: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.portfolio.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id) {
  return prisma.portfolio.findUnique({
    where: { id },
    include: {
      estate: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
      properties: { where: { isActive: true }, orderBy: { name: 'asc' } },
    },
  });
}

async function create(data) {
  return prisma.portfolio.create({
    data,
    include: { estate: { select: { id: true, name: true } } },
  });
}

async function update(id, data) {
  return prisma.portfolio.update({
    where: { id },
    data,
    include: { estate: { select: { id: true, name: true } } },
  });
}

async function remove(id) {
  return prisma.portfolio.update({ where: { id }, data: { isActive: false } });
}

module.exports = { findAll, findById, create, update, remove };
