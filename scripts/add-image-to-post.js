const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addImageToPost() {
  try {
    // Your post ID
    const postId = 'cmm331vyr0005xy5kn3siffeo';
    
    // The image URL that you confirmed works
    const imageUrl = '/uploads/1772096142850-50atd3.jpeg';
    
    console.log(`📝 Updating post ${postId} with image: ${imageUrl}`);
    
    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { featuredImage: imageUrl }
    });
    
    console.log('✅ Post updated successfully!');
    console.log('Post title:', updatedPost.title);
    console.log('Featured image:', updatedPost.featuredImage);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addImageToPost();
