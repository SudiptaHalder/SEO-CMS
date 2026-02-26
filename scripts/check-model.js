const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkModel() {
  try {
    console.log('🔍 Checking Prisma models...\n')
    
    // List all available models in Prisma client
    const models = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      !key.startsWith('$') &&
      typeof prisma[key] === 'object'
    )
    
    console.log('📦 Available models:', models)
    
    // Try to access seoReport model
    if (prisma.seoReport) {
      console.log('\n✅ SEOReport model is available')
      try {
        const count = await prisma.seoReport.count()
        console.log(`📊 Current SEOReport count: ${count}`)
      } catch (e) {
        console.log('❌ Error counting SEOReport:', e.message)
      }
    } else {
      console.log('\n❌ SEOReport model is NOT available')
    }

    // Check posts
    try {
      const postCount = await prisma.post.count()
      console.log(`\n📝 Total posts: ${postCount}`)
    } catch (e) {
      console.log('❌ Error counting posts:', e.message)
    }

  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkModel()
