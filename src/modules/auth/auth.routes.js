const express = require('express');
const controller = require('./auth.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth');
const { ROLES } = require('../../shared/constants/roles');

const router = express.Router();

// Public endpoints
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);

// Protected endpoints
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, controller.logout);
router.get('/roles', authenticate, authorize(ROLES.SUPER_ADMIN), controller.roles);
router.post('/register', authenticate, authorize(ROLES.SUPER_ADMIN), controller.register);

module.exports = router;
