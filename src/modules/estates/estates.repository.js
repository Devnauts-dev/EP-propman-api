const prisma = require('../../lib/prisma');

async function findAll({ page = 1, limit = 20, search, clientId, companyId, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (clientId) where.clientId = clientId;
  if (companyId) where.companyId = companyId;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.estate.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        _count: { select: { portfolios: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.estate.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id) {
  return prisma.estate.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
      portfolios: { where: { isActive: true }, orderBy: { name: 'asc' } },
    },
  });
}

async function create(data) {
  return prisma.estate.create({
    data,
    include: {
      client: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
    },
  });
}

async function update(id, data) {
  return prisma.estate.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
    },
  });
}

async function remove(id) {
  return prisma.estate.update({ where: { id }, data: { isActive: false } });
}

module.exports = { findAll, findById, create, update, remove };
