import { prisma } from "@/lib/db/prisma";
import { Info } from "lucide-react";

interface SEOScoreTrendProps {
  userId: string;
}

export default async function SEOScoreTrend({ userId }: SEOScoreTrendProps) {
  try {
    // Get posts from last 30 days with SEO reports
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "PUBLISHED",
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        seoReport: true  // Changed from sEOReport to seoReport
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const postsWithSEO = posts.filter(p => p.seoReport);

    if (postsWithSEO.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Score Trend</h3>
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No trend data available yet</p>
            <p className="text-sm text-gray-500 mt-2">Publish posts and run SEO analysis to see trends.</p>
          </div>
        </div>
      );
    }

    // Group by week
    const weeklyData: Record<string, { total: number; count: number }> = {};
    
    postsWithSEO.forEach(post => {
      if (!post.seoReport) return;
      
      const date = new Date(post.createdAt);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { total: 0, count: 0 };
      }
      weeklyData[weekKey].total += post.seoReport.score;
      weeklyData[weekKey].count += 1;
    });

    const trendData = Object.entries(weeklyData)
      .map(([week, { total, count }]) => ({
        week,
        averageScore: Math.round(total / count)
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Score Trend (Last 30 Days)</h3>
        
        <div className="space-y-4">
          {trendData.map((item) => (
            <div key={item.week}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">
                  Week of {new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="font-medium text-emerald-600">{item.averageScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${item.averageScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Average over period:</span>
            <span className="font-medium text-emerald-600">
              {trendData.length > 0 
                ? Math.round(trendData.reduce((acc, item) => acc + item.averageScore, 0) / trendData.length) 
                : 0}%
            </span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in SEOScoreTrend:', error);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Score Trend</h3>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading data</p>
        </div>
      </div>
    );
  }
}
