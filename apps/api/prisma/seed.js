import { PrismaClient } from '../generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@dyhe.com' },
    update: {},
    create: {
      username: 'superadmin',
      name: 'Super Admin',
      email: 'admin@dyhe.com',
      phone: '+855123456789',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      gender: 'MALE',
    },
  });

  console.log('✅ Super Admin created:', {
    id: superAdmin.id,
    email: superAdmin.email,
    username: superAdmin.username,
    role: superAdmin.role,
  });

  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@dyhe.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  Please change the password after first login!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
