import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Tag, FolderTree, User } from "lucide-react";

export const revalidate = 60;

async function getPublishedPosts(page = 1, limit = 6) {
  const skip = (page - 1) * limit;
  
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED"
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        categories: {
          select: { id: true, name: true, slug: true }
        },
        tags: {
          select: { id: true, name: true, slug: true }
        },
        seoReport: {
          select: { score: true }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.post.count({
      where: { status: "PUBLISHED" }
    })
  ]);

  return { posts, totalCount, totalPages: Math.ceil(totalCount / limit) };
}

function calculateReadingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function getExcerpt(content: string, maxLength = 150) {
  const text = content.replace(/<[^>]*>/g, '');
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

interface BlogPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const { posts, totalPages } = await getPublishedPosts(currentPage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Author Intro */}
      <div className="mb-12 text-center">
        <div className="inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
            JD
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">John Doe's Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Welcome to my personal blog! I'm a web developer and SEO enthusiast sharing 
          my thoughts, tutorials, and experiences in the world of web development.
        </p>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            5+ years experience
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            50+ articles
          </span>
        </div>
      </div>

      {/* Blog Grid */}
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => {
              const readingTime = calculateReadingTime(post.content);
              const excerpt = getExcerpt(post.content);
              const primaryCategory = post.categories[0];
              const seoScore = post.seoReport?.score;

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  {/* Featured Image */}
                  <Link href={`/blog/${post.slug}`} className="block relative h-48 overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white opacity-50">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Not published'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime} min read
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-emerald-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {excerpt}
                    </p>

                    {/* Categories & Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {primaryCategory && (
                        <Link
                          href={`/category/${primaryCategory.slug}`}
                          className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                        >
                          {primaryCategory.name}
                        </Link>
                      )}
                      {post.tags.slice(0, 2).map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tag/${tag.slug}`}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                      {seoScore && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          seoScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          SEO: {seoScore}%
                        </span>
                      )}
                    </div>

                    {/* Read More */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Continue Reading
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/blog?page=${page}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts published yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
