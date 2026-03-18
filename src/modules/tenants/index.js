const tenantsModule = Object.freeze({
  id: 'tenants',
  label: 'Tenants',
  routeBase: '/api/tenants',
  plannedSprint: 4,
  status: 'scaffold',
  scope: ['tenants', 'unit assignments', 'future occupancy'],
});

module.exports = {
  tenantsModule,
};
