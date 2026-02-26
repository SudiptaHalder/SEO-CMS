import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Edit,
  PlusCircle,
  BarChart3,
  Leaf,
  FolderTree,
  Tags
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch real dashboard stats
  const totalPosts = await prisma.post.count({
    where: { authorId: session.user?.id }
  });
  
  const publishedPosts = await prisma.post.count({
    where: { authorId: session.user?.id, status: "PUBLISHED" }
  });
  
  const draftPosts = await prisma.post.count({
    where: { authorId: session.user?.id, status: "DRAFT" }
  });

  // Safely handle SEO report aggregation
  let avgSEOScore = 0;
  try {
    const result = await prisma.seoReport.aggregate({
      where: { post: { authorId: session.user?.id } },
      _avg: { score: true }
    });
    avgSEOScore = result._avg.score || 0;
  } catch (error) {
    console.log("No SEO reports yet");
  }

  // Get recent posts
  const recentPosts = await prisma.post.findMany({
    where: { authorId: session.user?.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      seoReport: {
        select: { score: true }
      }
    }
  });

  // Get category stats
  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: { authorId: session.user?.id },
        select: { id: true }
      }
    }
  });

  // Get tag stats
  const tags = await prisma.tag.findMany({
    include: {
      posts: {
        where: { authorId: session.user?.id },
        select: { id: true }
      }
    },
    take: 10
  });

  const stats = [
    {
      label: "Total Posts",
      value: totalPosts,
      icon: FileText,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-800",
      iconBg: "bg-emerald-200",
      description: "All time content"
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      iconBg: "bg-green-200",
      description: "Live on site"
    },
    {
      label: "Drafts",
      value: draftPosts,
      icon: Clock,
      bgColor: "bg-teal-100",
      textColor: "text-teal-800",
      iconBg: "bg-teal-200",
      description: "In progress"
    },
    {
      label: "Avg. SEO Score",
      value: `${Math.round(avgSEOScore)}%`,
      icon: TrendingUp,
      bgColor: avgSEOScore >= 80 ? "bg-emerald-100" : avgSEOScore >= 60 ? "bg-yellow-100" : "bg-red-100",
      textColor: avgSEOScore >= 80 ? "text-emerald-800" : avgSEOScore >= 60 ? "text-yellow-800" : "text-red-800",
      iconBg: avgSEOScore >= 80 ? "bg-emerald-200" : avgSEOScore >= 60 ? "bg-yellow-200" : "bg-red-200",
      description: "Content health"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Original Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
          <div className="w-64 h-64 rounded-full bg-white opacity-10 blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-emerald-300" />
            <span className="text-sm font-medium uppercase tracking-wider text-emerald-300">
              Dashboard Overview
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {session.user?.name || 'User'}! 👋
          </h1>
          <p className="text-emerald-200 max-w-2xl text-lg">
            Your content performance is looking great. Here's what's happening with your SEO today.
          </p>
          
          {/* Quick stats highlight */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-sm text-emerald-100">{totalPosts} total posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-sm text-emerald-100">{publishedPosts} published</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-sm text-emerald-100">{draftPosts} in draft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Original Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="group relative bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`inline-flex p-3 rounded-xl ${stat.iconBg} mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions - Original Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/posts/new"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-green-900 p-6 hover:shadow-lg transition-all border border-emerald-800"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Create New Post</h3>
            <p className="text-emerald-200 mb-4 text-sm">Start writing content with real-time SEO analysis</p>
            <div className="inline-flex items-center text-emerald-300 font-medium text-sm">
              Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/posts"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 to-emerald-900 p-6 hover:shadow-lg transition-all border border-teal-800"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-teal-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Posts</h3>
            <p className="text-teal-200 mb-4 text-sm">Edit, publish, or update your existing content</p>
            <div className="inline-flex items-center text-teal-300 font-medium text-sm">
              View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Two Column Layout for Recent Posts and Categories/Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-emerald-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
              </div>
              <Link href="/dashboard/posts" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-emerald-50">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="px-6 py-4 flex items-center justify-between hover:bg-emerald-50/50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{post.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                              post.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {post.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {post.seoReport && (
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            post.seoReport.score >= 80 ? 'text-emerald-600' :
                            post.seoReport.score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {post.seoReport.score}%
                          </div>
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1">
                            <div 
                              className={`h-full rounded-full ${
                                post.seoReport.score >= 80 ? 'bg-emerald-500' :
                                post.seoReport.score >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${post.seoReport.score}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-gray-600 mb-4">No posts yet. Create your first post!</p>
                  <Link
                    href="/dashboard/posts/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New Post
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories & Tags Sidebar - Takes 1 column */}
        <div>
          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FolderTree className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              </div>
            </div>
            
            <div className="p-4">
              {categories.length > 0 ? (
                <div className="space-y-2">
                  {categories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {category.posts.length}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No categories yet</p>
              )}
              
              <Link
                href="/dashboard/categories"
                className="mt-4 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Manage Categories
              </Link>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Tags className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Popular Tags</h2>
              </div>
            </div>
            
            <div className="p-4">
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/dashboard/posts?tag=${tag.id}`}
                      className="group relative"
                    >
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-emerald-100 rounded-full text-xs text-gray-700 hover:text-emerald-700 transition-colors">
                        {tag.name}
                        <span className="text-[10px] text-gray-500 group-hover:text-emerald-600">
                          ({tag.posts.length})
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No tags yet</p>
              )}
              
              <Link
                href="/dashboard/tags"
                className="mt-4 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Manage Tags
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Activity Summary</h2>
          </div>
          <span className="text-xs text-gray-400">Last 30 days</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
            <p className="text-sm text-gray-600">Total Content Created</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{publishedPosts}</p>
            <p className="text-sm text-gray-600">Content Published</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{draftPosts}</p>
            <p className="text-sm text-gray-600">Drafts in Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
