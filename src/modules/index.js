const { authRoutes } = require('./auth');
const { adminModule } = require('./admin');
const { financeModule } = require('./finance');
const { organisationModule } = require('./organisation');
const { propertiesModule } = require('./properties');
const { reportingModule } = require('./reporting');
const { tenantsModule } = require('./tenants');
const { utilitiesModule } = require('./utilities');

const moduleRegistry = Object.freeze([
  organisationModule,
  propertiesModule,
  tenantsModule,
  financeModule,
  utilitiesModule,
  reportingModule,
  adminModule,
]);

module.exports = {
  authRoutes,
  moduleRegistry,
};
