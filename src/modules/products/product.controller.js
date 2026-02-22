const productService = require('./product.service');

async function list(req, res, next) {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      page: parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10),
    };
    const result = await productService.listProducts(filters);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid product ID' } });
    }
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid product ID' } });
    }
    const product = await productService.updateProduct(id, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid product ID' } });
    }
    const result = await productService.deleteProduct(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
