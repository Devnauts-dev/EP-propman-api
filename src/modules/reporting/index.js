const reportingModule = Object.freeze({
  id: 'reporting',
  label: 'Reporting',
  routeBase: '/api/reports',
  plannedSprint: 12,
  status: 'scaffold',
  scope: ['vat', 'liability', 'exportable report library'],
});

module.exports = {
  reportingModule,
};
