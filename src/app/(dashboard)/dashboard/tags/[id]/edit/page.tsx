import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import TagForm from "@/components/tags/TagForm";

export default async function EditTagPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const tag = await prisma.tag.findUnique({
    where: { id: params.id }
  });

  if (!tag) {
    redirect("/dashboard/tags");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tag</h1>
        <p className="text-sm text-gray-600 mt-1">Update tag information</p>
      </div>
      
      <TagForm initialData={tag} />
    </div>
  );
}
