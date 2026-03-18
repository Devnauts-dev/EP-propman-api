const adminModule = Object.freeze({
  id: 'admin',
  label: 'Admin',
  routeBase: '/api/admin',
  plannedSprint: 13,
  status: 'scaffold',
  scope: ['email configuration', 'permissions', 'operational settings'],
});

module.exports = {
  adminModule,
};
