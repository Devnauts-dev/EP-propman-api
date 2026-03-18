const financeModule = Object.freeze({
  id: 'finance',
  label: 'Finance',
  routeBase: '/api/finance',
  plannedSprint: 5,
  status: 'scaffold',
  scope: ['leases', 'rent rules', 'invoicing', 'service charges'],
});

module.exports = {
  financeModule,
};
