const {
  clientRoutes,
  companyRoutes,
  estateRoutes,
  portfolioRoutes,
} = require('./organisation.routes');

const organisationModule = Object.freeze({
  id: 'organisation',
  label: 'Organisation',
  routeBase: '/api/clients,/api/companies,/api/estates,/api/portfolios',
  plannedSprint: 2,
  status: 'active',
  scope: ['clients', 'companies', 'estates', 'portfolios', 'company email settings'],
});

module.exports = {
  organisationModule,
  clientRoutes,
  companyRoutes,
  estateRoutes,
  portfolioRoutes,
};
