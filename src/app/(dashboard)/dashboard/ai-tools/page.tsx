import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Sparkles, FileText, Hash, Wand2, Edit } from "lucide-react";
import Link from "next/link";

export default async function AIToolsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  const tools = [
    {
      name: "Meta Description Generator",
      description: "Generate SEO-optimized meta descriptions for your content",
      icon: FileText,
      color: "from-emerald-500 to-teal-500",
      href: "/dashboard/ai-tools/meta-description",
    },
    {
      name: "SEO Title Generator",
      description: "Create compelling, keyword-rich titles that drive clicks",
      icon: Wand2,
      color: "from-blue-500 to-cyan-500",
      href: "/dashboard/ai-tools/seo-title",
    },
    {
      name: "Keyword Suggestions",
      description: "Discover relevant keywords to improve your content",
      icon: Hash,
      color: "from-purple-500 to-pink-500",
      href: "/dashboard/ai-tools/keywords",
    },
    {
      name: "Content Improver",
      description: "Enhance your content for better SEO and readability",
      icon: Edit,
      color: "from-orange-500 to-red-500",
      href: "/dashboard/ai-tools/improve",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-sm text-gray-600 mt-1">Leverage AI to optimize your content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="group relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <tool.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-sm text-gray-500">No AI tools used yet. Try one of the tools above!</p>
      </div>
    </div>
  );
}
