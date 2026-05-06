const AppError = require('../../shared/errors/AppError');
const repository = require('./properties.repository');
const prisma = require('../../lib/prisma');

const VALID_REGULATORY = ['INSIDE_ACT', 'OUTSIDE_1954_ACT'];
const VALID_OCCUPANCY = ['FULLY_OCCUPIED', 'PARTIALLY_OCCUPIED', 'VACANT'];

function toDecimalOrNull(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

function validatePayload(payload) {
  const name = String(payload?.name || '').trim();
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Property name is required and must be between 2 and 200 characters', 400);
  }
  const portfolioId = parseInt(payload?.portfolioId);
  if (!portfolioId || isNaN(portfolioId)) {
    throw new AppError('A valid portfolio ID is required', 400);
  }

  const regulatoryStatus = payload.regulatoryStatus
    ? String(payload.regulatoryStatus).toUpperCase()
    : 'INSIDE_ACT';
  if (!VALID_REGULATORY.includes(regulatoryStatus)) {
    throw new AppError(`Regulatory status must be one of: ${VALID_REGULATORY.join(', ')}`, 400);
  }

  const occupancyStatus = payload.occupancyStatus
    ? String(payload.occupancyStatus).toUpperCase()
    : 'VACANT';
  if (!VALID_OCCUPANCY.includes(occupancyStatus)) {
    throw new AppError(`Occupancy status must be one of: ${VALID_OCCUPANCY.join(', ')}`, 400);
  }

  return {
    name,
    portfolioId,
    address: payload.address ? String(payload.address).trim() : null,
    sizeNIA: toDecimalOrNull(payload.sizeNIA),
    sizeGIA: toDecimalOrNull(payload.sizeGIA),
    sizeIT2A: toDecimalOrNull(payload.sizeIT2A),
    sizeGEA: toDecimalOrNull(payload.sizeGEA),
    eavesHeight: toDecimalOrNull(payload.eavesHeight),
    apexHeight: toDecimalOrNull(payload.apexHeight),
    regulatoryStatus,
    occupancyStatus,
  };
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search || undefined;
  const portfolioId = query.portfolioId ? parseInt(query.portfolioId) : undefined;
  const companyId = query.companyId ? parseInt(query.companyId) : undefined;
  const occupancyStatus = query.occupancyStatus ? String(query.occupancyStatus).toUpperCase() : undefined;
  const isActive = query.isActive === 'false' ? false : true;
  return repository.findAll({ page, limit, search, portfolioId, companyId, occupancyStatus, isActive });
}

async function getById(id) {
  const property = await repository.findById(id);
  if (!property) throw new AppError('Property not found', 404);
  return property;
}

async function create(payload) {
  const data = validatePayload(payload);
  const portfolio = await prisma.portfolio.findUnique({ where: { id: data.portfolioId } });
  if (!portfolio) throw new AppError('Parent portfolio not found', 404);
  const duplicate = await prisma.property.findFirst({
    where: { portfolioId: data.portfolioId, name: data.name, isActive: true },
  });
  if (duplicate) throw new AppError('A property with this name already exists under this portfolio', 409);
  return repository.create(data);
}

async function update(id, payload) {
  await getById(id);
  const data = validatePayload(payload);
  const portfolio = await prisma.portfolio.findUnique({ where: { id: data.portfolioId } });
  if (!portfolio) throw new AppError('Parent portfolio not found', 404);
  const duplicate = await prisma.property.findFirst({
    where: { portfolioId: data.portfolioId, name: data.name, isActive: true, id: { not: id } },
  });
  if (duplicate) throw new AppError('A property with this name already exists under this portfolio', 409);
  return repository.update(id, data);
}

async function remove(id) {
  await getById(id);
  const childCount = await prisma.unit.count({ where: { propertyId: id, isActive: true } });
  if (childCount > 0) throw new AppError('Cannot deactivate property with active units', 400);
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
