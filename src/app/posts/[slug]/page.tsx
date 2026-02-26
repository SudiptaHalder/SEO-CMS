import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Calendar, User, Tag, FolderTree, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import SimpleImage from "@/components/ui/SimpleImage";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const session = await getServerSession();
  
  // Find post by slug
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { name: true, email: true, id: true }
      },
      categories: true,
      tags: true
    }
  });

  if (!post) {
    notFound();
  }

  // Check if user can view this post
  const isAuthor = session?.user?.id && post.authorId === session.user.id;
  const canView = post.status === 'PUBLISHED' || isAuthor;

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Post Not Available</h1>
          <p className="text-gray-600 mb-8">
            This post is currently in draft mode and can only be viewed by its author.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/blog"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Blog
            </Link>
            <Link
              href="/dashboard/posts"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Author View Banner for Drafts */}
      {isAuthor && post.status !== 'PUBLISHED' && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">You're viewing your draft post. Only you can see this.</span>
            </div>
            <Link
              href={`/dashboard/posts/${post.id}/edit`}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Post
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section with Featured Image */}
      {post.featuredImage ? (
        <div className="w-full h-[400px] relative">
          <SimpleImage
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author?.name || 'Anonymous'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author?.name || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Categories & Tags */}
        {(post.categories.length > 0 || post.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200">
            {post.categories.length > 0 && (
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                {post.categories.map((cat) => (
                  <span key={cat.id} className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                {post.tags.map((tag) => (
                  <span key={tag.id} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-emerald-600"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* Back to Blog Link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
