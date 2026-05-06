const service = require('./units.service');
const parseId = require('../../shared/utils/parseId');

async function list(req, res, next) {
  try {
    const result = await service.list(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const unit = await service.getById(parseId(req.params.id));
    res.json({ success: true, data: unit });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const unit = await service.create(req.body);
    res.status(201).json({ success: true, data: unit });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const unit = await service.update(parseId(req.params.id), req.body);
    res.json({ success: true, data: unit });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(parseId(req.params.id));
    res.json({ success: true, data: { message: 'Unit deactivated' } });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove };
