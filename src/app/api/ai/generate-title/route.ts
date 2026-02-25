import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, keyword } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const prompt = `Generate an SEO-optimized title (50-60 characters) for content about "${keyword || 'the topic'}".
    Content: ${content.substring(0, 500)}...
    
    Requirements:
    - Length: 50-60 characters
    - Include the main keyword near the beginning
    - Be compelling and click-worthy
    - No quotes in the response
    - Return only the title text`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an SEO expert. Create compelling, keyword-rich titles.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    const title = response.choices[0].message.content?.replace(/["']/g, '') || '';

    return NextResponse.json({ title });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
