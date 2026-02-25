import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const prompt = `Extract 5-7 relevant SEO keywords from this content. Return as a comma-separated list.
    Content: ${content.substring(0, 1000)}...
    
    Requirements:
    - Keywords should be relevant to the main topic
    - Include long-tail keywords where appropriate
    - Return only the comma-separated list, no other text`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an SEO expert. Extract the most relevant keywords.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const keywordsText = response.choices[0].message.content || '';
    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0).slice(0, 7);

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate keywords' },
      { status: 500 }
    );
  }
}
