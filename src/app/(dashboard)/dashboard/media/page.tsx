import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Upload, Image as ImageIcon, FileText, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function MediaPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your images and files</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm text-sm">
          <Upload className="w-4 h-4" />
          Upload Media
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors bg-emerald-50/30">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="text-sm text-gray-700 mb-1">Drag and drop files here, or click to select</p>
        <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, SVG (Max 10MB)</p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {item.mimeType?.startsWith('image/') ? (
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-emerald-600 opacity-50" />
                </div>
              ) : (
                <FileText className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">{item.originalName || 'Untitled'}</p>
              <p className="text-[10px] text-gray-500">{item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'Unknown size'}</p>
            </div>
            <button className="absolute top-1 right-1 p-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No media uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
