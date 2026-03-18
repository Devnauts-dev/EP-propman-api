const service = require('./organisation.service');

function parseId(req) {
  return Number(req.params.id);
}

async function listClients(req, res, next) {
  try {
    const data = await service.listClients();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getClient(req, res, next) {
  try {
    const data = await service.getClient(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createClient(req, res, next) {
  try {
    const data = await service.createClient(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateClient(req, res, next) {
  try {
    const data = await service.updateClient(parseId(req), req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteClient(req, res, next) {
  try {
    const data = await service.deleteClient(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const data = await service.listCompanies(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getCompany(req, res, next) {
  try {
    const data = await service.getCompany(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createCompany(req, res, next) {
  try {
    const data = await service.createCompany(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateCompany(req, res, next) {
  try {
    const data = await service.updateCompany(parseId(req), req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteCompany(req, res, next) {
  try {
    const data = await service.deleteCompany(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listEstates(req, res, next) {
  try {
    const data = await service.listEstates(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getEstate(req, res, next) {
  try {
    const data = await service.getEstate(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createEstate(req, res, next) {
  try {
    const data = await service.createEstate(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateEstate(req, res, next) {
  try {
    const data = await service.updateEstate(parseId(req), req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteEstate(req, res, next) {
  try {
    const data = await service.deleteEstate(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listPortfolios(req, res, next) {
  try {
    const data = await service.listPortfolios(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getPortfolio(req, res, next) {
  try {
    const data = await service.getPortfolio(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createPortfolio(req, res, next) {
  try {
    const data = await service.createPortfolio(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updatePortfolio(req, res, next) {
  try {
    const data = await service.updatePortfolio(parseId(req), req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deletePortfolio(req, res, next) {
  try {
    const data = await service.deletePortfolio(parseId(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  listEstates,
  getEstate,
  createEstate,
  updateEstate,
  deleteEstate,
  listPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
