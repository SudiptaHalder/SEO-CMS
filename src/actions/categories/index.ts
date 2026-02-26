'use server';

import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
});

export async function createCategory(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string || null;

  try {
    const validated = categorySchema.parse({ name, slug, description });
    
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validated.slug }
    });

    if (existingCategory) {
      return { error: 'A category with this slug already exists' };
    }
    
    const category = await prisma.category.create({
      data: validated
    });

    revalidatePath('/dashboard/categories');
    return { success: true, category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Failed to create category' };
  }
}

export async function updateCategory(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string || null;

  try {
    const validated = categorySchema.parse({ name, slug, description });
    
    // Check if slug exists (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: { 
        slug: validated.slug,
        NOT: { id }
      }
    });

    if (existingCategory) {
      return { error: 'A category with this slug already exists' };
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: validated
    });

    revalidatePath('/dashboard/categories');
    return { success: true, category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Failed to update category' };
  }
}

export async function deleteCategory(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;

  try {
    // First, disconnect the category from all posts
    await prisma.category.update({
      where: { id },
      data: {
        posts: {
          set: [] // Disconnect all posts
        }
      }
    });

    // Then delete the category
    await prisma.category.delete({
      where: { id }
    });

    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Delete category error:', error);
    return { error: 'Failed to delete category' };
  }
}

export async function getCategory(id: string) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return null;
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id }
    });
    return category;
  } catch (error) {
    return null;
  }
}

export async function getAllCategories() {
  const session = await getServerSession();
  
  if (!session?.user) {
    return [];
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return categories;
  } catch (error) {
    return [];
  }
}
