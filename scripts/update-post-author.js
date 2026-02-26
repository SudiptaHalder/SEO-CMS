const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePostAuthor() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('No user found')
      return
    }

    console.log('Using user:', user.email, 'ID:', user.id)

    // Get all posts
    const posts = await prisma.post.findMany()
    
    console.log(`Found ${posts.length} posts`)

    // Update each post to belong to this user
    for (const post of posts) {
      if (post.authorId !== user.id) {
        await prisma.post.update({
          where: { id: post.id },
          data: { authorId: user.id }
        })
        console.log(`Updated post "${post.title}" to user ${user.email}`)
      }
    }

    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePostAuthor()
