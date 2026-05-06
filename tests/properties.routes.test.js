const express = require('express');
const request = require('supertest');

jest.mock('../src/modules/properties/properties.service', () => ({
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

const propertiesRoutes = require('../src/modules/properties/properties.routes');
const service = require('../src/modules/properties/properties.service');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/properties', propertiesRoutes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      error: { message: err.message || 'Internal Server Error' },
    });
  });
  return app;
}

describe('properties.routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/properties returns list', async () => {
    const app = createApp();
    service.list.mockResolvedValue({
      data: [{ id: 1, name: 'Prop 1', occupancyStatus: 'VACANT' }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });

    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/properties/:id returns a property', async () => {
    const app = createApp();
    service.getById.mockResolvedValue({ id: 1, name: 'Prop 1' });

    const res = await request(app).get('/api/properties/1');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Prop 1');
  });

  test('GET /api/properties/:id with invalid id returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/properties/abc');
    expect(res.status).toBe(400);
  });

  test('GET /api/properties/:id with float id returns 400', async () => {
    const app = createApp();
    const res = await request(app).get('/api/properties/1.5');
    expect(res.status).toBe(400);
  });

  test('POST /api/properties creates a property', async () => {
    const app = createApp();
    service.create.mockResolvedValue({ id: 2, name: 'New Prop' });

    const res = await request(app).post('/api/properties').send({
      name: 'New Prop', portfolioId: 1,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('PUT /api/properties/:id updates a property', async () => {
    const app = createApp();
    service.update.mockResolvedValue({ id: 1, name: 'Updated' });

    const res = await request(app).put('/api/properties/1').send({
      name: 'Updated', portfolioId: 1,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/properties/:id deactivates a property', async () => {
    const app = createApp();
    service.remove.mockResolvedValue();

    const res = await request(app).delete('/api/properties/1');
    expect(res.status).toBe(200);
  });
});
