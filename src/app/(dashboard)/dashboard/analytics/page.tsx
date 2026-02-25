import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TrendingUp, TrendingDown, Calendar, Download } from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { authorId: session.user?.id },
    include: {
      seoReport: {
        select: { score: true }
      }
    }
  });

  const totalPosts = posts.length;
  const postsWithSEO = posts.filter(p => p.seoReport).length;
  const avgSEOScore = posts.reduce((acc, p) => acc + (p.seoReport?.score || 0), 0) / (postsWithSEO || 1);
  const bestPost = posts.sort((a, b) => (b.seoReport?.score || 0) - (a.seoReport?.score || 0))[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Track your SEO performance and content health</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Last 30 days</span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
          <p className="text-xs text-gray-500 mb-1">Average SEO Score</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">{Math.round(avgSEOScore)}%</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              avgSEOScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {avgSEOScore >= 70 ? 'Good' : 'Needs Work'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
          <p className="text-xs text-gray-500 mb-1">Posts with SEO</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">{postsWithSEO}/{totalPosts}</p>
            <span className="text-xs text-gray-500">
              {Math.round((postsWithSEO / totalPosts) * 100)}% coverage
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
          <p className="text-xs text-gray-500 mb-1">Best Performing Post</p>
          {bestPost ? (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">{bestPost.title}</p>
              <p className="text-xs text-emerald-600 mt-1">SEO Score: {bestPost.seoReport?.score || 0}%</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No posts yet</p>
          )}
        </div>
      </div>

      {/* SEO Score Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Score Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Excellent (80-100%)</span>
              <span className="font-medium text-emerald-600">
                {posts.filter(p => (p.seoReport?.score || 0) >= 80).length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-emerald-500 rounded-full" 
                style={{ width: `${(posts.filter(p => (p.seoReport?.score || 0) >= 80).length / (postsWithSEO || 1)) * 100}%` }} 
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Good (60-79%)</span>
              <span className="font-medium text-yellow-600">
                {posts.filter(p => {
                  const score = p.seoReport?.score || 0;
                  return score >= 60 && score < 80;
                }).length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-yellow-500 rounded-full" 
                style={{ width: `${(posts.filter(p => {
                  const score = p.seoReport?.score || 0;
                  return score >= 60 && score < 80;
                }).length / (postsWithSEO || 1)) * 100}%` }} 
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Needs Improvement (&lt;60%)</span>
              <span className="font-medium text-red-600">
                {posts.filter(p => (p.seoReport?.score || 0) < 60).length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-red-500 rounded-full" 
                style={{ width: `${(posts.filter(p => (p.seoReport?.score || 0) < 60).length / (postsWithSEO || 1)) * 100}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Posts Performance</h3>
        <div className="space-y-3">
          {posts.slice(0, 5).map(post => (
            <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (post.seoReport?.score || 0) >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  (post.seoReport?.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {post.seoReport?.score || 0}%
                </span>
                <Link href={`/dashboard/posts/${post.id}/edit`} className="text-xs text-emerald-600 hover:text-emerald-700">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
