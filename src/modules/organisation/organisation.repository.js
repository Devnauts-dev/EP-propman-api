const prisma = require('../../lib/prisma');

const clientSelect = {
  id: true,
  name: true,
  legalName: true,
  primaryEmail: true,
  primaryPhone: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      companies: true,
    },
  },
};

const companySelect = {
  id: true,
  clientId: true,
  name: true,
  registrationNumber: true,
  emailSenderName: true,
  emailSenderAddress: true,
  emailReplyToAddress: true,
  emailSignature: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      estates: true,
      portfolios: true,
    },
  },
};

const estateSelect = {
  id: true,
  companyId: true,
  name: true,
  code: true,
  addressLine1: true,
  city: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
      clientId: true,
    },
  },
  _count: {
    select: {
      portfolios: true,
    },
  },
};

const portfolioSelect = {
  id: true,
  companyId: true,
  estateId: true,
  name: true,
  code: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
      clientId: true,
    },
  },
  estate: {
    select: {
      id: true,
      name: true,
      companyId: true,
    },
  },
};

function listClients() {
  return prisma.client.findMany({
    orderBy: { name: 'asc' },
    select: clientSelect,
  });
}

function findClientById(id) {
  return prisma.client.findUnique({
    where: { id },
    select: clientSelect,
  });
}

function findClientByName(name) {
  return prisma.client.findUnique({
    where: { name },
    select: clientSelect,
  });
}

function createClient(data) {
  return prisma.client.create({
    data,
    select: clientSelect,
  });
}

function updateClient(id, data) {
  return prisma.client.update({
    where: { id },
    data,
    select: clientSelect,
  });
}

function deleteClient(id) {
  return prisma.client.delete({
    where: { id },
    select: clientSelect,
  });
}

function countCompaniesByClient(clientId) {
  return prisma.company.count({
    where: { clientId },
  });
}

function listCompanies(filters = {}) {
  const where = {};
  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  return prisma.company.findMany({
    where,
    orderBy: [{ client: { name: 'asc' } }, { name: 'asc' }],
    select: companySelect,
  });
}

function findCompanyById(id) {
  return prisma.company.findUnique({
    where: { id },
    select: companySelect,
  });
}

function findCompanyByScopedName(clientId, name) {
  return prisma.company.findUnique({
    where: {
      clientId_name: {
        clientId,
        name,
      },
    },
    select: companySelect,
  });
}

function createCompany(data) {
  return prisma.company.create({
    data,
    select: companySelect,
  });
}

function updateCompany(id, data) {
  return prisma.company.update({
    where: { id },
    data,
    select: companySelect,
  });
}

function deleteCompany(id) {
  return prisma.company.delete({
    where: { id },
    select: companySelect,
  });
}

function countEstatesByCompany(companyId) {
  return prisma.estate.count({
    where: { companyId },
  });
}

function countPortfoliosByCompany(companyId) {
  return prisma.portfolio.count({
    where: { companyId },
  });
}

function listEstates(filters = {}) {
  const where = {};
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }

  return prisma.estate.findMany({
    where,
    orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
    select: estateSelect,
  });
}

function findEstateById(id) {
  return prisma.estate.findUnique({
    where: { id },
    select: estateSelect,
  });
}

function findEstateByScopedName(companyId, name) {
  return prisma.estate.findUnique({
    where: {
      companyId_name: {
        companyId,
        name,
      },
    },
    select: estateSelect,
  });
}

function createEstate(data) {
  return prisma.estate.create({
    data,
    select: estateSelect,
  });
}

function updateEstate(id, data) {
  return prisma.estate.update({
    where: { id },
    data,
    select: estateSelect,
  });
}

function deleteEstate(id) {
  return prisma.estate.delete({
    where: { id },
    select: estateSelect,
  });
}

function countPortfoliosByEstate(estateId) {
  return prisma.portfolio.count({
    where: { estateId },
  });
}

function listPortfolios(filters = {}) {
  const where = {};
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }
  if (filters.estateId) {
    where.estateId = filters.estateId;
  }

  return prisma.portfolio.findMany({
    where,
    orderBy: [{ company: { name: 'asc' } }, { estate: { name: 'asc' } }, { name: 'asc' }],
    select: portfolioSelect,
  });
}

function findPortfolioById(id) {
  return prisma.portfolio.findUnique({
    where: { id },
    select: portfolioSelect,
  });
}

function findPortfolioByScopedName(estateId, name) {
  return prisma.portfolio.findUnique({
    where: {
      estateId_name: {
        estateId,
        name,
      },
    },
    select: portfolioSelect,
  });
}

function createPortfolio(data) {
  return prisma.portfolio.create({
    data,
    select: portfolioSelect,
  });
}

function updatePortfolio(id, data) {
  return prisma.portfolio.update({
    where: { id },
    data,
    select: portfolioSelect,
  });
}

function deletePortfolio(id) {
  return prisma.portfolio.delete({
    where: { id },
    select: portfolioSelect,
  });
}

module.exports = {
  listClients,
  findClientById,
  findClientByName,
  createClient,
  updateClient,
  deleteClient,
  countCompaniesByClient,
  listCompanies,
  findCompanyById,
  findCompanyByScopedName,
  createCompany,
  updateCompany,
  deleteCompany,
  countEstatesByCompany,
  countPortfoliosByCompany,
  listEstates,
  findEstateById,
  findEstateByScopedName,
  createEstate,
  updateEstate,
  deleteEstate,
  countPortfoliosByEstate,
  listPortfolios,
  findPortfolioById,
  findPortfolioByScopedName,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
