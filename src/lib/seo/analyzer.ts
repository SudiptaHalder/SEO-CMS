import { load } from 'cheerio';

export interface SEOAnalysisResult {
  score: number;
  titleScore: number;
  descriptionScore: number;
  keywordDensity: number;
  headingScore: number;
  internalLinks: number;
  externalLinks: number;
  readabilityScore: number;
  imageAltScore: number;
  slugScore: number;
  wordCount: number;
  readingTime: number;
  checks: {
    titleLength: { passed: boolean; message: string };
    metaDescription: { passed: boolean; message: string };
    keywordDensity: { passed: boolean; message: string };
    headings: { passed: boolean; message: string };
    internalLinks: { passed: boolean; message: string };
    imageAlt: { passed: boolean; message: string };
    slugQuality: { passed: boolean; message: string };
    readability: { passed: boolean; message: string };
  };
  suggestions: string[];
}

export class SEOAnalyzer {
  async analyze(
    content: string, 
    title: string, 
    metaDescription: string, 
    keyword: string, 
    slug: string
  ): Promise<SEOAnalysisResult> {
    const $ = load(content);
    
    // Basic metrics
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    // Title analysis
    const titleScore = this.analyzeTitle(title, keyword);
    const titleLengthPassed = title.length >= 30 && title.length <= 60;
    
    // Meta description analysis
    const descriptionScore = this.analyzeMetaDescription(metaDescription, keyword);
    const metaDescriptionPassed = metaDescription.length >= 120 && metaDescription.length <= 160;
    
    // Keyword density
    const keywordDensity = this.calculateKeywordDensity(content, keyword);
    const keywordDensityPassed = keywordDensity >= 0.5 && keywordDensity <= 2.5;
    
    // Heading structure
    const headingScore = this.analyzeHeadings($);
    const headingsPassed = headingScore >= 70;
    
    // Links
    const internalLinks = this.countInternalLinks($);
    const internalLinksPassed = internalLinks >= 2;
    
    // Image alt text
    const imageAltScore = this.analyzeImageAlt($);
    const imageAltPassed = imageAltScore >= 80;
    
    // Slug quality
    const slugScore = this.analyzeSlug(slug, keyword);
    const slugQualityPassed = slugScore >= 70;
    
    // Readability
    const readabilityScore = this.calculateReadability(content);
    const readabilityPassed = readabilityScore >= 50;
    
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
        passed: titleLengthPassed,
        message: titleLengthPassed 
          ? 'Title length is good' 
          : `Title should be 30-60 characters (currently ${title.length})`
      },
      metaDescription: {
        passed: metaDescriptionPassed,
        message: metaDescriptionPassed
          ? 'Meta description length is optimal'
          : `Meta description should be 120-160 characters (currently ${metaDescription.length})`
      },
      keywordDensity: {
        passed: keywordDensityPassed,
        message: keywordDensityPassed
          ? `Keyword density is optimal (${keywordDensity.toFixed(1)}%)`
          : `Keyword density should be 0.5-2.5% (currently ${keywordDensity.toFixed(1)}%)`
      },
      headings: {
        passed: headingsPassed,
        message: headingsPassed
          ? 'Heading structure is good'
          : 'Improve heading hierarchy (use H1, H2, H3 properly)'
      },
      internalLinks: {
        passed: internalLinksPassed,
        message: internalLinksPassed
          ? `Found ${internalLinks} internal links`
          : 'Add at least 2 internal links to improve SEO'
      },
      imageAlt: {
        passed: imageAltPassed,
        message: imageAltPassed
          ? 'All images have alt text'
          : 'Add alt text to all images'
      },
      slugQuality: {
        passed: slugQualityPassed,
        message: slugQualityPassed
          ? 'Slug is well-optimized'
          : 'Optimize slug (use keywords, keep it short)'
      },
      readability: {
        passed: readabilityPassed,
        message: readabilityPassed
          ? 'Content is readable'
          : 'Content is too complex, simplify sentences'
      }
    };

    // Generate suggestions
    const suggestions = this.generateSuggestions(checks);

    return {
      score,
      titleScore,
      descriptionScore,
      keywordDensity,
      headingScore,
      internalLinks,
      externalLinks: this.countExternalLinks($),
      readabilityScore,
      imageAltScore,
      slugScore,
      wordCount,
      readingTime,
      checks,
      suggestions
    };
  }

  private analyzeTitle(title: string, keyword: string): number {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 40;
    else if (title.length > 20 && title.length < 70) score += 20;
    
    if (title.toLowerCase().includes(keyword.toLowerCase())) score += 40;
    
    if (title.toLowerCase().indexOf(keyword.toLowerCase()) < 30) score += 20;
    
    return score;
  }

  private analyzeMetaDescription(description: string, keyword: string): number {
    let score = 0;
    if (description.length >= 120 && description.length <= 160) score += 60;
    else if (description.length > 100 && description.length < 180) score += 30;
    
    if (description.toLowerCase().includes(keyword.toLowerCase())) score += 40;
    
    return score;
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    if (!keyword) return 0;
    const words = content.toLowerCase().split(/\s+/).length;
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    return words > 0 ? (keywordCount / words) * 100 : 0;
  }

  private analyzeHeadings($: any): number {
    let score = 100;
    
    if ($('h1').length === 0) score -= 30;
    if ($('h1').length > 1) score -= 20;
    
    const hasH2 = $('h2').length > 0;
    if (!hasH2) score -= 20;
    
    return Math.max(score, 0);
  }

  private countInternalLinks($: any): number {
    const baseUrl = process.env.NEXTAUTH_URL || '';
    return $('a[href^="/"], a[href^="' + baseUrl + '"]').length;
  }

  private countExternalLinks($: any): number {
    const baseUrl = process.env.NEXTAUTH_URL || '';
    return $('a[href^="http"]:not([href^="' + baseUrl + '"])').length;
  }

  private analyzeImageAlt($: any): number {
    const images = $('img');
    if (images.length === 0) return 100;
    
    const imagesWithAlt = images.filter((_: any, img: any) => $(img).attr('alt') && $(img).attr('alt').length > 0).length;
    return (imagesWithAlt / images.length) * 100;
  }

  private analyzeSlug(slug: string, keyword: string): number {
    let score = 0;
    
    if (slug.length <= 60) score += 40;
    
    if (slug.includes(this.slugify(keyword))) score += 40;
    
    if (/^[a-z0-9-]+$/.test(slug)) score += 20;
    
    return score;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private calculateReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = this.countSyllables(content);
    
    if (sentences === 0 || words === 0) return 50;
    
    const wordsPerSentence = words / sentences;
    const syllablesPerWord = syllables / words;
    
    const score = 100 - ((wordsPerSentence - 10) * 2 + (syllablesPerWord - 1.5) * 20);
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    
    for (const word of words) {
      count += (word.match(/[aeiou]+/g) || []).length;
    }
    
    return count;
  }

  private generateSuggestions(checks: any): string[] {
    const suggestions = [];
    
    if (!checks.titleLength.passed) suggestions.push(checks.titleLength.message);
    if (!checks.metaDescription.passed) suggestions.push(checks.metaDescription.message);
    if (!checks.keywordDensity.passed) suggestions.push(checks.keywordDensity.message);
    if (!checks.headings.passed) suggestions.push(checks.headings.message);
    if (!checks.internalLinks.passed) suggestions.push(checks.internalLinks.message);
    if (!checks.imageAlt.passed) suggestions.push(checks.imageAlt.message);
    if (!checks.slugQuality.passed) suggestions.push(checks.slugQuality.message);
    if (!checks.readability.passed) suggestions.push(checks.readability.message);
    
    return suggestions;
  }
}
