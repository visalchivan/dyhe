import { PrismaClient } from '../generated/client';

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

async function seedSettings() {
  console.log('🌱 Seeding settings...');

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
    console.log(`✅ Seeded setting: ${setting.key}`);
  }

  console.log('🎉 Settings seeded successfully!');
}

seedSettings()
  .catch((e) => {
    console.error('❌ Error seeding settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
