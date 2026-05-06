jest.mock('../src/modules/properties/properties.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../src/lib/prisma', () => ({
  portfolio: { findUnique: jest.fn() },
  property: { findFirst: jest.fn() },
  unit: { count: jest.fn() },
}));

const repository = require('../src/modules/properties/properties.repository');
const prisma = require('../src/lib/prisma');
const service = require('../src/modules/properties/properties.service');

describe('properties.service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('list defaults isActive to true', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    await service.list({});
    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true })
    );
  });

  test('list passes occupancyStatus filter', async () => {
    repository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    await service.list({ occupancyStatus: 'VACANT' });
    expect(repository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ occupancyStatus: 'VACANT' })
    );
  });

  test('create validates name', async () => {
    await expect(service.create({ name: '', portfolioId: 1 })).rejects.toThrow('Property name is required');
  });

  test('create validates portfolioId', async () => {
    await expect(service.create({ name: 'Valid Name' })).rejects.toThrow('A valid portfolio ID is required');
  });

  test('create validates regulatory status', async () => {
    await expect(service.create({
      name: 'Test', portfolioId: 1, regulatoryStatus: 'INVALID',
    })).rejects.toThrow('Regulatory status must be one of');
  });

  test('create validates occupancy status', async () => {
    await expect(service.create({
      name: 'Test', portfolioId: 1, occupancyStatus: 'INVALID',
    })).rejects.toThrow('Occupancy status must be one of');
  });

  test('create succeeds with valid data', async () => {
    prisma.portfolio.findUnique.mockResolvedValue({ id: 1 });
    prisma.property.findFirst.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 1, name: 'Test Prop' });

    const result = await service.create({ name: 'Test Prop', portfolioId: 1 });
    expect(result.name).toBe('Test Prop');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Prop',
        portfolioId: 1,
        regulatoryStatus: 'INSIDE_ACT',
        occupancyStatus: 'VACANT',
      })
    );
  });

  test('create throws if portfolio not found', async () => {
    prisma.portfolio.findUnique.mockResolvedValue(null);
    await expect(service.create({ name: 'Test', portfolioId: 999 })).rejects.toThrow('Parent portfolio not found');
  });

  test('getById throws 404 when not found', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getById(999)).rejects.toThrow('Property not found');
  });

  test('toDecimalOrNull converts correctly', async () => {
    prisma.portfolio.findUnique.mockResolvedValue({ id: 1 });
    prisma.property.findFirst.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 1 });

    await service.create({
      name: 'Test', portfolioId: 1,
      sizeNIA: '100.5', sizeGIA: '', sizeIT2A: null, sizeGEA: 'abc',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sizeNIA: 100.5,
        sizeGIA: null,
        sizeIT2A: null,
        sizeGEA: null,
      })
    );
  });
});
