const bcrypt = require('bcryptjs');

jest.mock('../src/modules/auth/auth.repository', () => ({
  toPublicUser: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  updateLastLoginAt: jest.fn(),
  incrementTokenVersion: jest.fn(),
}));

jest.mock('../src/shared/utils/tokens', () => ({
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

const authRepository = require('../src/modules/auth/auth.repository');
const tokenUtils = require('../src/shared/utils/tokens');
const authService = require('../src/modules/auth/auth.service');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register creates user with normalized role and email', async () => {
    authRepository.findByEmail.mockResolvedValue(null);
    authRepository.createUser.mockResolvedValue({
      id: 1,
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      role: 'PROPERTY_MANAGER',
      isActive: true,
    });
    authRepository.toPublicUser.mockImplementation((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    }));

    const result = await authService.register({
      fullName: 'Jane Doe',
      email: 'JANE@EXAMPLE.COM',
      password: 'SecurePass123',
      role: 'Property Manager',
    });

    expect(authRepository.findByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(authRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@example.com',
        role: 'PROPERTY_MANAGER',
      })
    );
    const createArg = authRepository.createUser.mock.calls[0][0];
    expect(createArg.passwordHash).toBeDefined();
    expect(createArg.passwordHash).not.toBe('SecurePass123');
    expect(result).toEqual({
      id: 1,
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      role: 'PROPERTY_MANAGER',
      isActive: true,
    });
  });

  test('register rejects invalid role', async () => {
    await expect(
      authService.register({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        role: 'random',
      })
    ).rejects.toThrow('Role is required');
  });

  test('login returns user and tokens', async () => {
    const passwordHash = await bcrypt.hash('SecurePass123', 4);
    authRepository.findByEmail.mockResolvedValue({
      id: 10,
      fullName: 'Admin',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      tokenVersion: 0,
      isActive: true,
      passwordHash,
    });
    authRepository.updateLastLoginAt.mockResolvedValue({
      id: 10,
      fullName: 'Admin',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      tokenVersion: 0,
      isActive: true,
      lastLoginAt: new Date('2026-03-12T00:00:00.000Z'),
    });
    authRepository.toPublicUser.mockImplementation((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    }));
    tokenUtils.signAccessToken.mockReturnValue('access-token');
    tokenUtils.signRefreshToken.mockReturnValue('refresh-token');

    const result = await authService.login({
      email: 'admin@example.com',
      password: 'SecurePass123',
    });

    expect(result.user).toEqual({
      id: 10,
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      fullName: 'Admin',
    });
    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.refreshToken).toBe('refresh-token');
  });

  test('login rejects wrong password', async () => {
    const passwordHash = await bcrypt.hash('SecurePass123', 4);
    authRepository.findByEmail.mockResolvedValue({
      id: 11,
      email: 'user@example.com',
      isActive: true,
      passwordHash,
    });

    await expect(
      authService.login({
        email: 'user@example.com',
        password: 'WrongPass123',
      })
    ).rejects.toThrow('Invalid email or password');
  });

  test('refresh rejects non-refresh token type', async () => {
    tokenUtils.verifyRefreshToken.mockReturnValue({
      sub: '1',
      tokenVersion: 0,
      type: 'access',
    });

    await expect(authService.refresh('token')).rejects.toThrow('Invalid refresh token type');
  });

  test('refresh rejects token version mismatch', async () => {
    tokenUtils.verifyRefreshToken.mockReturnValue({
      sub: '1',
      tokenVersion: 0,
      type: 'refresh',
    });
    authRepository.findById.mockResolvedValue({
      id: 1,
      tokenVersion: 1,
      isActive: true,
      role: 'SUPER_ADMIN',
    });

    await expect(authService.refresh('token')).rejects.toThrow(
      'Refresh token is no longer valid. Please login again.'
    );
  });

  test('logout increments token version', async () => {
    authRepository.incrementTokenVersion.mockResolvedValue({
      id: 1,
      tokenVersion: 2,
    });

    const result = await authService.logout(1);

    expect(authRepository.incrementTokenVersion).toHaveBeenCalledWith(1);
    expect(result).toEqual({ loggedOut: true });
  });
});
