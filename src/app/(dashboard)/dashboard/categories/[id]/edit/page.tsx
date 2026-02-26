import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import CategoryForm from "@/components/categories/CategoryForm";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const category = await prisma.category.findUnique({
    where: { id: params.id }
  });

  if (!category) {
    redirect("/dashboard/categories");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-sm text-gray-600 mt-1">Update category information</p>
      </div>
      
      <CategoryForm initialData={category} />
    </div>
  );
}
