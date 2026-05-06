const prisma = require('../../lib/prisma');

async function findAll({ page = 1, limit = 20, search, portfolioId, companyId, occupancyStatus, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (portfolioId) where.portfolioId = portfolioId;
  if (companyId) where.portfolio = { estate: { companyId } };
  if (occupancyStatus) where.occupancyStatus = occupancyStatus;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        portfolio: {
          select: {
            id: true, name: true,
            estate: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
          },
        },
        _count: { select: { units: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      portfolio: {
        select: {
          id: true, name: true,
          estate: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
        },
      },
      units: { where: { isActive: true }, orderBy: { unitNumber: 'asc' } },
    },
  });
}

async function create(data) {
  return prisma.property.create({
    data,
    include: { portfolio: { select: { id: true, name: true } } },
  });
}

async function update(id, data) {
  return prisma.property.update({
    where: { id },
    data,
    include: { portfolio: { select: { id: true, name: true } } },
  });
}

async function remove(id) {
  return prisma.property.update({ where: { id }, data: { isActive: false } });
}

module.exports = { findAll, findById, create, update, remove };
