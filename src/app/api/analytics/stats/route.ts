import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all published posts with SEO reports
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        status: "PUBLISHED"
      },
      include: {
        seoReport: true
      }
    });

    // Calculate metrics
    const publishedPosts = posts.length;
    const postsWithSEO = posts.filter(p => p.seoReport);
    
    const avgSEOScore = postsWithSEO.length > 0
      ? Math.round(postsWithSEO.reduce((acc, p) => acc + (p.seoReport?.score || 0), 0) / postsWithSEO.length)
      : 0;

    const needsOptimization = postsWithSEO.filter(p => (p.seoReport?.score || 0) < 60).length;
    const highPerforming = postsWithSEO.filter(p => (p.seoReport?.score || 0) >= 80).length;

    // Keyword density
    const avgKeywordDensity = postsWithSEO.length > 0
      ? Number((postsWithSEO.reduce((acc, p) => acc + (p.seoReport?.keywordDensity || 0), 0) / postsWithSEO.length).toFixed(1))
      : 0;

    // Image alt coverage
    const avgImageAltScore = postsWithSEO.length > 0
      ? Math.round(postsWithSEO.reduce((acc, p) => acc + (p.seoReport?.imageAltScore || 0), 0) / postsWithSEO.length)
      : 0;

    // Health distribution
    const distribution = {
      excellent: postsWithSEO.filter(p => (p.seoReport?.score || 0) >= 80).length,
      good: postsWithSEO.filter(p => {
        const score = p.seoReport?.score || 0;
        return score >= 60 && score < 80;
      }).length,
      poor: postsWithSEO.filter(p => (p.seoReport?.score || 0) < 60).length,
    };

    // Trend data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReports = await prisma.seoReport.findMany({
      where: {
        post: {
          authorId: userId,
          status: "PUBLISHED"
        },
        analyzedAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        analyzedAt: 'asc'
      },
      select: {
        score: true,
        analyzedAt: true
      }
    });

    // Group by date
    const trendData = recentReports.reduce((acc: any[], report) => {
      const date = report.analyzedAt.toISOString().split('T')[0];
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.total += report.score;
        existing.count += 1;
      } else {
        acc.push({
          date,
          total: report.score,
          count: 1
        });
      }
      return acc;
    }, []).map((d: any) => ({
      date: d.date,
      averageScore: Math.round(d.total / d.count)
    }));

    return NextResponse.json({
      metrics: {
        avgSEOScore,
        publishedPosts,
        needsOptimization,
        highPerforming,
        avgKeywordDensity,
        avgImageAltScore
      },
      distribution,
      trend: trendData.slice(-12) // Last 12 data points
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
