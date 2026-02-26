import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Tag, FolderTree, Clock, ArrowLeft, Share2, Heart } from "lucide-react";
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { 
      slug: params.slug,
      status: "PUBLISHED"
    },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      excerpt: true,
      featuredImage: true,
      content: true,
      publishedAt: true,
      author: {
        select: { name: true }
      }
    }
  });

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const image = post.featuredImage || `${siteUrl}/og-image.jpg`;

  return {
    title: `${title} | John's Blog`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author?.name || 'John Doe'],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${params.slug}`,
    },
  };
}

function calculateReadingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Generate JSON-LD schema
function generateArticleSchema(post: any, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    image: post.featuredImage || `${siteUrl}/og-image.jpg`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || 'John Doe',
    },
    publisher: {
      '@type': 'Person',
      name: 'John Doe',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  const post = await prisma.post.findUnique({
    where: { 
      slug: params.slug,
      status: "PUBLISHED"
    },
    include: {
      author: {
        select: { name: true, email: true }
      },
      categories: true,
      tags: true
    }
  });

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const jsonLd = generateArticleSchema(post, siteUrl);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Blog */}
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-600 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Author Bio */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div>
              <p className="font-medium text-gray-900">John Doe</p>
              <p className="text-sm text-gray-500">Web Developer & SEO Enthusiast</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-b border-gray-200 pb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Not published'}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-emerald-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Share & Interact */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Enjoyed this post?</h3>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Author Section */}
        <div className="mt-8 p-6 bg-emerald-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              JD
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">About John Doe</h3>
              <p className="text-sm text-gray-700 mb-3">
                Web developer and SEO enthusiast with 5+ years of experience. I write about web development, 
                SEO best practices, and technology.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm">Twitter</a>
                <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm">GitHub</a>
                <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h3>
          <RelatedPosts currentPostId={post.id} categoryIds={post.categories.map(c => c.id)} />
        </div>
      </article>
    </>
  );
}

// Related Posts Component
async function RelatedPosts({ currentPostId, categoryIds }: { currentPostId: string, categoryIds: string[] }) {
  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: currentPostId },
      categories: {
        some: {
          id: { in: categoryIds }
        }
      }
    },
    include: {
      author: {
        select: { name: true }
      },
      categories: {
        select: { name: true, slug: true }
      }
    },
    take: 2,
    orderBy: {
      publishedAt: 'desc'
    }
  });

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {relatedPosts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group block"
        >
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
            {post.featuredImage ? (
              <div className="h-40 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-emerald-600 to-teal-600" />
            )}
            <div className="p-4">
              <h4 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-xs text-gray-500 mt-2">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
