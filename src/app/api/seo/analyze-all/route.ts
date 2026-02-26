import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SEOAnalyzer } from '@/lib/seo/analyzer';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyzer = new SEOAnalyzer();
    
    // Get all posts for this user that don't have SEO reports
    const posts = await prisma.post.findMany({
      where: { 
        authorId: session.user.id,
      },
      include: {
        seoReport: true
      }
    });

    const results = [];

    for (const post of posts) {
      try {
        // Analyze the post
        const analysis = await analyzer.analyze(
          post.content || '',
          post.title || '',
          post.metaDescription || '',
          post.focusKeyword || '',
          post.slug || ''
        );

        // Create or update SEO report
        const seoReport = await prisma.seoReport.upsert({
          where: { postId: post.id },
          update: {
            score: analysis.score,
            titleScore: analysis.titleScore,
            descriptionScore: analysis.descriptionScore,
            keywordDensity: analysis.keywordDensity,
            headingScore: analysis.headingScore,
            internalLinks: analysis.internalLinks,
            externalLinks: analysis.externalLinks,
            readabilityScore: analysis.readabilityScore,
            imageAltScore: analysis.imageAltScore,
            slugScore: analysis.slugScore,
            keywordPresence: analysis.keywordPresence,
            suggestions: analysis.suggestions,
            analyzedAt: new Date()
          },
          create: {
            postId: post.id,
            score: analysis.score,
            titleScore: analysis.titleScore,
            descriptionScore: analysis.descriptionScore,
            keywordDensity: analysis.keywordDensity,
            headingScore: analysis.headingScore,
            internalLinks: analysis.internalLinks,
            externalLinks: analysis.externalLinks,
            readabilityScore: analysis.readabilityScore,
            imageAltScore: analysis.imageAltScore,
            slugScore: analysis.slugScore,
            keywordPresence: analysis.keywordPresence,
            suggestions: analysis.suggestions,
            analyzedAt: new Date()
          }
        });

        results.push({
          postId: post.id,
          title: post.title,
          score: analysis.score,
          created: true
        });
      } catch (error) {
        console.error(`Error analyzing post ${post.id}:`, error);
        results.push({
          postId: post.id,
          title: post.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      analyzed: results.length,
      results
    });

  } catch (error) {
    console.error('Error in analyze-all:', error);
    return NextResponse.json({ error: 'Failed to analyze posts' }, { status: 500 });
  }
}
