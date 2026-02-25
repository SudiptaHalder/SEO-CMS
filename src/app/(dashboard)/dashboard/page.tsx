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
  Leaf
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch dashboard stats
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

  const stats = [
    {
      label: "Total Posts",
      value: totalPosts,
      icon: FileText,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-800",
      iconBg: "bg-emerald-200",
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      iconBg: "bg-green-200",
    },
    {
      label: "Drafts",
      value: draftPosts,
      icon: Clock,
      bgColor: "bg-teal-100",
      textColor: "text-teal-800",
      iconBg: "bg-teal-200",
    },
    {
      label: "Avg. SEO Score",
      value: `${Math.round(avgSEOScore)}%`,
      icon: TrendingUp,
      bgColor: avgSEOScore >= 80 ? "bg-emerald-100" : avgSEOScore >= 60 ? "bg-yellow-100" : "bg-red-100",
      textColor: avgSEOScore >= 80 ? "text-emerald-800" : avgSEOScore >= 60 ? "text-yellow-800" : "text-red-800",
      iconBg: avgSEOScore >= 80 ? "bg-emerald-200" : avgSEOScore >= 60 ? "bg-yellow-200" : "bg-red-200",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Deep Green */}
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
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="group relative bg-white rounded-2xl p-6 shadow-lg border border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`inline-flex p-3 rounded-xl ${stat.iconBg} mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
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

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-emerald-200 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-800" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
          </div>
          <Link href="/dashboard/posts" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">
            View all
          </Link>
        </div>
        
        <div className="divide-y divide-emerald-100">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center justify-between hover:bg-emerald-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{post.title}</p>
                  <p className="text-sm text-gray-500">
                    {post.status} • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {post.seoReport && (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    post.seoReport.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    post.seoReport.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    SEO: {post.seoReport.score}%
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
