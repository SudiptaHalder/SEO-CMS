import { prisma } from "@/lib/db/prisma";
import { Info } from "lucide-react";

interface SEOHealthDistributionProps {
  userId: string;
}

export default async function SEOHealthDistribution({ userId }: SEOHealthDistributionProps) {
  try {
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "PUBLISHED"
      },
      include: {
        seoReport: true  // Changed from sEOReport to seoReport
      }
    });

    const postsWithSEO = posts.filter(p => p.seoReport);
    
    const excellent = postsWithSEO.filter(p => (p.seoReport?.score || 0) >= 80).length;
    const good = postsWithSEO.filter(p => {
      const score = p.seoReport?.score || 0;
      return score >= 60 && score < 80;
    }).length;
    const poor = postsWithSEO.filter(p => (p.seoReport?.score || 0) < 60).length;

    const total = postsWithSEO.length;

    if (total === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Health Distribution</h3>
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No SEO data available yet</p>
            <p className="text-sm text-gray-500 mt-2">Publish posts and run SEO analysis to see distribution.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Health Distribution</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Excellent (80-100)</span>
              <span className="font-medium text-emerald-600">{excellent} posts</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: total > 0 ? `${(excellent / total) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Good (60-79)</span>
              <span className="font-medium text-yellow-600">{good} posts</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: total > 0 ? `${(good / total) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Poor (0-59)</span>
              <span className="font-medium text-red-600">{poor} posts</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full"
                style={{ width: total > 0 ? `${(poor / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total posts analyzed:</span>
            <span className="font-medium text-gray-900">{total}</span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in SEOHealthDistribution:', error);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Health Distribution</h3>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading data</p>
        </div>
      </div>
    );
  }
}
