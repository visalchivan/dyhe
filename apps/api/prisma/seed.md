import { PrismaClient, Role, Status, Gender } from '../generated/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Check if Super Admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@dyhe.com' },
  })

  if (existingAdmin) {
    console.log('✅ Super Admin already exists, skipping seeding.')
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create Super Admin user
  const admin = await prisma.user.create({
    data: {
      username: 'superadmin',
      name: 'Super Admin',
      email: 'admin@dyhe.com',
      phone: '012345678',
      gender: Gender.MALE,
      status: Status.ACTIVE,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  })

  console.log('✅ Super Admin created successfully:')
  console.log(admin)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('❌ Seeding failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
