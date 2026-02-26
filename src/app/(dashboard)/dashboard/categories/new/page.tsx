import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CategoryForm from "@/components/categories/CategoryForm";

export default async function NewCategoryPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Category</h1>
        <p className="text-sm text-gray-600 mt-1">Add a new category to organize your content</p>
      </div>
      
      <CategoryForm />
    </div>
  );
}
