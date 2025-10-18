import { PrismaClient, Role } from '../generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const superAdminData = {
  username: 'superadmin',
  name: 'Super Administrator',
  email: 'admin@dyhe.com',
  phone: '+855 12 345 678',
  password: 'admin123', // Default password - should be changed on first login
  role: Role.SUPER_ADMIN,
};

async function seedSuperAdmin() {
  console.log('🌱 Seeding super admin...');

  try {
    // Check if super admin already exists
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
      console.log(`   Email: ${existingSuperAdmin.email}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        ...superAdminData,
        password: hashedPassword,
      },
    });

    console.log('✅ Super admin created successfully!');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(
      `   Password: ${superAdminData.password} (Please change this on first login)`,
    );
    console.log('');
    console.log('🔐 Login credentials:');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

seedSuperAdmin()
  .catch((e) => {
    console.error('❌ Error seeding super admin:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
