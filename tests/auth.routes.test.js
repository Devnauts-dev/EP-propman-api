const express = require('express');
const request = require('supertest');

jest.mock('../src/modules/auth/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock('../src/shared/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.auth = { userId: 1, role: 'SUPER_ADMIN' };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

const authRoutes = require('../src/modules/auth/auth.routes');
const authService = require('../src/modules/auth/auth.service');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      error: { message: err.message || 'Internal Server Error' },
    });
  });
  return app;
}

describe('auth.routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/login returns auth payload', async () => {
    const app = createApp();
    authService.login.mockResolvedValue({
      user: { id: 1, email: 'admin@example.com', role: 'SUPER_ADMIN' },
      tokens: { accessToken: 'a', refreshToken: 'r', tokenType: 'Bearer' },
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'SecurePass123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(authService.login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'SecurePass123',
    });
  });

  test('POST /api/auth/refresh forwards refresh token', async () => {
    const app = createApp();
    authService.refresh.mockResolvedValue({
      user: { id: 1, email: 'admin@example.com', role: 'SUPER_ADMIN' },
      tokens: { accessToken: 'next-a', refreshToken: 'next-r', tokenType: 'Bearer' },
    });

    const response = await request(app).post('/api/auth/refresh').send({
      refreshToken: 'old-refresh',
    });

    expect(response.status).toBe(200);
    expect(authService.refresh).toHaveBeenCalledWith('old-refresh');
  });

  test('POST /api/auth/register creates user', async () => {
    const app = createApp();
    authService.register.mockResolvedValue({
      id: 2,
      email: 'manager@example.com',
      role: 'PROPERTY_MANAGER',
      fullName: 'Property Manager',
    });

    const payload = {
      fullName: 'Property Manager',
      email: 'manager@example.com',
      password: 'SecurePass123',
      role: 'PROPERTY_MANAGER',
    };

    const response = await request(app).post('/api/auth/register').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(authService.register).toHaveBeenCalledWith(payload);
  });
});
