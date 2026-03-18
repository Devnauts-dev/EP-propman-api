const AppError = require('../../shared/errors/AppError');
const repository = require('./organisation.repository');

function normalizeString(value) {
  const input = typeof value === 'string' ? value.trim() : '';
  return input || null;
}

function normalizeName(value, fieldLabel) {
  const input = normalizeString(value);
  if (!input || input.length < 2 || input.length > 120) {
    throw new AppError(`${fieldLabel} is required and must be between 2 and 120 characters`, 400);
  }

  return input;
}

function normalizeOptionalEmail(value, fieldLabel) {
  const input = normalizeString(value);
  if (!input) return null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
    throw new AppError(`${fieldLabel} must be a valid email address`, 400);
  }

  return input.toLowerCase();
}

function normalizeOptionalBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function normalizeRequiredId(value, fieldLabel) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldLabel} is required`, 400);
  }

  return parsed;
}

async function requireClient(clientId) {
  const client = await repository.findClientById(clientId);
  if (!client) {
    throw new AppError('Client not found', 404);
  }

  return client;
}

async function requireCompany(companyId) {
  const company = await repository.findCompanyById(companyId);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  return company;
}

async function requireEstate(estateId) {
  const estate = await repository.findEstateById(estateId);
  if (!estate) {
    throw new AppError('Estate not found', 404);
  }

  return estate;
}

function sanitizeClientPayload(payload, { isUpdate = false } = {}) {
  const input = payload || {};
  const data = {
    name: normalizeName(input.name, 'Client name'),
    legalName: normalizeString(input.legalName),
    primaryEmail: normalizeOptionalEmail(input.primaryEmail, 'Client primary email'),
    primaryPhone: normalizeString(input.primaryPhone),
    notes: normalizeString(input.notes),
    isActive: normalizeOptionalBoolean(input.isActive, true),
  };

  if (isUpdate && typeof input.isActive === 'undefined') {
    delete data.isActive;
  }

  return data;
}

function sanitizeCompanyPayload(payload, { isUpdate = false } = {}) {
  const input = payload || {};
  const data = {
    clientId: normalizeRequiredId(input.clientId, 'Client'),
    name: normalizeName(input.name, 'Company name'),
    registrationNumber: normalizeString(input.registrationNumber),
    emailSenderName: normalizeString(input.emailSenderName),
    emailSenderAddress: normalizeOptionalEmail(input.emailSenderAddress, 'Company sender email'),
    emailReplyToAddress: normalizeOptionalEmail(input.emailReplyToAddress, 'Company reply-to email'),
    emailSignature: normalizeString(input.emailSignature),
    notes: normalizeString(input.notes),
    isActive: normalizeOptionalBoolean(input.isActive, true),
  };

  if (isUpdate && typeof input.isActive === 'undefined') {
    delete data.isActive;
  }

  return data;
}

function sanitizeEstatePayload(payload, { isUpdate = false } = {}) {
  const input = payload || {};
  const data = {
    companyId: normalizeRequiredId(input.companyId, 'Company'),
    name: normalizeName(input.name, 'Estate name'),
    code: normalizeString(input.code),
    addressLine1: normalizeString(input.addressLine1),
    city: normalizeString(input.city),
    notes: normalizeString(input.notes),
    isActive: normalizeOptionalBoolean(input.isActive, true),
  };

  if (isUpdate && typeof input.isActive === 'undefined') {
    delete data.isActive;
  }

  return data;
}

function sanitizePortfolioPayload(payload, { isUpdate = false } = {}) {
  const input = payload || {};
  const data = {
    companyId: normalizeRequiredId(input.companyId, 'Company'),
    estateId: normalizeRequiredId(input.estateId, 'Estate'),
    name: normalizeName(input.name, 'Portfolio name'),
    code: normalizeString(input.code),
    description: normalizeString(input.description),
    isActive: normalizeOptionalBoolean(input.isActive, true),
  };

  if (isUpdate && typeof input.isActive === 'undefined') {
    delete data.isActive;
  }

  return data;
}

async function listClients() {
  return repository.listClients();
}

async function getClient(id) {
  return requireClient(Number(id));
}

async function createClient(payload) {
  const data = sanitizeClientPayload(payload);
  const duplicate = await repository.findClientByName(data.name);
  if (duplicate) {
    throw new AppError('A client with this name already exists', 409);
  }

  return repository.createClient(data);
}

async function updateClient(id, payload) {
  const clientId = Number(id);
  const existing = await requireClient(clientId);
  const data = sanitizeClientPayload({ ...existing, ...payload }, { isUpdate: true });
  const duplicate = await repository.findClientByName(data.name);

  if (duplicate && duplicate.id !== clientId) {
    throw new AppError('A client with this name already exists', 409);
  }

  return repository.updateClient(clientId, data);
}

async function deleteClient(id) {
  const clientId = Number(id);
  await requireClient(clientId);

  const companyCount = await repository.countCompaniesByClient(clientId);
  if (companyCount > 0) {
    throw new AppError('Cannot delete a client while companies are still assigned to it', 409);
  }

  return repository.deleteClient(clientId);
}

async function listCompanies(filters = {}) {
  const clientId = filters.clientId ? Number(filters.clientId) : null;
  if (filters.clientId && (!Number.isInteger(clientId) || clientId <= 0)) {
    throw new AppError('clientId must be a valid integer', 400);
  }

  return repository.listCompanies({ clientId });
}

async function getCompany(id) {
  return requireCompany(Number(id));
}

async function createCompany(payload) {
  const data = sanitizeCompanyPayload(payload);
  await requireClient(data.clientId);

  const duplicate = await repository.findCompanyByScopedName(data.clientId, data.name);
  if (duplicate) {
    throw new AppError('A company with this name already exists for the selected client', 409);
  }

  return repository.createCompany(data);
}

async function updateCompany(id, payload) {
  const companyId = Number(id);
  const existing = await requireCompany(companyId);
  const data = sanitizeCompanyPayload({ ...existing, ...payload }, { isUpdate: true });
  await requireClient(data.clientId);

  const duplicate = await repository.findCompanyByScopedName(data.clientId, data.name);
  if (duplicate && duplicate.id !== companyId) {
    throw new AppError('A company with this name already exists for the selected client', 409);
  }

  return repository.updateCompany(companyId, data);
}

async function deleteCompany(id) {
  const companyId = Number(id);
  await requireCompany(companyId);

  const [estateCount, portfolioCount] = await Promise.all([
    repository.countEstatesByCompany(companyId),
    repository.countPortfoliosByCompany(companyId),
  ]);

  if (estateCount > 0 || portfolioCount > 0) {
    throw new AppError('Cannot delete a company while estates or portfolios are still assigned to it', 409);
  }

  return repository.deleteCompany(companyId);
}

async function listEstates(filters = {}) {
  const companyId = filters.companyId ? Number(filters.companyId) : null;
  if (filters.companyId && (!Number.isInteger(companyId) || companyId <= 0)) {
    throw new AppError('companyId must be a valid integer', 400);
  }

  return repository.listEstates({ companyId });
}

async function getEstate(id) {
  return requireEstate(Number(id));
}

async function createEstate(payload) {
  const data = sanitizeEstatePayload(payload);
  await requireCompany(data.companyId);

  const duplicate = await repository.findEstateByScopedName(data.companyId, data.name);
  if (duplicate) {
    throw new AppError('An estate with this name already exists for the selected company', 409);
  }

  return repository.createEstate(data);
}

async function updateEstate(id, payload) {
  const estateId = Number(id);
  const existing = await requireEstate(estateId);
  const data = sanitizeEstatePayload({ ...existing, ...payload }, { isUpdate: true });
  await requireCompany(data.companyId);

  const duplicate = await repository.findEstateByScopedName(data.companyId, data.name);
  if (duplicate && duplicate.id !== estateId) {
    throw new AppError('An estate with this name already exists for the selected company', 409);
  }

  return repository.updateEstate(estateId, data);
}

async function deleteEstate(id) {
  const estateId = Number(id);
  await requireEstate(estateId);

  const portfolioCount = await repository.countPortfoliosByEstate(estateId);
  if (portfolioCount > 0) {
    throw new AppError('Cannot delete an estate while portfolios are still assigned to it', 409);
  }

  return repository.deleteEstate(estateId);
}

async function listPortfolios(filters = {}) {
  const companyId = filters.companyId ? Number(filters.companyId) : null;
  const estateId = filters.estateId ? Number(filters.estateId) : null;

  if (filters.companyId && (!Number.isInteger(companyId) || companyId <= 0)) {
    throw new AppError('companyId must be a valid integer', 400);
  }

  if (filters.estateId && (!Number.isInteger(estateId) || estateId <= 0)) {
    throw new AppError('estateId must be a valid integer', 400);
  }

  return repository.listPortfolios({ companyId, estateId });
}

async function getPortfolio(id) {
  const portfolio = await repository.findPortfolioById(Number(id));
  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  return portfolio;
}

async function createPortfolio(payload) {
  const data = sanitizePortfolioPayload(payload);
  await requireCompany(data.companyId);
  const estate = await requireEstate(data.estateId);

  if (estate.companyId !== data.companyId) {
    throw new AppError('Portfolio company must match the selected estate company', 400);
  }

  const duplicate = await repository.findPortfolioByScopedName(data.estateId, data.name);
  if (duplicate) {
    throw new AppError('A portfolio with this name already exists for the selected estate', 409);
  }

  return repository.createPortfolio(data);
}

async function updatePortfolio(id, payload) {
  const portfolioId = Number(id);
  const existing = await getPortfolio(portfolioId);
  const data = sanitizePortfolioPayload({ ...existing, ...payload }, { isUpdate: true });
  await requireCompany(data.companyId);
  const estate = await requireEstate(data.estateId);

  if (estate.companyId !== data.companyId) {
    throw new AppError('Portfolio company must match the selected estate company', 400);
  }

  const duplicate = await repository.findPortfolioByScopedName(data.estateId, data.name);
  if (duplicate && duplicate.id !== portfolioId) {
    throw new AppError('A portfolio with this name already exists for the selected estate', 409);
  }

  return repository.updatePortfolio(portfolioId, data);
}

async function deletePortfolio(id) {
  const portfolioId = Number(id);
  await getPortfolio(portfolioId);
  return repository.deletePortfolio(portfolioId);
}

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  listEstates,
  getEstate,
  createEstate,
  updateEstate,
  deleteEstate,
  listPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
