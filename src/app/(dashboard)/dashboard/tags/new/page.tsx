import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import TagForm from "@/components/tags/TagForm";

export default async function NewTagPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Tag</h1>
        <p className="text-sm text-gray-600 mt-1">Add a new tag to organize your content</p>
      </div>
      
      <TagForm />
    </div>
  );
}
