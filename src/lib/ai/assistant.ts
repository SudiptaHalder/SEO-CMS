import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIAssistant {
  async generateMetaDescription(content: string, keyword: string): Promise<string> {
    try {
      const prompt = `Generate a compelling meta description (120-160 characters) for content about "${keyword}". Content: ${content.substring(0, 500)}...`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Generate concise, click-worthy meta descriptions.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return response.choices[0].message.content?.replace(/["']/g, '') || '';
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to generate meta description');
    }
  }

  async suggestSEOTitle(content: string, keyword: string): Promise<string> {
    try {
      const prompt = `Generate an SEO-optimized title (50-60 characters) for content about "${keyword}". Content: ${content.substring(0, 500)}...`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Create compelling, keyword-rich titles.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 60,
        temperature: 0.7,
      });

      return response.choices[0].message.content?.replace(/["']/g, '') || '';
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to generate SEO title');
    }
  }

  async suggestKeywords(content: string): Promise<string[]> {
    try {
      const prompt = `Extract 5-7 relevant SEO keywords from this content. Return as comma-separated list. Content: ${content.substring(0, 1000)}...`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Extract the most relevant keywords.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.5,
      });

      const keywords = response.choices[0].message.content?.split(',').map(k => k.trim()) || [];
      return keywords.slice(0, 7);
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to generate keywords');
    }
  }

  async improveContent(content: string, instructions: string): Promise<string> {
    try {
      const prompt = `Improve this content for SEO: ${instructions}. Content: ${content}`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an SEO expert. Improve content while maintaining the original meaning.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || content;
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('Failed to improve content');
    }
  }
}
