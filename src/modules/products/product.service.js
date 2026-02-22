const productRepository = require('./product.repository');
const slugify = require('../../shared/utils/slugify');
const AppError = require('../../shared/errors/AppError');

async function listProducts(filters) {
  return productRepository.findAll(filters);
}

async function getProductById(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

async function getProductBySlug(slug) {
  const product = await productRepository.findBySlug(slug);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}

function validateCreatePayload(body) {
  const { name, price, slug } = body;
  if (!name || String(name).trim() === '') {
    throw new AppError('Product name is required', 400);
  }
  const priceNum = Number(price);
  if (price === undefined || price === null || Number.isNaN(priceNum) || priceNum < 0) {
    throw new AppError('Valid price is required', 400);
  }
  return {
    name: String(name).trim(),
    slug: (slug && String(slug).trim()) || slugify(name),
    description: body.description != null ? String(body.description) : null,
    price: priceNum,
    sku: body.sku != null ? String(body.sku).trim() : null,
    stock: Math.max(0, parseInt(body.stock, 10) || 0),
    category: body.category != null ? String(body.category).trim() : null,
    image_url: body.imageUrl != null ? String(body.imageUrl).trim() : null,
    is_active: body.isActive !== false,
  };
}

function validateUpdatePayload(body) {
  const payload = {};
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.slug !== undefined) payload.slug = String(body.slug).trim();
  if (body.description !== undefined) payload.description = String(body.description);
  if (body.price !== undefined) {
    const priceNum = Number(body.price);
    if (Number.isNaN(priceNum) || priceNum < 0) throw new AppError('Invalid price', 400);
    payload.price = priceNum;
  }
  if (body.sku !== undefined) payload.sku = String(body.sku).trim();
  if (body.stock !== undefined) payload.stock = Math.max(0, parseInt(body.stock, 10) || 0);
  if (body.category !== undefined) payload.category = String(body.category).trim();
  if (body.imageUrl !== undefined) payload.image_url = String(body.imageUrl).trim();
  if (body.isActive !== undefined) payload.is_active = Boolean(body.isActive);
  return payload;
}

async function createProduct(body) {
  const payload = validateCreatePayload(body);
  const existing = await productRepository.findBySlug(payload.slug);
  if (existing) {
    throw new AppError('A product with this slug already exists', 409);
  }
  return productRepository.create(payload);
}

async function updateProduct(id, body) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  const payload = validateUpdatePayload(body);
  if (payload.slug && payload.slug !== product.slug) {
    const existing = await productRepository.findBySlug(payload.slug);
    if (existing) {
      throw new AppError('A product with this slug already exists', 409);
    }
  }
  return productRepository.update(id, payload);
}

async function deleteProduct(id) {
  const deleted = await productRepository.remove(id);
  if (!deleted) {
    throw new AppError('Product not found', 404);
  }
  return { deleted: true, id };
}

module.exports = {
  listProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
