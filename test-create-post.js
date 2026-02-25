const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestPost() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('❌ No user found')
      return
    }

    console.log(`👤 Creating post for user: ${user.email}`)

    // Create a test post
    const post = await prisma.post.create({
      data: {
        title: 'Test Post ' + new Date().toLocaleString(),
        slug: 'test-post-' + Date.now(),
        content: '<p>This is a test post to verify database writing.</p>',
        excerpt: 'Test excerpt',
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test meta description for SEO',
        focusKeyword: 'test',
        status: 'DRAFT',
        authorId: user.id
      }
    })

    console.log('✅ Test post created successfully!')
    console.log('📝 Post details:', {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status
    })

    // Verify it was created
    const posts = await prisma.post.count()
    console.log(`�� Total posts now: ${posts}`)

  } catch (error) {
    console.error('❌ Error creating test post:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPost()
