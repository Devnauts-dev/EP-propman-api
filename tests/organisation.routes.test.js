const request = require('supertest');

jest.mock('../src/shared/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.auth = { userId: 1, role: 'SUPER_ADMIN' };
    next();
  },
  authorize: (...allowedRoles) => (req, res, next) => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to perform this action' },
      });
    }

    return next();
  },
}));

const app = require('../src/app');
const prisma = require('../src/lib/prisma');

describe('organisation.routes', () => {
  beforeEach(async () => {
    await prisma.portfolio.deleteMany();
    await prisma.estate.deleteMany();
    await prisma.company.deleteMany();
    await prisma.client.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('supports CRUD across clients, companies, estates, and portfolios', async () => {
    const clientResponse = await request(app).post('/api/clients').send({
      name: 'Anchor Client',
      legalName: 'Anchor Client Holdings LLC',
      primaryEmail: 'ops@anchor.test',
      primaryPhone: '+1-555-1000',
      notes: 'Top-tier client',
    });

    expect(clientResponse.status).toBe(201);
    expect(clientResponse.body.data.name).toBe('Anchor Client');
    const clientId = clientResponse.body.data.id;

    const companyResponse = await request(app).post('/api/companies').send({
      clientId,
      name: 'Anchor Estates',
      registrationNumber: 'AE-100',
      emailSenderName: 'Anchor Estates Team',
      emailSenderAddress: 'noreply@anchor.test',
      emailReplyToAddress: 'support@anchor.test',
      emailSignature: 'Anchor Estates',
      notes: 'Primary company',
    });

    expect(companyResponse.status).toBe(201);
    expect(companyResponse.body.data.clientId).toBe(clientId);
    expect(companyResponse.body.data.emailSenderAddress).toBe('noreply@anchor.test');
    const companyId = companyResponse.body.data.id;

    const estateResponse = await request(app).post('/api/estates').send({
      companyId,
      name: 'North Estate',
      code: 'NE-1',
      addressLine1: '1 Orchard Road',
      city: 'Karachi',
      notes: 'Flagship estate',
    });

    expect(estateResponse.status).toBe(201);
    const estateId = estateResponse.body.data.id;

    const portfolioResponse = await request(app).post('/api/portfolios').send({
      companyId,
      estateId,
      name: 'Residential North',
      code: 'RN-1',
      description: 'Residential collection',
    });

    expect(portfolioResponse.status).toBe(201);
    const portfolioId = portfolioResponse.body.data.id;

    const companyListResponse = await request(app).get(`/api/companies?clientId=${clientId}`);
    expect(companyListResponse.status).toBe(200);
    expect(companyListResponse.body.data).toHaveLength(1);

    const updatedCompanyResponse = await request(app).put(`/api/companies/${companyId}`).send({
      clientId,
      name: 'Anchor Estates',
      emailSenderName: 'Anchor Service Desk',
      emailSenderAddress: 'service@anchor.test',
      emailReplyToAddress: 'reply@anchor.test',
      emailSignature: 'Regards, Anchor Service Desk',
      notes: 'Updated sender profile',
      isActive: true,
    });

    expect(updatedCompanyResponse.status).toBe(200);
    expect(updatedCompanyResponse.body.data.emailSenderName).toBe('Anchor Service Desk');

    const deletePortfolioResponse = await request(app).delete(`/api/portfolios/${portfolioId}`);
    expect(deletePortfolioResponse.status).toBe(200);

    const deleteEstateResponse = await request(app).delete(`/api/estates/${estateId}`);
    expect(deleteEstateResponse.status).toBe(200);

    const deleteCompanyResponse = await request(app).delete(`/api/companies/${companyId}`);
    expect(deleteCompanyResponse.status).toBe(200);

    const deleteClientResponse = await request(app).delete(`/api/clients/${clientId}`);
    expect(deleteClientResponse.status).toBe(200);
  });

  test('rejects duplicate company names inside the same client', async () => {
    const clientResponse = await request(app).post('/api/clients').send({
      name: 'Duplicate Client',
      primaryEmail: 'ops@duplicate.test',
    });
    const clientId = clientResponse.body.data.id;

    await request(app).post('/api/companies').send({
      clientId,
      name: 'Shared Company',
      emailSenderAddress: 'noreply@shared.test',
    });

    const duplicateResponse = await request(app).post('/api/companies').send({
      clientId,
      name: 'Shared Company',
      emailSenderAddress: 'hello@shared.test',
    });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error.message).toBe(
      'A company with this name already exists for the selected client'
    );
  });

  test('enforces hierarchy constraints for portfolio creation and company deletion', async () => {
    const clientResponse = await request(app).post('/api/clients').send({
      name: 'Hierarchy Client',
      primaryEmail: 'ops@hierarchy.test',
    });
    const clientId = clientResponse.body.data.id;

    const companyAResponse = await request(app).post('/api/companies').send({
      clientId,
      name: 'Company A',
      emailSenderAddress: 'a@hierarchy.test',
    });
    const companyBResponse = await request(app).post('/api/companies').send({
      clientId,
      name: 'Company B',
      emailSenderAddress: 'b@hierarchy.test',
    });

    const companyAId = companyAResponse.body.data.id;
    const companyBId = companyBResponse.body.data.id;

    const estateResponse = await request(app).post('/api/estates').send({
      companyId: companyAId,
      name: 'Estate A',
      city: 'Lahore',
    });
    const estateId = estateResponse.body.data.id;

    const invalidPortfolioResponse = await request(app).post('/api/portfolios').send({
      companyId: companyBId,
      estateId,
      name: 'Cross-linked Portfolio',
    });

    expect(invalidPortfolioResponse.status).toBe(400);
    expect(invalidPortfolioResponse.body.error.message).toBe(
      'Portfolio company must match the selected estate company'
    );

    const deleteCompanyResponse = await request(app).delete(`/api/companies/${companyAId}`);
    expect(deleteCompanyResponse.status).toBe(409);
    expect(deleteCompanyResponse.body.error.message).toBe(
      'Cannot delete a company while estates or portfolios are still assigned to it'
    );
  });
});
