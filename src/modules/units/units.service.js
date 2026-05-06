const AppError = require('../../shared/errors/AppError');
const repository = require('./units.repository');
const prisma = require('../../lib/prisma');

const VALID_TYPES = ['SHOP', 'OFFICE', 'WAREHOUSE', 'APARTMENT', 'STORAGE', 'PARKING', 'OTHER'];
const VALID_STATUSES = ['OCCUPIED', 'VACANT', 'UNDER_MAINTENANCE', 'RESERVED'];

function validatePayload(payload) {
  const unitNumber = String(payload?.unitNumber || '').trim();
  if (!unitNumber || unitNumber.length < 1 || unitNumber.length > 50) {
    throw new AppError('Unit number is required and must be between 1 and 50 characters', 400);
  }
  const propertyId = parseInt(payload?.propertyId);
  if (!propertyId || isNaN(propertyId)) {
    throw new AppError('A valid property ID is required', 400);
  }

  const type = payload.type ? String(payload.type).toUpperCase() : 'OTHER';
  if (!VALID_TYPES.includes(type)) {
    throw new AppError(`Unit type must be one of: ${VALID_TYPES.join(', ')}`, 400);
  }

  const status = payload.status ? String(payload.status).toUpperCase() : 'VACANT';
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(`Unit status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  return { unitNumber, propertyId, type, status };
}

async function list(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const search = query.search || undefined;
  const propertyId = query.propertyId ? parseInt(query.propertyId) : undefined;
  const companyId = query.companyId ? parseInt(query.companyId) : undefined;
  const status = query.status ? String(query.status).toUpperCase() : undefined;
  const isActive = query.isActive === 'false' ? false : true;
  return repository.findAll({ page, limit, search, propertyId, companyId, status, isActive });
}

async function getById(id) {
  const unit = await repository.findById(id);
  if (!unit) throw new AppError('Unit not found', 404);
  return unit;
}

async function create(payload) {
  const data = validatePayload(payload);
  const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
  if (!property) throw new AppError('Parent property not found', 404);
  const duplicate = await prisma.unit.findFirst({
    where: { propertyId: data.propertyId, unitNumber: data.unitNumber, isActive: true },
  });
  if (duplicate) throw new AppError('A unit with this number already exists under this property', 409);
  return repository.create(data);
}

async function update(id, payload) {
  await getById(id);
  const data = validatePayload(payload);
  const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
  if (!property) throw new AppError('Parent property not found', 404);
  const duplicate = await prisma.unit.findFirst({
    where: { propertyId: data.propertyId, unitNumber: data.unitNumber, isActive: true, id: { not: id } },
  });
  if (duplicate) throw new AppError('A unit with this number already exists under this property', 409);
  return repository.update(id, data);
}

async function remove(id) {
  await getById(id);
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };
