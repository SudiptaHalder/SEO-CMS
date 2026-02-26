import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DebugPostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true
    }
  });

  if (!post) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600">Post not found</h1>
        <p className="mt-4">ID: {params.id}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Post: {post.title}</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Post Data:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(post, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Featured Image URL:</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <code className="text-sm break-all">{post.featuredImage || 'No featured image'}</code>
          </div>
        </div>

        {post.featuredImage && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Image Test:</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <img 
                src={post.featuredImage} 
                alt="Featured" 
                className="max-w-full h-auto mx-auto"
                onError={(e) => {
                  console.error('Image failed to load:', post.featuredImage);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={() => console.log('Image loaded successfully:', post.featuredImage)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
