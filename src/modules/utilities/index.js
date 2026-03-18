const utilitiesModule = Object.freeze({
  id: 'utilities',
  label: 'Utilities',
  routeBase: '/api/utilities',
  plannedSprint: 10,
  status: 'scaffold',
  scope: ['meters', 'utility billing', 'utility purchase orders'],
});

module.exports = {
  utilitiesModule,
};
