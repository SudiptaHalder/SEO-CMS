const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugAuth() {
  try {
    console.log('🔍 DATABASE DEBUG INFO')
    console.log('======================\n')

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        posts: true
      }
    })

    console.log('👥 USERS:')
    users.forEach(user => {
      console.log(`\n  User ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.name}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Posts: ${user.posts.length}`)
      if (user.posts.length > 0) {
        console.log('  Post Titles:')
        user.posts.forEach(post => {
          console.log(`    - ${post.title} (${post.id})`)
        })
      }
    })

    // Get all posts with authors
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { email: true, name: true }
        }
      }
    })

    console.log('\n\n📝 ALL POSTS:')
    posts.forEach(post => {
      console.log(`\n  Post ID: ${post.id}`)
      console.log(`  Title: ${post.title}`)
      console.log(`  Author ID: ${post.authorId}`)
      console.log(`  Author Email: ${post.author?.email}`)
      console.log(`  Author Name: ${post.author?.name}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuth()
