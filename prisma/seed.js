const prisma = require('../src/lib/prisma');

async function seed() {
  console.log('Seeding organisation hierarchy...');

  // Create Clients
  const client1 = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Atree Management Ltd', unifiedManagementStatus: true },
  });

  const client2 = await prisma.client.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Greenfield Properties', unifiedManagementStatus: false },
  });

  console.log(`  Clients: ${client1.name}, ${client2.name}`);

  // Create Companies
  const company1 = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: { clientId: client1.id, name: 'Atree Commercial', emailSenderName: 'Atree Commercial', emailSenderAddress: 'commercial@atree.co.uk', emailReplyToAddress: 'noreply@atree.co.uk', emailSignature: 'Atree Commercial Property Management', vatStatus: true },
  });

  const company2 = await prisma.company.upsert({
    where: { id: 2 },
    update: {},
    create: { clientId: client1.id, name: 'Atree Residential', emailSenderName: 'Atree Residential', emailSenderAddress: 'residential@atree.co.uk', emailReplyToAddress: 'noreply@atree.co.uk', emailSignature: 'Atree Residential Property Management', vatStatus: false },
  });

  const company3 = await prisma.company.upsert({
    where: { id: 3 },
    update: {},
    create: { clientId: client2.id, name: 'Greenfield Retail', emailSenderName: 'Greenfield Retail', emailSenderAddress: 'retail@greenfield.co.uk', emailReplyToAddress: 'info@greenfield.co.uk', emailSignature: 'Greenfield Retail Management', vatStatus: true },
  });

  console.log(`  Companies: ${company1.name}, ${company2.name}, ${company3.name}`);

  // Create Estates
  const estate1 = await prisma.estate.upsert({
    where: { id: 1 },
    update: { companyId: company1.id },
    create: { clientId: client1.id, companyId: company1.id, name: 'London Commercial Estate' },
  });

  const estate2 = await prisma.estate.upsert({
    where: { id: 2 },
    update: { companyId: company2.id },
    create: { clientId: client1.id, companyId: company2.id, name: 'Manchester Residential Estate' },
  });

  const estate3 = await prisma.estate.upsert({
    where: { id: 3 },
    update: { companyId: company3.id },
    create: { clientId: client2.id, companyId: company3.id, name: 'Birmingham Retail Estate' },
  });

  console.log(`  Estates: ${estate1.name}, ${estate2.name}, ${estate3.name}`);

  // Create Portfolios
  const portfolio1 = await prisma.portfolio.upsert({
    where: { id: 1 },
    update: {},
    create: { estateId: estate1.id, name: 'City of London Offices', type: 'OFFICE' },
  });

  const portfolio2 = await prisma.portfolio.upsert({
    where: { id: 2 },
    update: {},
    create: { estateId: estate1.id, name: 'Docklands Industrial', type: 'INDUSTRIAL' },
  });

  const portfolio3 = await prisma.portfolio.upsert({
    where: { id: 3 },
    update: {},
    create: { estateId: estate2.id, name: 'Salford Quays Apartments', type: 'RESIDENTIAL' },
  });

  const portfolio4 = await prisma.portfolio.upsert({
    where: { id: 4 },
    update: {},
    create: { estateId: estate3.id, name: 'Bull Ring Retail Park', type: 'RETAIL' },
  });

  console.log(`  Portfolios: ${portfolio1.name}, ${portfolio2.name}, ${portfolio3.name}, ${portfolio4.name}`);

  // Create Properties
  const property1 = await prisma.property.upsert({
    where: { id: 1 },
    update: {},
    create: {
      portfolioId: portfolio1.id,
      name: 'One London Wall',
      address: '1 London Wall, London EC2Y 5EA',
      sizeNIA: 25000,
      sizeGIA: 28000,
      regulatoryStatus: 'INSIDE_ACT',
      occupancyStatus: 'FULLY_OCCUPIED',
    },
  });

  const property2 = await prisma.property.upsert({
    where: { id: 2 },
    update: {},
    create: {
      portfolioId: portfolio1.id,
      name: 'Moorgate Place',
      address: '14 Moorgate, London EC2R 6DA',
      sizeNIA: 18000,
      sizeGIA: 20500,
      regulatoryStatus: 'INSIDE_ACT',
      occupancyStatus: 'PARTIALLY_OCCUPIED',
    },
  });

  const property3 = await prisma.property.upsert({
    where: { id: 3 },
    update: {},
    create: {
      portfolioId: portfolio2.id,
      name: 'Docklands Warehouse Complex',
      address: '100 Royal Victoria Dock, London E16 1AA',
      sizeNIA: 50000,
      sizeGIA: 55000,
      sizeGEA: 60000,
      eavesHeight: 8.5,
      apexHeight: 12.0,
      regulatoryStatus: 'OUTSIDE_1954_ACT',
      occupancyStatus: 'PARTIALLY_OCCUPIED',
    },
  });

  const property4 = await prisma.property.upsert({
    where: { id: 4 },
    update: {},
    create: {
      portfolioId: portfolio3.id,
      name: 'Quay House Apartments',
      address: '25 Salford Quays, Manchester M50 3AZ',
      sizeNIA: 15000,
      sizeGIA: 17000,
      regulatoryStatus: 'OUTSIDE_1954_ACT',
      occupancyStatus: 'FULLY_OCCUPIED',
    },
  });

  const property5 = await prisma.property.upsert({
    where: { id: 5 },
    update: {},
    create: {
      portfolioId: portfolio4.id,
      name: 'Bull Ring Shopping Centre',
      address: 'Bull Ring, Birmingham B5 4BU',
      sizeNIA: 120000,
      sizeGIA: 135000,
      regulatoryStatus: 'INSIDE_ACT',
      occupancyStatus: 'PARTIALLY_OCCUPIED',
    },
  });

  console.log(`  Properties: ${property1.name}, ${property2.name}, ${property3.name}, ${property4.name}, ${property5.name}`);

  // Create Units
  const units = [
    { propertyId: property1.id, unitNumber: 'LW-101', type: 'OFFICE', status: 'OCCUPIED' },
    { propertyId: property1.id, unitNumber: 'LW-102', type: 'OFFICE', status: 'OCCUPIED' },
    { propertyId: property1.id, unitNumber: 'LW-103', type: 'OFFICE', status: 'OCCUPIED' },
    { propertyId: property2.id, unitNumber: 'MG-201', type: 'OFFICE', status: 'OCCUPIED' },
    { propertyId: property2.id, unitNumber: 'MG-202', type: 'OFFICE', status: 'VACANT' },
    { propertyId: property3.id, unitNumber: 'DW-A1', type: 'WAREHOUSE', status: 'OCCUPIED' },
    { propertyId: property3.id, unitNumber: 'DW-A2', type: 'WAREHOUSE', status: 'VACANT' },
    { propertyId: property3.id, unitNumber: 'DW-B1', type: 'STORAGE', status: 'OCCUPIED' },
    { propertyId: property4.id, unitNumber: 'QH-1A', type: 'APARTMENT', status: 'OCCUPIED' },
    { propertyId: property4.id, unitNumber: 'QH-1B', type: 'APARTMENT', status: 'OCCUPIED' },
    { propertyId: property4.id, unitNumber: 'QH-2A', type: 'APARTMENT', status: 'OCCUPIED' },
    { propertyId: property5.id, unitNumber: 'BR-G01', type: 'SHOP', status: 'OCCUPIED' },
    { propertyId: property5.id, unitNumber: 'BR-G02', type: 'SHOP', status: 'VACANT' },
    { propertyId: property5.id, unitNumber: 'BR-G03', type: 'SHOP', status: 'OCCUPIED' },
    { propertyId: property5.id, unitNumber: 'BR-101', type: 'SHOP', status: 'UNDER_MAINTENANCE' },
  ];

  for (const [i, unit] of units.entries()) {
    await prisma.unit.upsert({
      where: { id: i + 1 },
      update: {},
      create: unit,
    });
  }

  console.log(`  Units: ${units.length} units created`);
  console.log('Seed complete!');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
