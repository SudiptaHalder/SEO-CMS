'use server';

import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(5).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(100),
  excerpt: z.string().max(200).optional().nullable(),
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  focusKeyword: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  categoryId: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()]).optional().nullable(), // Accept either array or string
  featuredImage: z.string().optional().nullable(),
  scheduledFor: z.string().optional().nullable(),
});

export async function createPost(formData: FormData) {
  console.log('🚀 CREATE POST ACTION STARTED');
  console.log('📦 Form Data received:');
  
  // Log all form data
  const formDataObj: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    formDataObj[key] = value;
    console.log(`   ${key}: ${value}`);
  }

  try {
    // Check session
    console.log('🔐 Checking session...');
    const session = await getServerSession();
    console.log('👤 Session user:', session?.user);

    if (!session?.user?.id) {
      console.log('❌ No user ID in session');
      return { error: 'You must be logged in' };
    }

    // Parse form data
    let tagsValue = formData.get('tags') as string | null;
    
    // Handle tags - convert string to array if needed
    let parsedTags = null;
    if (tagsValue) {
      try {
        // Try to parse as JSON first
        parsedTags = JSON.parse(tagsValue);
      } catch {
        // If not JSON, split by comma
        parsedTags = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    const data = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string || null,
      metaTitle: formData.get('metaTitle') as string || null,
      metaDescription: formData.get('metaDescription') as string || null,
      focusKeyword: formData.get('focusKeyword') as string || null,
      status: (formData.get('status') as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED') || 'DRAFT',
      categoryId: formData.get('categoryId') as string || null,
      tags: parsedTags,
      featuredImage: formData.get('featuredImage') as string || null,
      scheduledFor: formData.get('scheduledFor') as string || null,
    };

    console.log('📝 Parsed data:', data);

    // Validate
    console.log('✅ Validating...');
    const validated = postSchema.parse(data);
    console.log('✅ Validation passed');

    // Check if slug exists
    console.log(`🔍 Checking slug: ${validated.slug}`);
    const existingPost = await prisma.post.findUnique({
      where: { slug: validated.slug }
    });

    if (existingPost) {
      console.log('❌ Slug already exists');
      return { error: 'Slug already exists' };
    }

    // Create post
    console.log('📝 Creating post in database...');
    const post = await prisma.post.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        excerpt: validated.excerpt,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
        focusKeyword: validated.focusKeyword,
        status: validated.status,
        authorId: session.user.id,
        ...(validated.categoryId && {
          categories: {
            connect: { id: validated.categoryId }
          }
        }),
        ...(validated.tags && {
          tags: {
            connectOrCreate: (validated.tags as string[]).map(tagName => ({
              where: { name: tagName },
              create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') }
            }))
          }
        }),
        ...(validated.scheduledFor && {
          scheduledFor: new Date(validated.scheduledFor)
        }),
        ...(validated.status === 'PUBLISHED' && {
          publishedAt: new Date()
        })
      }
    });

    console.log('✅ Post created!', { id: post.id, title: post.title });
    revalidatePath('/dashboard/posts');
    
    return { success: true, postId: post.id };
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors);
      return { error: error.errors[0].message };
    }
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
