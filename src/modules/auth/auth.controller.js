const authService = require('./auth.service');
const { getAllowedRoleValues } = require('../../shared/constants/roles');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.body ? req.body.refreshToken : undefined;
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.auth.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.auth.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function roles(req, res) {
  res.json({ success: true, data: getAllowedRoleValues() });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  roles,
};
