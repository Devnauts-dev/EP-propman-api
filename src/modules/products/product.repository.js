const prisma = require('../../lib/prisma');

/**
 * Map Prisma product to API shape (Decimal price -> number).
 */
function toProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    sku: product.sku,
    stock: product.stock,
    category: product.category,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function findAll(filters = {}) {
  const { search, category, isActive, page = 1, limit = 20 } = filters;
  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
  const take = Math.min(100, Math.max(1, limit));

  const where = {};

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { sku: { contains: term, mode: 'insensitive' } },
    ];
  }
  if (category != null && String(category).trim() !== '') {
    where.category = String(category).trim();
  }
  if (isActive !== undefined) {
    where.isActive = Boolean(isActive);
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: data.map(toProduct),
    pagination: {
      page: Math.max(1, page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

async function findById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return toProduct(product);
}

async function findBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
  });
  return toProduct(product);
}

async function create(payload) {
  const product = await prisma.product.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? undefined,
      price: payload.price,
      sku: payload.sku ?? undefined,
      stock: payload.stock ?? 0,
      category: payload.category ?? undefined,
      imageUrl: payload.image_url ?? undefined,
      isActive: payload.is_active !== false,
    },
  });
  return toProduct(product);
}

async function update(id, payload) {
  const data = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.slug !== undefined) data.slug = payload.slug;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.price !== undefined) data.price = payload.price;
  if (payload.sku !== undefined) data.sku = payload.sku;
  if (payload.stock !== undefined) data.stock = payload.stock;
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.image_url !== undefined) data.imageUrl = payload.image_url;
  if (payload.is_active !== undefined) data.isActive = payload.is_active;

  if (Object.keys(data).length === 0) {
    return findById(id);
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });
  return toProduct(product);
}

async function remove(id) {
  await prisma.product.delete({
    where: { id },
  });
  return true;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  remove,
};
