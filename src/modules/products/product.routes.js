const express = require('express');
const controller = require('./product.controller');

const router = express.Router();

// List products with search, category, pagination
// GET /api/products?search=...&category=...&page=1&limit=20&isActive=true
router.get('/', controller.list);

// Get by slug (e.g. for public URLs)
router.get('/slug/:slug', controller.getBySlug);

// Get by ID
router.get('/:id', controller.getById);

// CRUD
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
