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
  keywordPresence: Record<string, any>;
  suggestions: string[];
}

export class SEOAnalyzer {
  async analyze(content: string, title: string, metaDescription: string, keyword: string, slug: string): Promise<SEOAnalysisResult> {
    const $ = load(content);
    
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
    
    // Readability (simplified Flesch-like)
    const readabilityScore = this.calculateReadability(content);
    
    // Image alt text
    const imageAltScore = this.analyzeImageAlt($);
    
    // Slug quality
    const slugScore = this.analyzeSlug(slug, keyword);
    
    // Calculate overall score
    const score = Math.round(
      (titleScore * 0.2) +
      (descriptionScore * 0.2) +
      (Math.min(keywordDensity / 2, 10) * 5) + // Optimal density ~1-2%
      (headingScore * 0.1) +
      (imageAltScore * 0.1) +
      (slugScore * 0.1) +
      (readabilityScore * 0.1) +
      (Math.min(internalLinks, 5) * 2) // Max 10 points for internal links
    );
    
    // Generate suggestions
    const suggestions = this.generateSuggestions({
      titleScore,
      descriptionScore,
      keywordDensity,
      headingScore,
      imageAltScore,
      slugScore,
      internalLinks,
      externalLinks
    });
    
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
      keywordPresence: {
        inTitle: title.toLowerCase().includes(keyword.toLowerCase()),
        inMeta: metaDescription.toLowerCase().includes(keyword.toLowerCase()),
        inContent: content.toLowerCase().includes(keyword.toLowerCase())
      },
      suggestions
    };
  }

  private analyzeTitle(title: string, keyword: string): number {
    let score = 0;
    
    // Length check (50-60 characters optimal)
    if (title.length >= 50 && title.length <= 60) score += 40;
    else if (title.length > 30 && title.length < 70) score += 20;
    
    // Keyword presence
    if (title.toLowerCase().includes(keyword.toLowerCase())) score += 30;
    
    // Position check - keyword near beginning
    if (title.toLowerCase().indexOf(keyword.toLowerCase()) < 30) score += 30;
    
    return score;
  }

  private analyzeMetaDescription(description: string, keyword: string): number {
    let score = 0;
    
    // Length check (150-160 characters optimal)
    if (description.length >= 150 && description.length <= 160) score += 50;
    else if (description.length > 120 && description.length < 180) score += 30;
    
    // Keyword presence
    if (description.toLowerCase().includes(keyword.toLowerCase())) score += 50;
    
    return score;
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/).length;
    const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    
    return words > 0 ? (keywordCount / words) * 100 : 0;
  }

  private analyzeHeadings($: any): number {
    let score = 100;
    
    // Check for H1
    if ($('h1').length === 0) score -= 30;
    if ($('h1').length > 1) score -= 20;
    
    // Check heading hierarchy
    const hasH2 = $('h2').length > 0;
    if (!hasH2) score -= 20;
    
    return Math.max(score, 0);
  }

  private countInternalLinks($: any): number {
    const links = $('a[href^="/"], a[href^="' + process.env.NEXTAUTH_URL + '"]');
    return links.length;
  }

  private countExternalLinks($: any): number {
    const links = $('a[href^="http"]:not([href^="' + process.env.NEXTAUTH_URL + '"])');
    return links.length;
  }

  private calculateReadability(content: string): number {
    // Simplified readability score (0-100)
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);
    
    if (sentences === 0 || words === 0) return 50;
    
    const wordsPerSentence = words / sentences;
    const syllablesPerWord = syllables / words;
    
    // Lower score for complex text (more syllables per word, longer sentences)
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

  private analyzeImageAlt($: any): number {
    const images = $('img');
    if (images.length === 0) return 100;
    
    const imagesWithAlt = images.filter((_: any, img: any) => $(img).attr('alt')).length;
    return (imagesWithAlt / images.length) * 100;
  }

  private analyzeSlug(slug: string, keyword: string): number {
    let score = 0;
    
    // Length check
    if (slug.length <= 60) score += 40;
    
    // Contains keyword
    if (slug.includes(this.slugify(keyword))) score += 40;
    
    // Clean format (only hyphens, no special chars)
    if (/^[a-z0-9-]+$/.test(slug)) score += 20;
    
    return score;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generateSuggestions(metrics: any): string[] {
    const suggestions = [];
    
    if (metrics.titleScore < 70) {
      suggestions.push('Optimize title: Keep it between 50-60 characters and include primary keyword near the beginning.');
    }
    
    if (metrics.descriptionScore < 70) {
      suggestions.push('Improve meta description: Aim for 150-160 characters with keyword inclusion.');
    }
    
    if (metrics.keywordDensity < 1) {
      suggestions.push('Increase keyword density: Target 1-2% keyword density for better relevance.');
    } else if (metrics.keywordDensity > 3) {
      suggestions.push('Reduce keyword density: Current density may be considered keyword stuffing.');
    }
    
    if (metrics.headingScore < 80) {
      suggestions.push('Fix heading structure: Ensure one H1 and proper H2/H3 hierarchy.');
    }
    
    if (metrics.imageAltScore < 100) {
      suggestions.push('Add alt text to all images for better accessibility and SEO.');
    }
    
    if (metrics.internalLinks < 3) {
      suggestions.push('Add more internal links: Aim for at least 3-5 internal links per post.');
    }
    
    return suggestions;
  }
}
