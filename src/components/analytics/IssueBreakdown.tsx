import { prisma } from "@/lib/db/prisma";
import { AlertTriangle, XCircle, AlertCircle, Info, CheckCircle } from "lucide-react";

interface IssueBreakdownProps {
  userId: string;
}

export default async function IssueBreakdown({ userId }: IssueBreakdownProps) {
  try {
    // Get all posts with SEO reports for this user
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "PUBLISHED"
      },
      include: {
        seoReport: true  // Changed from sEOReport to seoReport
      }
    });

    // Filter posts that have SEO reports
    const postsWithSEO = posts.filter(post => post.seoReport);
    
    if (postsWithSEO.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Breakdown</h3>
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No SEO data available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Run SEO analysis on your posts to see issues.</p>
          </div>
        </div>
      );
    }

    // Count issues from suggestions
    const issueCounts: Record<string, number> = {};
    let totalIssues = 0;

    postsWithSEO.forEach(post => {
      if (post.seoReport?.suggestions && Array.isArray(post.seoReport.suggestions)) {
        post.seoReport.suggestions.forEach((suggestion: string) => {
          totalIssues++;
          
          if (suggestion.toLowerCase().includes('title')) {
            issueCounts['Title Issues'] = (issueCounts['Title Issues'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('meta') || suggestion.toLowerCase().includes('description')) {
            issueCounts['Meta Description Issues'] = (issueCounts['Meta Description Issues'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('keyword')) {
            issueCounts['Keyword Issues'] = (issueCounts['Keyword Issues'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('heading') || suggestion.toLowerCase().includes('h1')) {
            issueCounts['Heading Structure'] = (issueCounts['Heading Structure'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('link')) {
            issueCounts['Link Issues'] = (issueCounts['Link Issues'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('image') || suggestion.toLowerCase().includes('alt')) {
            issueCounts['Image Alt Text'] = (issueCounts['Image Alt Text'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('readability')) {
            issueCounts['Readability'] = (issueCounts['Readability'] || 0) + 1;
          } else if (suggestion.toLowerCase().includes('slug')) {
            issueCounts['Slug Issues'] = (issueCounts['Slug Issues'] || 0) + 1;
          } else {
            issueCounts['Other Issues'] = (issueCounts['Other Issues'] || 0) + 1;
          }
        });
      }
    });

    const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);

    const getIssueIcon = (issueType: string) => {
      if (issueType.includes('Title') || issueType.includes('Meta')) {
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      } else if (issueType.includes('Keyword')) {
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      } else if (issueType.includes('Heading') || issueType.includes('Slug')) {
        return <Info className="w-5 h-5 text-blue-500" />;
      } else {
        return <XCircle className="w-5 h-5 text-red-500" />;
      }
    };

    if (sortedIssues.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Breakdown</h3>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-600">No issues found! Great job! 🎉</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Breakdown</h3>
        
        <div className="space-y-4">
          {sortedIssues.map(([issueType, count]) => {
            const percentage = Math.round((count / totalIssues) * 100);
            
            return (
              <div key={issueType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIssueIcon(issueType)}
                    <span className="text-sm font-medium text-gray-700">{issueType}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count} issues</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Total issues: <span className="font-medium text-gray-900">{totalIssues}</span>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in IssueBreakdown:', error);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Breakdown</h3>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading data</p>
        </div>
      </div>
    );
  }
}
