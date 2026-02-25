import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PostForm from "@/components/posts/PostForm";

export default async function NewPostPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostForm />
    </div>
  );
}
