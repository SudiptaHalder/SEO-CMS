import { prisma } from "@/lib/db/prisma";
import { Hash, AlertCircle, XCircle, Info } from "lucide-react";

interface KeywordInsightsProps {
  userId: string;
}

export default async function KeywordInsights({ userId }: KeywordInsightsProps) {
  try {
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "PUBLISHED"
      },
      select: {
        id: true,
        title: true,
        focusKeyword: true,
        seoReport: {  // Changed from sEOReport to seoReport
          select: {
            keywordDensity: true
          }
        }
      }
    });

    if (posts.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Insights</h3>
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No published posts yet</p>
          </div>
        </div>
      );
    }

    // Count keyword frequency
    const keywordFrequency: Record<string, number> = {};
    posts.forEach(post => {
      if (post.focusKeyword) {
        keywordFrequency[post.focusKeyword] = (keywordFrequency[post.focusKeyword] || 0) + 1;
      }
    });

    // Sort keywords by frequency
    const topKeywords = Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Find keyword conflicts (used more than once)
    const keywordConflicts = Object.entries(keywordFrequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    // Coverage stats
    const postsWithKeyword = posts.filter(p => p.focusKeyword).length;
    const coveragePercentage = posts.length > 0 
      ? Math.round((postsWithKeyword / posts.length) * 100) 
      : 0;

    // Posts missing keywords
    const missingKeywordPosts = posts
      .filter(p => !p.focusKeyword)
      .slice(0, 5);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Insights</h3>
        
        {/* Coverage Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-700">{coveragePercentage}%</p>
            <p className="text-xs text-gray-600 mt-1">Keyword coverage</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-700">{postsWithKeyword}</p>
            <p className="text-xs text-gray-600 mt-1">Posts with keywords</p>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Most Used Keywords</h4>
          <div className="space-y-2">
            {topKeywords.map(([keyword, count]) => (
              <div key={keyword} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{keyword}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {count} {count === 1 ? 'post' : 'posts'}
                </span>
              </div>
            ))}
            {topKeywords.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No keywords used yet</p>
            )}
          </div>
        </div>

        {/* Keyword Conflicts */}
        {keywordConflicts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Keyword Conflicts
            </h4>
            <div className="space-y-2">
              {keywordConflicts.slice(0, 5).map(([keyword, count]) => (
                <div key={keyword} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-yellow-800">{keyword}</span>
                  <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                    Used in {count} posts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Missing Keywords */}
        {missingKeywordPosts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Posts Missing Keywords
            </h4>
            <div className="space-y-2">
              {missingKeywordPosts.map(post => (
                <div key={post.id} className="text-sm text-gray-600">
                  • {post.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in KeywordInsights:', error);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Insights</h3>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading data</p>
        </div>
      </div>
    );
  }
}
