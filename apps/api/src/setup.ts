import { PrismaClient, Role } from '../generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultSettings = [
  // Company Information
  {
    key: 'company_name',
    value: 'DYHE DELIVERY',
    description: 'Company name displayed on labels and throughout the system',
    category: 'company',
  },
  {
    key: 'company_phone',
    value: 'Tel: +855 12 345 678',
    description: 'Company phone number',
    category: 'company',
  },
  {
    key: 'company_address',
    value: '#123, Street 456, Phnom Penh',
    description: 'Company address',
    category: 'company',
  },

  // Label Settings
  {
    key: 'label_company_name',
    value: 'DYHE DELIVERY',
    description: 'Company name specifically for labels',
    category: 'label',
  },
  {
    key: 'label_company_phone',
    value: 'Tel: +855 12 345 678',
    description: 'Company phone for labels',
    category: 'label',
  },
  {
    key: 'label_company_address',
    value: '#123, Street 456, Phnom Penh',
    description: 'Company address for labels',
    category: 'label',
  },
  {
    key: 'label_remarks',
    value:
      'DYHE Express does not accept illegal goods or animals.\nWe reserve the right to refuse delivery if goods are suspected to be illegal.',
    description: 'Remarks text displayed on package labels',
    category: 'label',
  },

  // System Settings
  {
    key: 'default_delivery_fee',
    value: '1.00',
    description: 'Default delivery fee for new packages',
    category: 'system',
  },
  {
    key: 'default_cod_amount',
    value: '0.00',
    description: 'Default COD amount for new packages',
    category: 'system',
  },
  {
    key: 'timezone',
    value: 'Asia/Phnom_Penh',
    description: 'System timezone',
    category: 'system',
  },

  // Notification Settings
  {
    key: 'notification_email',
    value: 'admin@dyhe.com',
    description: 'Email for system notifications',
    category: 'notification',
  },
  {
    key: 'notification_phone',
    value: '+855 12 345 678',
    description: 'Phone for system notifications',
    category: 'notification',
  },
];

const superAdminData = {
  username: 'superadmin',
  name: 'Super Administrator',
  email: 'admin@dyhe.com',
  phone: '+855 12 345 678',
  password: 'admin123',
  role: Role.SUPER_ADMIN,
};

async function setup() {
  console.log('🚀 Starting DYHE Platform setup...\n');

  try {
    // 1. Seed Settings
    console.log('📋 Setting up system settings...');
    for (const setting of defaultSettings) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      });
    }
    console.log('✅ Settings configured\n');

    // 2. Check for existing super admin
    console.log('👤 Setting up super admin...');
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: superAdminData.username },
          { email: superAdminData.email },
          { role: Role.SUPER_ADMIN },
        ],
      },
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists, skipping...');
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}\n`);
    } else {
      // Create super admin
      const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
      const superAdmin = await prisma.user.create({
        data: {
          ...superAdminData,
          password: hashedPassword,
        },
      });
      console.log('✅ Super admin created successfully!');
      console.log(`   Username: ${superAdmin.username}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Role: ${superAdmin.role}\n`);
    }

    // 3. Display login credentials
    console.log('🔐 Login Credentials:');
    console.log('   Username: superadmin');
    console.log('   Password: admin123');
    console.log('   Email: admin@dyhe.com\n');

    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Change the super admin password after first login');
    console.log('   2. Update company information in Settings page');
    console.log('   3. Configure your actual company details\n');

    console.log('🎉 DYHE Platform setup completed successfully!');
    console.log('   You can now start the application and login.');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

setup()
  .catch((e) => {
    console.error('❌ Error during setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
