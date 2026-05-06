const express = require('express');
const controller = require('./estates.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth');
const { ROLES } = require('../../shared/constants/roles');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize(ROLES.SUPER_ADMIN, ROLES.PROPERTY_MANAGER), controller.create);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.PROPERTY_MANAGER), controller.update);
router.delete('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.PROPERTY_MANAGER), controller.remove);

module.exports = router;
