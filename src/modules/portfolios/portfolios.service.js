const AppError = require('../../shared/errors/AppError');
const repository = require('./portfolios.repository');
const prisma = require('../../lib/prisma');

const VALID_TYPES = ['RETAIL', 'OFFICE', 'INDUSTRIAL', 'RESIDENTIAL', 'MIXED_USE', 'OTHER'];

function validatePayload(payload) {
  const name = String(payload?.name || '').trim();
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Portfolio name is required and must be between 2 and 200 characters', 400);
  }
  const estateId = parseInt(payload?.estateId);
  if (!estateId || isNaN(estateId)) {
    throw new AppError('A valid estate ID is required', 400);
  }
  const type = String(payload?.type || 'OTHER').toUpperCase();
  if (!VALID_TYPES.includes(type)) {
    throw new AppError(`Portfolio type must be one of: ${VALID_TYPES.join(', ')}`, 400);
  }
  return { name, estateId, type };
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search || undefined;
  const estateId = query.estateId ? parseInt(query.estateId) : undefined;
  const companyId = query.companyId ? parseInt(query.companyId) : undefined;
  const isActive = query.isActive === 'false' ? false : true;
  return repository.findAll({ page, limit, search, estateId, companyId, isActive });
}

async function getById(id) {
  const portfolio = await repository.findById(id);
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  return portfolio;
}

async function create(payload) {
  const data = validatePayload(payload);
  const estate = await prisma.estate.findUnique({ where: { id: data.estateId } });
  if (!estate) throw new AppError('Parent estate not found', 404);
  const duplicate = await prisma.portfolio.findFirst({
    where: { estateId: data.estateId, name: data.name, isActive: true },
  });
  if (duplicate) throw new AppError('A portfolio with this name already exists under this estate', 409);
  return repository.create(data);
}

async function update(id, payload) {
  await getById(id);
  const data = validatePayload(payload);
  const estate = await prisma.estate.findUnique({ where: { id: data.estateId } });
  if (!estate) throw new AppError('Parent estate not found', 404);
  const duplicate = await prisma.portfolio.findFirst({
    where: { estateId: data.estateId, name: data.name, isActive: true, id: { not: id } },
  });
  if (duplicate) throw new AppError('A portfolio with this name already exists under this estate', 409);
  return repository.update(id, data);
}

async function remove(id) {
  await getById(id);
  const childCount = await prisma.property.count({ where: { portfolioId: id, isActive: true } });
  if (childCount > 0) throw new AppError('Cannot deactivate portfolio with active properties', 400);
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
