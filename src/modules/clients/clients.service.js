const AppError = require('../../shared/errors/AppError');
const repository = require('./clients.repository');
const prisma = require('../../lib/prisma');

function validatePayload(payload) {
  const name = String(payload?.name || '').trim();
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Client name is required and must be between 2 and 200 characters', 400);
  }
  return {
    name,
    unifiedManagementStatus: Boolean(payload.unifiedManagementStatus),
  };
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search || undefined;
  const isActive = query.isActive === 'false' ? false : true;
  return repository.findAll({ page, limit, search, isActive });
}

async function getById(id) {
  const client = await repository.findById(id);
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

async function create(payload) {
  const data = validatePayload(payload);
  const duplicate = await prisma.client.findFirst({
    where: { name: data.name, isActive: true },
  });
  if (duplicate) throw new AppError('A client with this name already exists', 409);
  return repository.create(data);
}

async function update(id, payload) {
  await getById(id);
  const data = validatePayload(payload);
  const duplicate = await prisma.client.findFirst({
    where: { name: data.name, isActive: true, id: { not: id } },
  });
  if (duplicate) throw new AppError('A client with this name already exists', 409);
  return repository.update(id, data);
}

async function remove(id) {
  await getById(id);
  const companyCount = await prisma.company.count({ where: { clientId: id, isActive: true } });
  if (companyCount > 0) throw new AppError('Cannot deactivate client with active companies', 400);
  const estateCount = await prisma.estate.count({ where: { clientId: id, isActive: true } });
  if (estateCount > 0) throw new AppError('Cannot deactivate client with active estates', 400);
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
