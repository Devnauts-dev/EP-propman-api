const prisma = require('../../lib/prisma');

async function findAll({ page = 1, limit = 20, search, propertyId, companyId, status, isActive }) {
  const where = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (propertyId) where.propertyId = propertyId;
  if (companyId) where.property = { portfolio: { estate: { companyId } } };
  if (status) where.status = status;
  if (search) where.unitNumber = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      include: {
        property: {
          select: {
            id: true, name: true,
            portfolio: {
              select: {
                id: true, name: true,
                estate: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.unit.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id) {
  return prisma.unit.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true, name: true,
          portfolio: {
            select: {
              id: true, name: true,
              estate: { select: { id: true, name: true, client: { select: { id: true, name: true } } } },
            },
          },
        },
      },
    },
  });
}

async function create(data) {
  return prisma.unit.create({
    data,
    include: { property: { select: { id: true, name: true } } },
  });
}

async function update(id, data) {
  return prisma.unit.update({
    where: { id },
    data,
    include: { property: { select: { id: true, name: true } } },
  });
}

async function remove(id) {
  return prisma.unit.update({ where: { id }, data: { isActive: false } });
}

module.exports = { findAll, findById, create, update, remove };
