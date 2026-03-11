const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  PROPERTY_MANAGER: 'PROPERTY_MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
});

const ROLE_LABELS = Object.freeze({
  SUPER_ADMIN: 'Super Admin',
  PROPERTY_MANAGER: 'Property Manager',
  ACCOUNTANT: 'Accountant',
  COMPLIANCE_OFFICER: 'Compliance Officer',
});

const ROLE_ALIASES = Object.freeze({
  'super admin': ROLES.SUPER_ADMIN,
  super_admin: ROLES.SUPER_ADMIN,
  superadmin: ROLES.SUPER_ADMIN,
  'property manager': ROLES.PROPERTY_MANAGER,
  property_manager: ROLES.PROPERTY_MANAGER,
  propertymanager: ROLES.PROPERTY_MANAGER,
  accountant: ROLES.ACCOUNTANT,
  'compliance officer': ROLES.COMPLIANCE_OFFICER,
  compliance_officer: ROLES.COMPLIANCE_OFFICER,
  complianceofficer: ROLES.COMPLIANCE_OFFICER,
});

function normalizeRole(rawRole) {
  if (!rawRole) return null;

  const input = String(rawRole).trim();
  if (!input) return null;

  const direct = ROLES[input];
  if (direct) return direct;

  const upperSnake = input.toUpperCase().replace(/\s+/g, '_');
  if (ROLES[upperSnake]) return ROLES[upperSnake];

  const alias = ROLE_ALIASES[input.toLowerCase()];
  return alias || null;
}

function getAllowedRoleValues() {
  return Object.values(ROLES);
}

module.exports = {
  ROLES,
  ROLE_LABELS,
  normalizeRole,
  getAllowedRoleValues,
};
