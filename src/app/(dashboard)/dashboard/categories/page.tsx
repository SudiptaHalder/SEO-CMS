import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { deleteCategory } from "@/actions/categories";
import CategoryActions from "@/components/categories/CategoryActions";

export default async function CategoriesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    include: {
      posts: {
        where: { authorId: session.user?.id },
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-600 mt-1">Organize your content with categories</p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-sm text-gray-900">{category.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{category.slug}</td>
                <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">
                  {category.description || '-'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{category.posts.length}</td>
                <td className="px-5 py-3">
                  <CategoryActions 
                    categoryId={category.id} 
                    postCount={category.posts.length}
                    onDelete={deleteCategory}
                  />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                  No categories yet. Create your first category!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
