import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth";
import PostForm from "@/components/posts/PostForm";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  console.log('='.repeat(50));
  console.log('📝 EDIT POST PAGE');
  console.log('='.repeat(50));
  
  // Get session with explicit authOptions
  const session = await getServerSession(authOptions);
  
  console.log('🔐 Session:', JSON.stringify(session, null, 2));

  if (!session) {
    console.log('❌ No session, redirecting to login');
    redirect("/login");
  }

  if (!session.user?.id) {
    console.log('❌ Session has no user ID');
    redirect("/login");
  }

  // Ensure params exists and has id
  if (!params || !params.id) {
    console.error('❌ No post ID provided');
    redirect("/dashboard/posts");
  }

  const postId = params.id;
  console.log('🔍 Looking for post with ID:', postId);

  // Fetch the post with all relations
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      categories: {
        select: { id: true, name: true }
      },
      tags: {
        select: { id: true, name: true }
      },
      author: {
        select: { id: true, email: true, name: true }
      }
    }
  });

  if (!post) {
    console.error('❌ Post not found:', postId);
    redirect("/dashboard/posts");
  }

  console.log('📄 Post found:', {
    id: post.id,
    title: post.title,
    authorId: post.authorId,
    authorEmail: post.author?.email
  });

  console.log('🔍 Comparing IDs:');
  console.log(`   Session user ID: "${session.user.id}"`);
  console.log(`   Post author ID: "${post.authorId}"`);
  console.log(`   Do they match? ${session.user.id === post.authorId ? 'YES ✅' : 'NO ❌'}`);

  // Check if user owns this post
  if (session.user.id !== post.authorId) {
    console.error('❌ User does not own this post');
    console.log('   Session user ID:', session.user.id);
    console.log('   Post author ID:', post.authorId);
    
    // Get all users for debugging
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log('📋 All users in database:', JSON.stringify(allUsers, null, 2));
    
    redirect("/dashboard/posts");
  }

  console.log('✅ User owns this post, proceeding to edit');

  // Serialize the post data for the form
  const serializedPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || '',
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    focusKeyword: post.focusKeyword || '',
    status: post.status,
    categoryId: post.categories[0]?.id || '',
    tags: post.tags.map(t => t.name).join(', '),
    featuredImage: post.featuredImage || '',
    scheduledFor: post.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : '',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-sm text-gray-600 mt-1">Update your content and SEO settings</p>
      </div>
      
      <PostForm initialData={serializedPost} />
    </div>
  );
}
