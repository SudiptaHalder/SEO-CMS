'use server';

import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export async function createTag(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  try {
    const validated = tagSchema.parse({ name, slug });
    
    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug: validated.slug }
    });

    if (existingTag) {
      return { error: 'A tag with this slug already exists' };
    }
    
    const tag = await prisma.tag.create({
      data: validated
    });

    revalidatePath('/dashboard/tags');
    return { success: true, tag };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Failed to create tag' };
  }
}

export async function updateTag(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  try {
    const validated = tagSchema.parse({ name, slug });
    
    // Check if slug exists (excluding current tag)
    const existingTag = await prisma.tag.findFirst({
      where: { 
        slug: validated.slug,
        NOT: { id }
      }
    });

    if (existingTag) {
      return { error: 'A tag with this slug already exists' };
    }
    
    const tag = await prisma.tag.update({
      where: { id },
      data: validated
    });

    revalidatePath('/dashboard/tags');
    return { success: true, tag };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Failed to update tag' };
  }
}

export async function deleteTag(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;

  try {
    // First, disconnect the tag from all posts
    await prisma.tag.update({
      where: { id },
      data: {
        posts: {
          set: [] // Disconnect all posts
        }
      }
    });

    // Then delete the tag
    await prisma.tag.delete({
      where: { id }
    });

    revalidatePath('/dashboard/tags');
    return { success: true };
  } catch (error) {
    console.error('Delete tag error:', error);
    return { error: 'Failed to delete tag' };
  }
}
