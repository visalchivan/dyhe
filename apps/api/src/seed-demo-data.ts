/*
 Seed demo data for testing reports and UI.
 Run from apps/api:
   pnpm ts-node src/seed-demo-data.ts
*/

import { PrismaClient, PackageStatus, Bank, Status } from '../generated/client';

const prisma = new PrismaClient();

function randomDigits(len: number): string {
  let s = '';
  while (s.length < len) s += Math.floor(Math.random() * 10).toString();
  return s.slice(0, len);
}

async function main() {
  console.log('Seeding demo data...');

  // Create or reuse a merchant
  const merchant = await prisma.merchant.upsert({
    where: { email: 'merchant.demo@dyhe.test' },
    update: {},
    create: {
      name: 'Demo Merchant',
      phone: '010' + randomDigits(7),
      email: 'merchant.demo@dyhe.test',
      deliverFee: 1,
      bank: Bank.ABA,
      bankAccountNumber: '99' + randomDigits(8),
      bankAccountName: 'DEMO_MERCHANT_' + randomDigits(3),
      address: 'Phnom Penh, Cambodia',
      status: Status.ACTIVE,
    },
  });

  // Create or reuse a driver
  const driver = await prisma.driver.upsert({
    where: { phone: '012345678' },
    update: {},
    create: {
      name: 'Demo Driver',
      phone: '012345678',
      deliverFee: 0,
      bank: Bank.ABA,
      bankAccountNumber: '77' + randomDigits(8),
      bankAccountName: 'DEMO_DRIVER_' + randomDigits(3),
      status: Status.ACTIVE,
    },
  });

  // Helper to create package data
  function createPkg(i: number, status: PackageStatus, assigned = true) {
    return {
      packageNumber: `GO${Date.now().toString().slice(-8)}${randomDigits(6)}`,
      name: `PKG-${new Date().toISOString()}`,
      price: 0,
      codAmount: (i % 5 === 0 ? 0 : Math.floor(Math.random() * 100) + 10),
      deliveryFee: 1,
      status,
      customerName: `Receiver ${i + 1}`,
      customerPhone: '09' + randomDigits(7),
      customerAddress: `Some Street ${i + 1}, Phnom Penh`,
      merchant: { connect: { id: merchant.id } },
      ...(assigned ? { driver: { connect: { id: driver.id } } } : {}),
    } as const;
  }

  // Create a batch of packages
  const packagesToCreate = [
    ...Array.from({ length: 5 }, (_, i) => createPkg(i, PackageStatus.RECEIVED, false)),
    ...Array.from({ length: 4 }, (_, i) => createPkg(i + 5, PackageStatus.READY, true)),
    ...Array.from({ length: 3 }, (_, i) => createPkg(i + 9, PackageStatus.DELIVERING, true)),
    ...Array.from({ length: 4 }, (_, i) => createPkg(i + 12, PackageStatus.DELIVERED, true)),
  ];

  for (const data of packagesToCreate) {
    await prisma.package.create({ data });
  }

  console.log(`Seeded merchant=${merchant.name}, driver=${driver.name}, packages=${packagesToCreate.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


