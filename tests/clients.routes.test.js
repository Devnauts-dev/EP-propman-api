const express = require('express');
const request = require('supertest');

jest.mock('../src/modules/clients/clients.service', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../src/shared/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.auth = { userId: 1, role: 'SUPER_ADMIN' };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const clientsRoutes = require('../src/modules/clients/clients.routes');
const service = require('../src/modules/clients/clients.service');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/clients', clientsRoutes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      error: { message: err.message || 'Internal Server Error' },
    });
  });
  return app;
}

describe('clients.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/clients returns list', async () => {
    const app = createApp();
    service.list.mockResolvedValue({
      data: [{ id: 1, name: 'Acme Corp', unifiedManagementStatus: false }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });

    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toHaveLength(1);
    expect(service.list).toHaveBeenCalled();
  });

  test('GET /api/clients/:id returns a single client', async () => {
    const app = createApp();
    service.getById.mockResolvedValue({ id: 1, name: 'Acme Corp' });

    const res = await request(app).get('/api/clients/1');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Acme Corp');
  });

  test('GET /api/clients/:id with invalid id returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/clients/abc');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/clients creates a client', async () => {
    const app = createApp();
    service.create.mockResolvedValue({ id: 2, name: 'New Client', unifiedManagementStatus: true });

    const res = await request(app).post('/api/clients').send({ name: 'New Client', unifiedManagementStatus: true });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(service.create).toHaveBeenCalledWith({ name: 'New Client', unifiedManagementStatus: true });
  });

  test('PUT /api/clients/:id updates a client', async () => {
    const app = createApp();
    service.update.mockResolvedValue({ id: 1, name: 'Updated', unifiedManagementStatus: false });

    const res = await request(app).put('/api/clients/1').send({ name: 'Updated', unifiedManagementStatus: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(service.update).toHaveBeenCalledWith(1, { name: 'Updated', unifiedManagementStatus: false });
  });

  test('DELETE /api/clients/:id deactivates a client', async () => {
    const app = createApp();
    service.remove.mockResolvedValue();

    const res = await request(app).delete('/api/clients/1');
    expect(res.status).toBe(200);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
