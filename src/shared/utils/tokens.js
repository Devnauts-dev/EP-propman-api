const jwt = require('jsonwebtoken');
const config = require('../../config');

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      tokenVersion: user.tokenVersion,
      type: 'access',
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      tokenVersion: user.tokenVersion,
      type: 'refresh',
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
