const { PrismaClient } = require('@prisma/client')
const { SEOAnalyzer } = require('./analyzer.js')

const prisma = new PrismaClient()
const analyzer = new SEOAnalyzer()

async function backfillSEO() {
  try {
    console.log('📊 Starting SEO backfill...')
    console.log('='.repeat(50))
    
    // Get all posts
    const posts = await prisma.post.findMany()
    console.log(`Found ${posts.length} posts to analyze`)

    let analyzed = 0
    let errors = 0
    let skipped = 0

    for (const post of posts) {
      console.log(`\n🔍 Analyzing post: ${post.title} (${post.id})`)
      
      try {
        // Check if SEO report already exists (using correct model name: sEOReport)
        const existingReport = await prisma.sEOReport.findUnique({
          where: { postId: post.id }
        })

        if (existingReport) {
          console.log(`⏭️  SEO report already exists for this post (score: ${existingReport.score}%)`)
          skipped++
          continue
        }

        const analysis = await analyzer.analyze(
          post.content || '',
          post.title || '',
          post.metaDescription || '',
          post.focusKeyword || '',
          post.slug || ''
        )

        // Create SEO report (using correct model name: sEOReport)
        await prisma.sEOReport.create({
          data: {
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
        })

        console.log(`✅ Score: ${analysis.score}%`)
        analyzed++
      } catch (error) {
        console.error(`❌ Error analyzing post ${post.id}:`, error.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 SEO BACKFILL COMPLETE')
    console.log('='.repeat(50))
    console.log(`✅ New reports created: ${analyzed}`)
    console.log(`⏭️  Already existed: ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    console.log('='.repeat(50))

    // Show summary by score ranges (using correct model name: sEOReport)
    const reports = await prisma.sEOReport.findMany({
      select: { score: true }
    })

    if (reports.length > 0) {
      const excellent = reports.filter(r => r.score >= 80).length
      const good = reports.filter(r => r.score >= 60 && r.score < 80).length
      const poor = reports.filter(r => r.score < 60).length

      console.log('\n📊 SEO Score Distribution:')
      console.log(`   Excellent (80-100): ${excellent}`)
      console.log(`   Good (60-79): ${good}`)
      console.log(`   Poor (0-59): ${poor}`)
    }

  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillSEO()
