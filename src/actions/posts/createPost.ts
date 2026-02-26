'use server';

import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { SEOAnalyzer } from '@/lib/seo/analyzer';

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
  tags: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  scheduledFor: z.string().optional().nullable(),
});

export async function createPost(formData: FormData) {
  console.log('🚀 CREATE POST ACTION STARTED');
  
  try {
    // Check session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { error: 'You must be logged in' };
    }

    // Parse form data
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
      tags: formData.get('tags') as string || null,
      featuredImage: formData.get('featuredImage') as string || null,
      scheduledFor: formData.get('scheduledFor') as string || null,
    };

    // Validate
    const validated = postSchema.parse(data);

    // Check if slug exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: validated.slug }
    });

    if (existingPost) {
      return { error: 'Slug already exists' };
    }

    // Create post
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
        ...(validated.scheduledFor && {
          scheduledFor: new Date(validated.scheduledFor)
        }),
        ...(validated.status === 'PUBLISHED' && {
          publishedAt: new Date()
        })
      }
    });

    // 🔥 ADD SEO ANALYSIS HERE - AFTER POST CREATION
    console.log('🔍 Running SEO analysis for new post:', post.id);
    
    const analyzer = new SEOAnalyzer();
    const analysis = await analyzer.analyze(
      validated.content,
      validated.title,
      validated.metaDescription || '',
      validated.focusKeyword || '',
      validated.slug
    );

    // Create SEO report
    await prisma.seoReport.create({
      data: {
        postId: post.id,
        score: analysis.score,
        titleScore: analysis.titleScore,
        descriptionScore: analysis.descriptionScore,
        keywordDensity: analysis.keywordDensity,
        headingScore: analysis.headingScore,
        internalLinks: analysis.internalLinks,
        externalLinks: analysis.externalLinks,
        readabilityScore: analysis.readabilityScore,
        imageAltScore: analysis.imageAltScore,
        slugScore: analysis.slugScore,
        keywordPresence: analysis.keywordPresence,
        suggestions: analysis.suggestions,
        analyzedAt: new Date()
      }
    });

    console.log('✅ SEO analysis complete for post:', post.id, 'Score:', analysis.score);

    revalidatePath('/dashboard/posts');
    
    return { success: true, postId: post.id };
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
