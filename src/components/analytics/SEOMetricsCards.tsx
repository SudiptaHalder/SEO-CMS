import { prisma } from "@/lib/db/prisma";
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Award, 
  Percent, 
  Image 
} from "lucide-react";

interface SEOMetricsCardsProps {
  userId: string;
}

export default async function SEOMetricsCards({ userId }: SEOMetricsCardsProps) {
  try {
    // Get all published posts with their SEO reports
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "PUBLISHED"
      },
      include: {
        seoReport: true  // Changed from sEOReport to seoReport
      }
    });

    const publishedPosts = posts.length;
    const postsWithSEO = posts.filter(p => p.seoReport);
    
    // Calculate average SEO score
    const avgSEOScore = postsWithSEO.length > 0
      ? Math.round(postsWithSEO.reduce((acc, p) => acc + (p.seoReport?.score || 0), 0) / postsWithSEO.length)
      : 0;

    // Posts needing optimization (score < 60)
    const needsOptimization = postsWithSEO.filter(p => (p.seoReport?.score || 0) < 60).length;

    // High performing posts (score >= 80)
    const highPerforming = postsWithSEO.filter(p => (p.seoReport?.score || 0) >= 80).length;

    // Calculate average keyword density
    const avgKeywordDensity = postsWithSEO.length > 0
      ? (postsWithSEO.reduce((acc, p) => acc + (p.seoReport?.keywordDensity || 0), 0) / postsWithSEO.length).toFixed(1)
      : "0";

    // Calculate image alt coverage
    const avgImageAltScore = postsWithSEO.length > 0
      ? Math.round(postsWithSEO.reduce((acc, p) => acc + (p.seoReport?.imageAltScore || 0), 0) / postsWithSEO.length)
      : 0;

    const metrics = [
      {
        label: "Average SEO Score",
        value: avgSEOScore,
        unit: "%",
        icon: TrendingUp,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        description: "Across all published posts"
      },
      {
        label: "Published Posts",
        value: publishedPosts,
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        description: "Total content published"
      },
      {
        label: "Needs Optimization",
        value: needsOptimization,
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        description: "Posts with score < 60"
      },
      {
        label: "High Performing",
        value: highPerforming,
        icon: Award,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        description: "Posts with score ≥ 80"
      },
      {
        label: "Keyword Density",
        value: avgKeywordDensity,
        unit: "%",
        icon: Percent,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        description: "Average keyword density"
      },
      {
        label: "Image Alt Coverage",
        value: avgImageAltScore,
        unit: "%",
        icon: Image,
        color: "text-teal-600",
        bgColor: "bg-teal-100",
        description: "Average alt text coverage"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">
                {metric.value}{metric.unit}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {metric.label}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error in SEOMetricsCards:', error);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-red-500">Error loading data</p>
          </div>
        ))}
      </div>
    );
  }
}
