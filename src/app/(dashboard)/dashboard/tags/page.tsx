import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import TagsClient from "@/components/tags/TagsClient";

export default async function TagsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const tags = await prisma.tag.findMany({
    include: {
      posts: {
        where: { authorId: session.user?.id },
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Convert tags to plain objects for serialization
  const serializedTags = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postCount: tag.posts.length
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your content tags</p>
        </div>
        <Link
          href="/dashboard/tags/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4">
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <TagsClient tags={serializedTags} />
      </div>
    </div>
  );
}
