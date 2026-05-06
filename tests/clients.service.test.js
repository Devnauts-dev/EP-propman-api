jest.mock('../src/modules/clients/clients.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../src/lib/prisma', () => ({
  client: { findFirst: jest.fn() },
  company: { count: jest.fn() },
  estate: { count: jest.fn() },
}));

const repository = require('../src/modules/clients/clients.repository');
const prisma = require('../src/lib/prisma');
const service = require('../src/modules/clients/clients.service');

describe('clients.service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('list defaults isActive to true', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    await service.list({});
    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true })
    );
  });

  test('list passes isActive=false when explicitly requested', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    await service.list({ isActive: 'false' });
    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false })
    );
  });

  test('list parses pagination params', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 });
    await service.list({ page: '2', limit: '10', search: 'test' });
    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 10, search: 'test' })
    );
  });

  test('create validates payload', async () => {
    await expect(service.create({ name: '' })).rejects.toThrow('Client name is required');
  });

  test('create with valid payload calls repository', async () => {
    prisma.client.findFirst.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 1, name: 'Test Client', unifiedManagementStatus: false });
    const result = await service.create({ name: 'Test Client' });
    expect(repository.create).toHaveBeenCalledWith({ name: 'Test Client', unifiedManagementStatus: false });
    expect(result.id).toBe(1);
  });

  test('getById throws 404 when not found', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getById(999)).rejects.toThrow('Client not found');
  });

  test('getById returns client when found', async () => {
    repository.findById.mockResolvedValue({ id: 1, name: 'Acme' });
    const result = await service.getById(1);
    expect(result.name).toBe('Acme');
  });

  test('update validates and calls repository', async () => {
    repository.findById.mockResolvedValue({ id: 1 });
    prisma.client.findFirst.mockResolvedValue(null);
    repository.update.mockResolvedValue({ id: 1, name: 'Updated' });
    const result = await service.update(1, { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  test('remove calls repository', async () => {
    repository.findById.mockResolvedValue({ id: 1 });
    prisma.company.count.mockResolvedValue(0);
    prisma.estate.count.mockResolvedValue(0);
    repository.remove.mockResolvedValue({ id: 1, isActive: false });
    await service.remove(1);
    expect(repository.remove).toHaveBeenCalledWith(1);
  });
});
