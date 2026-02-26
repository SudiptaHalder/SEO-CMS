import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import SEOMetricsCards from "@/components/analytics/SEOMetricsCards";
import SEOHealthDistribution from "@/components/analytics/SEOHealthDistribution";
import SEOScoreTrend from "@/components/analytics/SEOScoreTrend";
import ContentOptimizationTable from "@/components/analytics/ContentOptimizationTable";
import KeywordInsights from "@/components/analytics/KeywordInsights";
import IssueBreakdown from "@/components/analytics/IssueBreakdown";
import { AnalyticsSkeleton } from "@/components/analytics/AnalyticsSkeleton";

export default async function SEOAnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          SEO Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time insights into your content's SEO performance
        </p>
      </div>

      {/* Metrics Cards */}
      <Suspense fallback={<AnalyticsSkeleton type="cards" />}>
        <SEOMetricsCards userId={userId} />
      </Suspense>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<AnalyticsSkeleton type="chart" />}>
          <SEOHealthDistribution userId={userId} />
        </Suspense>
        <Suspense fallback={<AnalyticsSkeleton type="chart" />}>
          <SEOScoreTrend userId={userId} />
        </Suspense>
      </div>

      {/* Optimization Table */}
      <Suspense fallback={<AnalyticsSkeleton type="table" />}>
        <ContentOptimizationTable userId={userId} />
      </Suspense>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<AnalyticsSkeleton type="insights" />}>
          <KeywordInsights userId={userId} />
        </Suspense>
        <Suspense fallback={<AnalyticsSkeleton type="insights" />}>
          <IssueBreakdown userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
