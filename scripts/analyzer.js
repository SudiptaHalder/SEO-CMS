const { load } = require('cheerio');

class SEOAnalyzer {
  async analyze(content, title, metaDescription, keyword, slug) {
    const $ = load(content);
    
    // Basic metrics
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    
    // Title analysis
    const titleScore = this.analyzeTitle(title, keyword);
    
    // Meta description analysis
    const descriptionScore = this.analyzeMetaDescription(metaDescription, keyword);
    
    // Keyword density
    const keywordDensity = this.calculateKeywordDensity(content, keyword);
    
    // Heading structure
    const headingScore = this.analyzeHeadings($);
    
    // Links
    const internalLinks = this.countInternalLinks($);
    const externalLinks = this.countExternalLinks($);
    
    // Image alt text
    const imageAltScore = this.analyzeImageAlt($);
    
    // Slug quality
    const slugScore = this.analyzeSlug(slug, keyword);
    
    // Readability
    const readabilityScore = this.calculateReadability(content);
    
    // Calculate overall score
    const score = Math.round(
      (titleScore * 0.15) +
      (descriptionScore * 0.15) +
      (Math.min(keywordDensity * 20, 15)) +
      (headingScore * 0.1) +
      (imageAltScore * 0.1) +
      (slugScore * 0.1) +
      (readabilityScore * 0.1) +
      (Math.min(internalLinks * 5, 10))
    );

    // Generate checks
    const checks = {
      titleLength: {
        passed: title.length >= 30 && title.length <= 60,
        message: title.length >= 30 && title.length <= 60 
          ? 'Title length is good' 
          : `Title should be 30-60 characters (currently ${title.length})`
      },
      metaDescription: {
        passed: metaDescription.length >= 120 && metaDescription.length <= 160,
        message: metaDescription.length >= 120 && metaDescription.length <= 160
          ? 'Meta description length is optimal'
          : `Meta description should be 120-160 characters (currently ${metaDescription.length})`
      },
      keywordDensity: {
        passed: keywordDensity >= 0.5 && keywordDensity <= 2.5,
        message: keywordDensity >= 0.5 && keywordDensity <= 2.5
          ? `Keyword density is optimal (${keywordDensity.toFixed(1)}%)`
          : `Keyword density should be 0.5-2.5% (currently ${keywordDensity.toFixed(1)}%)`
      },
      headings: {
        passed: headingScore >= 70,
        message: headingScore >= 70
          ? 'Heading structure is good'
          : 'Improve heading hierarchy (use H1, H2, H3 properly)'
      },
      internalLinks: {
        passed: internalLinks >= 2,
        message: internalLinks >= 2
          ? `Found ${internalLinks} internal links`
          : 'Add at least 2 internal links to improve SEO'
      },
      imageAlt: {
        passed: imageAltScore >= 80,
        message: imageAltScore >= 80
          ? 'All images have alt text'
          : 'Add alt text to all images'
      },
      slugQuality: {
        passed: slugScore >= 70,
        message: slugScore >= 70
          ? 'Slug is well-optimized'
          : 'Optimize slug (use keywords, keep it short)'
      },
      readability: {
        passed: readabilityScore >= 50,
        message: readabilityScore >= 50
          ? 'Content is readable'
          : 'Content is too complex, simplify sentences'
      }
    };

    // Generate suggestions
    const suggestions = [];
    if (!checks.titleLength.passed) suggestions.push(checks.titleLength.message);
    if (!checks.metaDescription.passed) suggestions.push(checks.metaDescription.message);
    if (!checks.keywordDensity.passed) suggestions.push(checks.keywordDensity.message);
    if (!checks.headings.passed) suggestions.push(checks.headings.message);
    if (!checks.internalLinks.passed) suggestions.push(checks.internalLinks.message);
    if (!checks.imageAlt.passed) suggestions.push(checks.imageAlt.message);
    if (!checks.slugQuality.passed) suggestions.push(checks.slugQuality.message);
    if (!checks.readability.passed) suggestions.push(checks.readability.message);

    return {
      score,
      titleScore,
      descriptionScore,
      keywordDensity,
      headingScore,
      internalLinks,
      externalLinks,
      readabilityScore,
      imageAltScore,
      slugScore,
      wordCount,
      readingTime: Math.ceil(wordCount / 200),
      keywordPresence: {
        inTitle: title.toLowerCase().includes(keyword.toLowerCase()),
        inMeta: metaDescription.toLowerCase().includes(keyword.toLowerCase()),
        inContent: content.toLowerCase().includes(keyword.toLowerCase())
      },
      suggestions
    };
  }

  analyzeTitle(title, keyword) {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 40;
    else if (title.length > 20 && title.length < 70) score += 20;
    
    if (title.toLowerCase().includes(keyword.toLowerCase())) score += 40;
    
    if (title.toLowerCase().indexOf(keyword.toLowerCase()) < 30) score += 20;
    
    return score;
  }

  analyzeMetaDescription(description, keyword) {
    let score = 0;
    if (description.length >= 120 && description.length <= 160) score += 60;
    else if (description.length > 100 && description.length < 180) score += 30;
    
    if (description.toLowerCase().includes(keyword.toLowerCase())) score += 40;
    
    return score;
  }

  calculateKeywordDensity(content, keyword) {
    if (!keyword) return 0;
    const words = content.toLowerCase().split(/\s+/).length;
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    return words > 0 ? (keywordCount / words) * 100 : 0;
  }

  analyzeHeadings($) {
    let score = 100;
    
    if ($('h1').length === 0) score -= 30;
    if ($('h1').length > 1) score -= 20;
    
    const hasH2 = $('h2').length > 0;
    if (!hasH2) score -= 20;
    
    return Math.max(score, 0);
  }

  countInternalLinks($) {
    return $('a[href^="/"]').length;
  }

  countExternalLinks($) {
    return $('a[href^="http"]').length;
  }

  analyzeImageAlt($) {
    const images = $('img');
    if (images.length === 0) return 100;
    
    const imagesWithAlt = images.filter((_, img) => $(img).attr('alt')).length;
    return (imagesWithAlt / images.length) * 100;
  }

  analyzeSlug(slug, keyword) {
    let score = 0;
    
    if (slug.length <= 60) score += 40;
    
    const slugifiedKeyword = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (slug.includes(slugifiedKeyword)) score += 40;
    
    if (/^[a-z0-9-]+$/.test(slug)) score += 20;
    
    return score;
  }

  calculateReadability(content) {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = this.countSyllables(content);
    
    if (sentences === 0 || words === 0) return 50;
    
    const wordsPerSentence = words / sentences;
    const syllablesPerWord = syllables / words;
    
    const score = 100 - ((wordsPerSentence - 10) * 2 + (syllablesPerWord - 1.5) * 20);
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    
    for (const word of words) {
      count += (word.match(/[aeiou]+/g) || []).length;
    }
    
    return count;
  }
}

module.exports = { SEOAnalyzer };
