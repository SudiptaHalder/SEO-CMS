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

    const prompt = `Generate a compelling meta description (120-160 characters) for content about "${keyword || 'the topic'}". 
    Content: ${content.substring(0, 500)}...
    
    Requirements:
    - Length: 120-160 characters
    - Include the main keyword naturally
    - Be compelling and click-worthy
    - No quotes in the response
    - Return only the meta description text`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an SEO expert. Generate concise, effective meta descriptions.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const description = response.choices[0].message.content?.replace(/["']/g, '') || '';

    return NextResponse.json({ description });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meta description' },
      { status: 500 }
    );
  }
}
