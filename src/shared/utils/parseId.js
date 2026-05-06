const AppError = require('../errors/AppError');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
    throw new AppError('Invalid ID parameter', 400);
  }
  return id;
}

module.exports = parseId;
