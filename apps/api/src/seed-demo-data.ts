/*
 Seed demo data for testing reports and UI.
 Run from apps/api:
   pnpm ts-node src/seed-demo-data.ts
*/

import { PrismaClient, PackageStatus, Bank, Status, Role } from '../generated/client';

const prisma = new PrismaClient();

function randomDigits(len: number): string {
  let s = '';
  while (s.length < len) s += Math.floor(Math.random() * 10).toString();
  return s.slice(0, len);
}

function randomPackageNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = randomDigits(6);
  return `PKG${timestamp}${random}`;
}

function randomPhone(): string {
  const prefixes = ['010', '011', '012', '013', '014', '015', '016', '017', '018', '069', '070', '071', '077', '078', '079', '081', '085', '086', '087', '088', '089', '092', '093', '095', '096', '097', '098', '099'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return prefix + randomDigits(7);
}

function randomAddress(): string {
  const streets = ['Street 271', 'Monivong Blvd', 'Sisowath Quay', 'Russian Blvd', 'Norodom Blvd', 'Preah Sihanouk Blvd', 'Mao Tse Toung Blvd'];
  const districts = ['Chamkar Mon', 'Daun Penh', '7 Makara', 'Toul Kork', 'Sen Sok', 'Prampi Makara', 'Mean Chey'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const houseNumber = Math.floor(Math.random() * 200) + 1;
  return `${houseNumber}, ${street}, ${district}, Phnom Penh`;
}

function randomCustomerName(): string {
  const firstNames = ['Sophea', 'Sophat', 'Srey', 'Sokha', 'Sokun', 'Sopheap', 'Sophat', 'Srey', 'Sokha', 'Sokun', 'Sophea', 'Sophat', 'Srey', 'Sokha', 'Sokun'];
  const lastNames = ['Chan', 'Kim', 'Ly', 'Meas', 'Nguon', 'Ouk', 'Pich', 'Rith', 'Sok', 'Tha', 'Ung', 'Vann', 'Yim', 'Zhou'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function randomDateInRange(daysAgo: number): Date {
  const now = new Date();
  const daysBack = Math.floor(Math.random() * daysAgo);
  const hoursBack = Math.floor(Math.random() * 24);
  const minutesBack = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysBack);
  date.setHours(date.getHours() - hoursBack);
  date.setMinutes(date.getMinutes() - minutesBack);
  
  return date;
}

async function main() {
  console.log('Seeding comprehensive demo data for reports testing...');

  // Create multiple merchants
  const merchants: any[] = [];
  const merchantNames = ['Pink Please Store', 'Tech Hub Cambodia', 'Fashion Forward', 'Home & Garden', 'Electronics Plus', 'Beauty Corner', 'Sports Zone', 'Book World'];
  
  for (let i = 0; i < merchantNames.length; i++) {
    const merchant = await prisma.merchant.upsert({
      where: { email: `merchant${i + 1}@dyhe.test` },
      update: {},
      create: {
        name: merchantNames[i],
        phone: randomPhone(),
        email: `merchant${i + 1}@dyhe.test`,
        deliverFee: Math.floor(Math.random() * 5) + 1, // 1-5 USD
        bank: Object.values(Bank)[Math.floor(Math.random() * Object.values(Bank).length)],
        bankAccountNumber: randomDigits(10),
        bankAccountName: `${merchantNames[i].replace(/\s+/g, '_')}_${randomDigits(3)}`,
        address: randomAddress(),
        status: Status.ACTIVE,
      },
    });
    merchants.push(merchant);
  }

  // Create multiple drivers
  const drivers: any[] = [];
  const driverNames = ['Sophea Chan', 'Sokha Kim', 'Sophat Ly', 'Srey Meas', 'Sokun Nguon', 'Sopheap Ouk', 'Sophat Pich', 'Srey Rith'];
  
  for (let i = 0; i < driverNames.length; i++) {
    const driver = await prisma.driver.upsert({
      where: { phone: `01${randomDigits(8)}` },
      update: {},
      create: {
        name: driverNames[i],
        phone: `01${randomDigits(8)}`,
        email: `driver${i + 1}@dyhe.test`,
        deliverFee: Math.floor(Math.random() * 3) + 1, // 1-3 USD
        bank: Object.values(Bank)[Math.floor(Math.random() * Object.values(Bank).length)],
        bankAccountNumber: randomDigits(10),
        bankAccountName: `${driverNames[i].replace(/\s+/g, '_')}_${randomDigits(3)}`,
        status: Status.ACTIVE,
      },
    });
    drivers.push(driver);
  }

  // Create users for drivers
  for (let i = 0; i < drivers.length; i++) {
    await prisma.user.upsert({
      where: { email: `driver${i + 1}@dyhe.test` },
      update: {},
      create: {
        username: `driver${i + 1}`,
        name: driverNames[i],
        email: `driver${i + 1}@dyhe.test`,
        phone: drivers[i].phone,
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: Role.DRIVER,
        status: Status.ACTIVE,
        driver: {
          connect: { id: drivers[i].id }
        }
      },
    });
  }

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@dyhe.test' },
    update: {},
    create: {
      username: 'admin',
      name: 'Admin User',
      email: 'admin@dyhe.test',
      phone: '0123456789',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
  });

  // Helper to create package data with realistic dates
  function createPkg(i: number, status: PackageStatus, assigned = true) {
    const createdAt = randomDateInRange(30); // Random date within last 30 days
    const updatedAt = status === PackageStatus.DELIVERED ? randomDateInRange(15) : createdAt;
    
    return {
      packageNumber: randomPackageNumber(),
      price: Math.floor(Math.random() * 200) + 10, // 10-210 USD
      codAmount: Math.floor(Math.random() * 150) + 5, // 5-155 USD
      deliveryFee: Math.floor(Math.random() * 5) + 1, // 1-5 USD
      status,
      customerName: randomCustomerName(),
      customerPhone: randomPhone(),
      customerAddress: randomAddress(),
      customerLatitude: 11.5564 + (Math.random() - 0.5) * 0.1, // Around Phnom Penh
      customerLongitude: 104.9282 + (Math.random() - 0.5) * 0.1,
      merchantId: merchants[Math.floor(Math.random() * merchants.length)].id,
      driverId: assigned ? drivers[Math.floor(Math.random() * drivers.length)].id : null,
      createdAt,
      updatedAt,
    };
  }

  // Create packages with different statuses and realistic distribution
  const packagesToCreate = [
    // Recent packages (last 7 days)
    ...Array.from({ length: 8 }, (_, i) => createPkg(i, PackageStatus.RECEIVED, false)),
    ...Array.from({ length: 6 }, (_, i) => createPkg(i + 8, PackageStatus.PREPARING, true)),
    ...Array.from({ length: 5 }, (_, i) => createPkg(i + 14, PackageStatus.READY, true)),
    ...Array.from({ length: 4 }, (_, i) => createPkg(i + 19, PackageStatus.DELIVERING, true)),
    
    // Delivered packages (last 30 days)
    ...Array.from({ length: 15 }, (_, i) => createPkg(i + 23, PackageStatus.DELIVERED, true)),
    
    // Some cancelled and returned packages
    ...Array.from({ length: 3 }, (_, i) => createPkg(i + 38, PackageStatus.CANCELLED, true)),
    ...Array.from({ length: 2 }, (_, i) => createPkg(i + 41, PackageStatus.RETURNED, true)),
  ];

  // Create packages in batches
  for (const data of packagesToCreate) {
    await prisma.package.create({ data });
  }

  console.log(`✅ Seeded data successfully:`);
  console.log(`   - ${merchants.length} merchants`);
  console.log(`   - ${drivers.length} drivers`);
  console.log(`   - ${drivers.length} driver users`);
  console.log(`   - 1 admin user`);
  console.log(`   - ${packagesToCreate.length} packages`);
  console.log(`\n📊 Package status distribution:`);
  console.log(`   - RECEIVED: ${packagesToCreate.filter(p => p.status === PackageStatus.RECEIVED).length}`);
  console.log(`   - PREPARING: ${packagesToCreate.filter(p => p.status === PackageStatus.PREPARING).length}`);
  console.log(`   - READY: ${packagesToCreate.filter(p => p.status === PackageStatus.READY).length}`);
  console.log(`   - DELIVERING: ${packagesToCreate.filter(p => p.status === PackageStatus.DELIVERING).length}`);
  console.log(`   - DELIVERED: ${packagesToCreate.filter(p => p.status === PackageStatus.DELIVERED).length}`);
  console.log(`   - CANCELLED: ${packagesToCreate.filter(p => p.status === PackageStatus.CANCELLED).length}`);
  console.log(`   - RETURNED: ${packagesToCreate.filter(p => p.status === PackageStatus.RETURNED).length}`);
  
  console.log(`\n🔑 Test credentials:`);
  console.log(`   Admin: admin@dyhe.test / password`);
  console.log(`   Driver: driver1@dyhe.test / password`);
  console.log(`   Driver: driver2@dyhe.test / password`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


