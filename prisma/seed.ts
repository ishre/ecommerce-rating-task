import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create system admin user
  const adminPassword = await hashPassword('AdminPass123!')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecomrating.com' },
    update: {},
    create: {
      name: 'System Administrator User Account',
      email: 'admin@ecomrating.com',
      password: adminPassword,
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'SYSTEM_ADMIN'
    }
  })

  // Create store owner user
  const storeOwnerPassword = await hashPassword('StorePass123!')
  const storeOwner = await prisma.user.upsert({
    where: { email: 'storeowner@ecomrating.com' },
    update: {},
    create: {
      name: 'Store Owner User Account Example',
      email: 'storeowner@ecomrating.com',
      password: storeOwnerPassword,
      address: '456 Store Street, Store City, SC 67890',
      role: 'STORE_OWNER'
    }
  })

  // Create normal user
  const userPassword = await hashPassword('UserPass123!')
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@ecomrating.com' },
    update: {},
    create: {
      name: 'Normal User Account Example User',
      email: 'user@ecomrating.com',
      password: userPassword,
      address: '789 User Street, User City, UC 11111',
      role: 'NORMAL_USER'
    }
  })

  // Create sample stores
  const store1 = await prisma.store.upsert({
    where: { email: 'store1@example.com' },
    update: {},
    create: {
      name: 'Sample Electronics Store',
      email: 'store1@example.com',
      address: '100 Electronics Ave, Tech City, TC 22222',
      ownerId: storeOwner.id
    }
  })

  const store2 = await prisma.store.upsert({
    where: { email: 'store2@example.com' },
    update: {},
    create: {
      name: 'Sample Clothing Store',
      email: 'store2@example.com',
      address: '200 Fashion Blvd, Style City, SC 33333',
      ownerId: storeOwner.id
    }
  })

  // Create sample ratings
  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser.id,
        storeId: store1.id
      }
    },
    update: {},
    create: {
      userId: normalUser.id,
      storeId: store1.id,
      rating: 4
    }
  })

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser.id,
        storeId: store2.id
      }
    },
    update: {},
    create: {
      userId: normalUser.id,
      storeId: store2.id,
      rating: 5
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('📋 Sample accounts created:')
  console.log(`   Admin: admin@ecomrating.com / AdminPass123!`)
  console.log(`   Store Owner: storeowner@ecomrating.com / StorePass123!`)
  console.log(`   Normal User: user@ecomrating.com / UserPass123!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
