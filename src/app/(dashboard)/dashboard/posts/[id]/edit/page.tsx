import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import PostForm from "@/components/posts/PostForm";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      categories: true,
      tags: true,
    }
  });

  if (!post) {
    redirect("/dashboard/posts");
  }

  // Check if user owns this post
  if (post.authorId !== session.user?.id) {
    redirect("/dashboard/posts");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostForm initialData={post} />
    </div>
  );
}
