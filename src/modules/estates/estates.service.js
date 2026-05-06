const AppError = require('../../shared/errors/AppError');
const repository = require('./estates.repository');
const prisma = require('../../lib/prisma');

function validatePayload(payload) {
  const name = String(payload?.name || '').trim();
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Estate name is required and must be between 2 and 200 characters', 400);
  }
  const clientId = parseInt(payload?.clientId);
  if (!clientId || isNaN(clientId)) {
    throw new AppError('A valid client ID is required', 400);
  }
  const companyId = parseInt(payload?.companyId);
  if (!companyId || isNaN(companyId)) {
    throw new AppError('A valid company ID is required', 400);
  }
  return { name, clientId, companyId };
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search || undefined;
  const clientId = query.clientId ? parseInt(query.clientId) : undefined;
  const companyId = query.companyId ? parseInt(query.companyId) : undefined;
  const isActive = query.isActive === 'false' ? false : true;
  return repository.findAll({ page, limit, search, clientId, companyId, isActive });
}

async function getById(id) {
  const estate = await repository.findById(id);
  if (!estate) throw new AppError('Estate not found', 404);
  return estate;
}

async function create(payload) {
  const data = validatePayload(payload);
  const company = await prisma.company.findUnique({ where: { id: data.companyId } });
  if (!company) throw new AppError('Parent company not found', 404);
  if (company.clientId !== data.clientId) {
    throw new AppError('Company does not belong to the specified client', 400);
  }
  const duplicate = await prisma.estate.findFirst({
    where: { companyId: data.companyId, name: data.name, isActive: true },
  });
  if (duplicate) throw new AppError('An estate with this name already exists under this company', 409);
  return repository.create(data);
}

async function update(id, payload) {
  await getById(id);
  const data = validatePayload(payload);
  const company = await prisma.company.findUnique({ where: { id: data.companyId } });
  if (!company) throw new AppError('Parent company not found', 404);
  if (company.clientId !== data.clientId) {
    throw new AppError('Company does not belong to the specified client', 400);
  }
  const duplicate = await prisma.estate.findFirst({
    where: { companyId: data.companyId, name: data.name, isActive: true, id: { not: id } },
  });
  if (duplicate) throw new AppError('An estate with this name already exists under this company', 409);
  return repository.update(id, data);
}

async function remove(id) {
  await getById(id);
  const childCount = await prisma.portfolio.count({ where: { estateId: id, isActive: true } });
  if (childCount > 0) throw new AppError('Cannot deactivate estate with active portfolios', 400);
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
