const AppError = require('../../shared/errors/AppError');
const repository = require('./companies.repository');
const prisma = require('../../lib/prisma');

function validatePayload(payload) {
  const name = String(payload?.name || '').trim();
  if (!name || name.length < 2 || name.length > 200) {
    throw new AppError('Company name is required and must be between 2 and 200 characters', 400);
  }
  const clientId = parseInt(payload?.clientId);
  if (!clientId || isNaN(clientId)) {
    throw new AppError('A valid client ID is required', 400);
  }
  return {
    name,
    clientId,
    emailSenderName: payload.emailSenderName || null,
    emailSenderAddress: payload.emailSenderAddress || null,
    emailReplyToAddress: payload.emailReplyToAddress || null,
    emailSignature: payload.emailSignature || null,
    vatStatus: Boolean(payload.vatStatus),
  };
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search || undefined;
  const clientId = query.clientId ? parseInt(query.clientId) : undefined;
  const isActive = query.isActive === 'false' ? false : true;
  return repository.findAll({ page, limit, search, clientId, isActive });
}

async function getById(id) {
  const company = await repository.findById(id);
  if (!company) throw new AppError('Company not found', 404);
  return company;
}

async function create(payload) {
  const data = validatePayload(payload);
  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) throw new AppError('Parent client not found', 404);
  const duplicate = await prisma.company.findFirst({
    where: { clientId: data.clientId, name: data.name, isActive: true },
  });
  if (duplicate) throw new AppError('A company with this name already exists under this client', 409);
  return repository.create(data);
}

async function update(id, payload) {
  await getById(id);
  const data = validatePayload(payload);
  const client = await prisma.client.findUnique({ where: { id: data.clientId } });
  if (!client) throw new AppError('Parent client not found', 404);
  const duplicate = await prisma.company.findFirst({
    where: { clientId: data.clientId, name: data.name, isActive: true, id: { not: id } },
  });
  if (duplicate) throw new AppError('A company with this name already exists under this client', 409);
  return repository.update(id, data);
}

async function remove(id) {
  await getById(id);
  const estateCount = await prisma.estate.count({ where: { companyId: id, isActive: true } });
  if (estateCount > 0) throw new AppError('Cannot deactivate company with active estates', 400);
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
