const organisationModule = Object.freeze({
  id: 'organisation',
  label: 'Organisation',
  routeBase: '/api/organisations',
  plannedSprint: 2,
  status: 'scaffold',
  scope: ['clients', 'companies', 'estates', 'portfolios'],
});

module.exports = {
  organisationModule,
};
