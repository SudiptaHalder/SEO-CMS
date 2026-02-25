const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    console.log('🔄 Testing database connection...')
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL)
    
    await prisma.$connect()
    console.log('✅ Connected to database!')
    
    const userCount = await prisma.user.count()
    console.log(`👥 Users in database: ${userCount}`)
    
    const postCount = await prisma.post.count()
    console.log(`📝 Posts in database: ${postCount}`)
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
