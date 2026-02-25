const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123', 12)
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: password,
      name: 'Test User',
      role: 'ADMIN'
    }
  })
  
  console.log('✅ Test user created successfully!')
  console.log('📧 Email: test@example.com')
  console.log('🔑 Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error creating user:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
