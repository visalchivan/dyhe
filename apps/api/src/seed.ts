// src/seed.ts

import { PrismaClient, PackageStatus, Status, Bank, Role } from '../generated/client';
import * as bcrypt from 'bcryptjs';

// Settings (unchanged)
const defaultSettings = [
  { key: 'company_name', value: 'DYHE DELIVERY', description: 'Company name', category: 'company' },
  { key: 'company_phone', value: 'Tel: +855 12 345 678', description: 'Company phone', category: 'company' },
  { key: 'company_address', value: '#123, Street 456, Phnom Penh', description: 'Company address', category: 'company' },
  { key: 'timezone', value: 'Asia/Phnom_Penh', description: 'System timezone', category: 'system' },
];
const superAdminData = {
  username: 'superadmin',
  name: 'Super Administrator',
  email: 'admin@dyhe.com',
  phone: '+855 12 345 678',
  password: 'admin123',
  role: Role.SUPER_ADMIN,
};
const prisma = new PrismaClient();
function tzDate(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
}

async function seed() {
  // 1. Seed Settings
  console.log('🌱 Seeding settings...');
  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log('✅ Settings seeded');

  // 2. Seed Super Admin
  console.log('👤 Seeding super admin...');
  const existing = await prisma.user.findFirst({
    where: { OR: [
      { username: superAdminData.username },
      { email: superAdminData.email },
      { role: Role.SUPER_ADMIN }
    ] },
  });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
    await prisma.user.create({ data: { ...superAdminData, password: hashedPassword } });
    console.log('✅ Super admin created');
  } else {
    console.log('⚠️  Super admin already exists.');
  }

  // 3. Clean DB
  console.log('🧹 Resetting merchants, drivers, packages...');
  await prisma.package.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.merchant.deleteMany();

  // 4. Seed 10 merchants
  const merchantNames = [
    'ExportTest Merchant',
    'Merchant One',
    'Merchant Two',
    'Merchant Three',
    'Merchant Four',
    'Merchant Five',
    'Merchant Six',
    'Merchant Seven',
    'Merchant Eight',
    'Merchant Nine'
  ];
  const merchants: any[] = [];
  for (let i = 0; i < merchantNames.length; i++) {
    merchants.push(await prisma.merchant.create({
      data: {
        name: merchantNames[i],
        phone: '0900000' + String(i + 1).padStart(3, '0'),
        email: `merchant${i + 1}@dyhe.test`,
        deliverFee: 3,
        bank: Bank.ABA,
        bankAccountNumber: '999999999' + (i + 1),
        bankAccountName: `MERCHANT_ACC_${i + 1}`,
        address: `#${100 + i}, Main Street, Phnom Penh`,
        status: Status.ACTIVE,
      }
    }));
  }

  // 5. Seed 3 demo drivers
  const drivers: any[] = [];
  for (let i = 0; i < 3; ++i) {
    drivers.push(await prisma.driver.create({
      data: {
        name: `Seed Driver ${i+1}`,
        phone: `0900011${i+1}`,
        email: `seederdriver${i+1}@dyhe.test`,
        deliverFee: 2,
        bank: Bank.ABA,
        bankAccountNumber: `999999011${i+1}`,
        bankAccountName: `SEEDED_DRIVER_${i+1}`,
        status: Status.ACTIVE,
      },
    }));
  }

  // 6. Seed 50 packages per merchant for today
  const statusVals = [
    PackageStatus.DELIVERED, PackageStatus.ON_DELIVERY, PackageStatus.PENDING, PackageStatus.FAILED, PackageStatus.RETURNED
  ];
  const today = tzDate(); today.setHours(10, 0, 0, 0);
  let totalPackages = 0;
  for (const merchant of merchants) {
    for (let seq = 1; seq <= 50; seq++) {
      const status = statusVals[(seq - 1) % statusVals.length];
      await prisma.package.create({
        data: {
          packageNumber: `${merchant.name.replace(/\s/g,'').toUpperCase()}${seq.toString().padStart(4,'0')}`,
          price: 20 + seq,
          codAmount: 10 + seq * 3,
          deliveryFee: 3 + (seq % 5),
          status,
          customerName: `R.${seq} (${merchant.name})`,
          customerPhone: `098800${seq.toString().padStart(3, '0')}`,
          customerAddress: `Test Street ${seq}`,
          merchantId: merchant.id,
          driverId: drivers[(seq-1)%drivers.length].id,
          createdAt: today,
          updatedAt: status === PackageStatus.DELIVERED ? new Date(today.getTime() + 2 * 3600000 + seq * 60000) : today,
        }
      });
      totalPackages++;
    }
  }

  // 7. Output result
  console.log(`✅ Merchants seeded: ${merchants.length}`);
  console.log(`✅ Demo drivers seeded: ${drivers.length}`);
  console.log(`✅ Packages seeded: ${totalPackages}`);
  console.log('🌐 Test user: superadmin (admin@dyhe.com / admin123)');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });