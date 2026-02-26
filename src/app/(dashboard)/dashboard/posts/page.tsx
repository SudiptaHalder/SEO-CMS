import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Search, Filter, ExternalLink, Edit } from "lucide-react";
import PostActions from "@/components/posts/PostActions";
import SimpleImage from "@/components/ui/SimpleImage";

export default async function PostsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { authorId: session.user?.id },
    orderBy: { createdAt: "desc" },
    include: {
      seoReport: {
        select: { score: true }
      }
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
      PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
      ARCHIVED: "bg-red-100 text-red-700 border-red-200",
      SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your content and SEO optimization</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Image</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">SEO Score</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        {post.featuredImage ? (
                          <SimpleImage
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-medium text-sm">
                              {post.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link 
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {post.seoReport ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getScoreColor(post.seoReport.score)}`}>
                          {post.seoReport.score}%
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full">
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
                    ) : (
                      <span className="text-xs px-2 py-1 text-gray-500 bg-gray-100 rounded-full border border-gray-200">
                        Not analyzed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Post"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <PostActions postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                    <p className="mb-3">No posts yet</p>
                    <Link
                      href="/dashboard/posts/new"
                      className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Create your first post
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
