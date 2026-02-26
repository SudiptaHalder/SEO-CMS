import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User, Mail, Github, Twitter, Linkedin } from "lucide-react";

export const revalidate = 60;

async function getLatestPosts() {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED"
    },
    include: {
      author: {
        select: { name: true }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 3
  });

  return posts;
}

function calculateReadingTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Personal Intro */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-block">
            <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl font-bold text-emerald-900">JD</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hi, I'm <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">John Doe</span>
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
            Web Developer & SEO Enthusiast. I write about web development, 
            SEO best practices, and technology.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/blog"
              className="px-6 py-3 bg-white text-emerald-900 rounded-xl hover:bg-emerald-50 transition-all shadow-lg font-medium"
            >
              Read My Blog
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg font-medium"
            >
              More About Me
            </Link>
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <a href="#" className="text-emerald-200 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-emerald-200 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-emerald-200 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-emerald-200 hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Latest from My Blog
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Thoughts, tutorials, and insights about web development and SEO
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => {
                const readingTime = calculateReadingTime(post.content);
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all h-full">
                      {post.featuredImage ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white opacity-50">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {readingTime} min read
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                View All Posts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                JD
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">About John Doe</h2>
                <p className="text-gray-600 mb-4">
                  I'm a web developer with over 5 years of experience building modern web applications. 
                  I'm passionate about creating fast, accessible, and SEO-friendly websites. 
                  Through this blog, I share my knowledge and experiences to help others in the web development community.
                </p>
                <div className="flex gap-4">
                  <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    5+ years experience
                  </span>
                  <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    50+ articles
                  </span>
                  <span className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    Open source contributor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest posts delivered straight to your inbox. No spam, unsubscribe anytime.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
