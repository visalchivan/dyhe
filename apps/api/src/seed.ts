// src/seed.ts

import { PrismaClient, PackageStatus, Status, Bank, Role } from '../generated/client';
import * as bcrypt from 'bcryptjs';
import { 
  getTodayPhnomPenh, 
  createPhnomPenhDateTime,
  SYSTEM_TIMEZONE 
} from './utils/timezone.util';

// Settings (unchanged)
const defaultSettings = [
  { key: 'company_name', value: 'DYHE DELIVERY', description: 'Company name', category: 'company' },
  { key: 'company_phone', value: 'Tel: +855 12 345 678', description: 'Company phone', category: 'company' },
  { key: 'company_address', value: '#123, Street 456, Phnom Penh', description: 'Company address', category: 'company' },
  { key: 'timezone', value: SYSTEM_TIMEZONE, description: 'System timezone', category: 'system' },
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

// Note: Using timezone utility functions from utils/timezone.util.ts for consistency
// The seed file creates dates using the same timezone helpers as the rest of the application

async function seed() {
  // 1. Clean DB - Delete all data in correct order (respecting foreign keys)
  console.log('🧹 Cleaning database - starting fresh...');
  // Delete in order to respect foreign key constraints
  await prisma.package.deleteMany();
  console.log('   ✓ Packages deleted');
  await prisma.driver.deleteMany();
  console.log('   ✓ Drivers deleted');
  await prisma.merchant.deleteMany();
  console.log('   ✓ Merchants deleted');
  await prisma.user.deleteMany();
  console.log('   ✓ Users deleted');
  console.log('✅ Database cleaned - starting fresh');

  // 2. Seed Settings
  console.log('🌱 Seeding settings...');
  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log('✅ Settings seeded');

  // 3. Seed Super Admin (no need to check since we just deleted everything)
  console.log('👤 Seeding super admin...');
  const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
  await prisma.user.create({ data: { ...superAdminData, password: hashedPassword } });
  console.log('✅ Super admin created');

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

  // 6. Seed packages per merchant for testing both scenarios
  const statusVals = [
    PackageStatus.DELIVERED, PackageStatus.ON_DELIVERY, PackageStatus.PENDING, PackageStatus.FAILED, PackageStatus.RETURNED
  ];
  
  // Get today's date in Phnom Penh timezone using centralized utility
  const todayStr = getTodayPhnomPenh();
  const now = new Date();
  
  // Calculate past dates for testing
  // Create packages on multiple days to test both scenarios effectively
  // For Scenario 1: All past dates up to today
  // For Scenario 2: Need dates throughout the month for date range testing
  // Create packages for every day from 1 to 30 days ago for comprehensive testing
  const pastDays: number[] = [];
  for (let i = 1; i <= 30; i++) {
    pastDays.push(i);
  }
  const pastDateStrs: Array<{ dateStr: string; daysAgo: number }> = [];
  
  // Calculate past dates using Phnom Penh timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SYSTEM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  for (const daysAgo of pastDays) {
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const pastDateStr = formatter.format(pastDate);
    pastDateStrs.push({ dateStr: pastDateStr, daysAgo });
  }
  
  console.log(`📅 Creating test data for:`);
  console.log(`   - Today (${todayStr}): Sheet 1 when no date selected`);
  console.log(`   - Past dates: ${pastDateStrs.map(d => `${d.dateStr} (${d.daysAgo}d ago)`).join(', ')}`);
  console.log(`   - These past dates will appear in Sheet 2 when no date selected`);
  
  let totalPackages = 0;
  for (const merchant of merchants) {
    let seq = 1;
    
    // ============================================
    // SCENARIO 1 TEST DATA: No date selected
    // ============================================
    // Sheet 1: Today's packages only (10 packages)
    console.log(`   Creating ${merchant.name} packages...`);
    
    for (let i = 0; i < 10; i++) {
      const status = statusVals[(seq - 1) % statusVals.length];
          const packageDate = createPhnomPenhDateTime(todayStr, 8 + (i % 12), (i * 5) % 60);
      let updatedAt = packageDate;
      if (status === PackageStatus.DELIVERED) {
        updatedAt = new Date(packageDate.getTime() + 2 * 3600000 + (i * 60000));
      }
      
      await prisma.package.create({
        data: {
          packageNumber: `${merchant.name.replace(/\s/g,'').toUpperCase()}${seq.toString().padStart(4,'0')}`,
          price: 20 + seq,
          codAmount: 10 + seq * 3,
          deliveryFee: 3 + (seq % 5),
          status,
          customerName: `R.${seq} (${merchant.name}) [TODAY-${todayStr}]`,
          customerPhone: `098800${seq.toString().padStart(3, '0')}`,
          customerAddress: `Test Street ${seq}`,
          merchantId: merchant.id,
          driverId: drivers[(seq-1)%drivers.length].id,
          createdAt: packageDate,
          updatedAt: updatedAt,
        }
      });
      seq++;
      totalPackages++;
    }
    
    // Sheet 2: Past packages (5 packages per past day)
    // These will appear in Sheet 2 when no date is selected (all past data up to today)
    for (const { dateStr: pastDateStr, daysAgo } of pastDateStrs) {
      for (let i = 0; i < 5; i++) {
        const status = statusVals[(seq - 1) % statusVals.length];
        const packageDate = createPhnomPenhDateTime(pastDateStr, 9 + (i % 10), (i * 6) % 60);
        let updatedAt = packageDate;
        if (status === PackageStatus.DELIVERED) {
          updatedAt = new Date(packageDate.getTime() + 1 * 3600000 + (i * 60000));
        }
        
        await prisma.package.create({
          data: {
            packageNumber: `${merchant.name.replace(/\s/g,'').toUpperCase()}${seq.toString().padStart(4,'0')}`,
            price: 20 + seq,
            codAmount: 10 + seq * 3,
            deliveryFee: 3 + (seq % 5),
            status,
            customerName: `R.${seq} (${merchant.name}) [PAST-${pastDateStr}-${daysAgo}d]`,
            customerPhone: `098800${seq.toString().padStart(3, '0')}`,
            customerAddress: `Test Street ${seq}`,
            merchantId: merchant.id,
            driverId: drivers[(seq-1)%drivers.length].id,
            createdAt: packageDate,
            updatedAt: updatedAt,
          }
        });
        seq++;
        totalPackages++;
      }
    }
  }
  
  console.log(`\n✅ Package distribution per merchant:`);
  console.log(`   - Today (${todayStr}): 10 packages → Sheet 1 when no date selected`);
  console.log(`   - Past dates: ${pastDateStrs.length} days × 5 packages = ${pastDateStrs.length * 5} packages → Sheet 2 when no date selected`);
  console.log(`   - Total per merchant: ${10 + (pastDateStrs.length * 5)} packages`);

  // 7. Output result
  console.log(`✅ Merchants seeded: ${merchants.length}`);
  console.log(`✅ Demo drivers seeded: ${drivers.length}`);
  console.log(`✅ Packages seeded: ${totalPackages}`);
  console.log('🌐 Test user: superadmin (admin@dyhe.com / admin123)');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });