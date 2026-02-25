import * as z from 'zod';

export const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().max(200, 'Excerpt too long').optional(),
  featuredImage: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  publishedAt: z.date().optional(),
  scheduledFor: z.date().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeyword: z.string().min(1, 'Focus keyword is required'),
  }),
});

export type PostFormData = z.infer<typeof postSchema>;
