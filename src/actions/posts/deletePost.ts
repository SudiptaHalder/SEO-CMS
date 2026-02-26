'use server';

import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function deletePost(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;

  try {
    // Check if post exists and user owns it
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        seoReport: true
      }
    });

    if (!post) {
      return { error: 'Post not found' };
    }

    if (post.authorId !== session.user.id) {
      return { error: 'Unauthorized' };
    }

    // Delete related SEO report first
    if (post.seoReport) {
      await prisma.seoReport.delete({
        where: { postId: id }
      });
    }

    // Disconnect categories and tags
    await prisma.post.update({
      where: { id },
      data: {
        categories: {
          set: []
        },
        tags: {
          set: []
        }
      }
    });

    // Delete the post
    await prisma.post.delete({
      where: { id }
    });

    revalidatePath('/dashboard/posts');
    return { success: true };
  } catch (error) {
    console.error('Delete post error:', error);
    return { error: 'Failed to delete post' };
  }
}
