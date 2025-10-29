/*
 Test script to verify reports functionality.
 Run from apps/api:
   pnpm ts-node src/test-reports.ts
*/

import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function testReports() {
  console.log('🧪 Testing Reports Functionality...\n');

  try {
    // Test 1: Check if we have data
    const packageCount = await prisma.package.count();
    const merchantCount = await prisma.merchant.count();
    const driverCount = await prisma.driver.count();
    
    console.log('📊 Data Summary:');
    console.log(`   - Total Packages: ${packageCount}`);
    console.log(`   - Total Merchants: ${merchantCount}`);
    console.log(`   - Total Drivers: ${driverCount}\n`);

    // Test 2: Check package status distribution
    const statusCounts = await prisma.package.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    console.log('📦 Package Status Distribution:');
    statusCounts.forEach(({ status, _count }) => {
      console.log(`   - ${status}: ${_count.status}`);
    });

    // Test 3: Check packages with drivers assigned
    const packagesWithDrivers = await prisma.package.count({
      where: {
        driverId: {
          not: null,
        },
      },
    });

    const packagesWithoutDrivers = await prisma.package.count({
      where: {
        driverId: null,
      },
    });

    console.log(`\n🚚 Driver Assignment:`);
    console.log(`   - Packages with drivers: ${packagesWithDrivers}`);
    console.log(`   - Packages without drivers: ${packagesWithoutDrivers}`);

    // Test 4: Check COD amounts
    const codStats = await prisma.package.aggregate({
      _sum: {
        codAmount: true,
      },
      _avg: {
        codAmount: true,
      },
      _min: {
        codAmount: true,
      },
      _max: {
        codAmount: true,
      },
    });

    console.log(`\n💰 COD Amount Statistics:`);
    console.log(`   - Total COD: $${Number(codStats._sum.codAmount || 0).toFixed(2)}`);
    console.log(`   - Average COD: $${Number(codStats._avg.codAmount || 0).toFixed(2)}`);
    console.log(`   - Min COD: $${Number(codStats._min.codAmount || 0).toFixed(2)}`);
    console.log(`   - Max COD: $${Number(codStats._max.codAmount || 0).toFixed(2)}`);

    // Test 5: Check recent packages
    const recentPackages = await prisma.package.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        merchant: {
          select: {
            name: true,
          },
        },
        driver: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`\n📋 Recent Packages (Last 5):`);
    recentPackages.forEach((pkg, index) => {
      console.log(`   ${index + 1}. ${pkg.packageNumber} - ${pkg.customerName}`);
      console.log(`      Merchant: ${pkg.merchant.name}`);
      console.log(`      Driver: ${pkg.driver?.name || 'Not Assigned'}`);
      console.log(`      Status: ${pkg.status}`);
      console.log(`      COD: $${Number(pkg.codAmount).toFixed(2)}`);
      console.log(`      Created: ${pkg.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    console.log('✅ Reports test completed successfully!');
    console.log('\n🌐 Next steps:');
    console.log('   1. Start the API server: pnpm dev');
    console.log('   2. Start the web app: cd ../web && pnpm dev');
    console.log('   3. Login with: admin@dyhe.test / password');
    console.log('   4. Navigate to Reports page to test export functionality');

  } catch (error) {
    console.error('❌ Error testing reports:', error);
  }
}

testReports()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
