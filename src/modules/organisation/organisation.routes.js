const express = require('express');
const controller = require('./organisation.controller');
const { authenticate, authorize } = require('../../shared/middleware/auth');
const { ROLES } = require('../../shared/constants/roles');

const readRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.PROPERTY_MANAGER,
  ROLES.ACCOUNTANT,
  ROLES.COMPLIANCE_OFFICER,
];

const manageRoles = [ROLES.SUPER_ADMIN, ROLES.PROPERTY_MANAGER];

function createCrudRouter(controllerSet) {
  const router = express.Router();

  router.use(authenticate);

  router.get('/', authorize(...readRoles), controllerSet.list);
  router.get('/:id', authorize(...readRoles), controllerSet.get);
  router.post('/', authorize(...manageRoles), controllerSet.create);
  router.put('/:id', authorize(...manageRoles), controllerSet.update);
  router.delete('/:id', authorize(...manageRoles), controllerSet.remove);

  return router;
}

const clientRoutes = createCrudRouter({
  list: controller.listClients,
  get: controller.getClient,
  create: controller.createClient,
  update: controller.updateClient,
  remove: controller.deleteClient,
});

const companyRoutes = createCrudRouter({
  list: controller.listCompanies,
  get: controller.getCompany,
  create: controller.createCompany,
  update: controller.updateCompany,
  remove: controller.deleteCompany,
});

const estateRoutes = createCrudRouter({
  list: controller.listEstates,
  get: controller.getEstate,
  create: controller.createEstate,
  update: controller.updateEstate,
  remove: controller.deleteEstate,
});

const portfolioRoutes = createCrudRouter({
  list: controller.listPortfolios,
  get: controller.getPortfolio,
  create: controller.createPortfolio,
  update: controller.updatePortfolio,
  remove: controller.deletePortfolio,
});

module.exports = {
  clientRoutes,
  companyRoutes,
  estateRoutes,
  portfolioRoutes,
};
