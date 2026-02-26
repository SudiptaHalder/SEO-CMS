import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Test if prisma is defined
    if (!prisma) {
      return NextResponse.json({ error: 'prisma is undefined' }, { status: 500 });
    }
    
    // Try to query
    const count = await prisma.seoReport.count();
    
    return NextResponse.json({ 
      success: true, 
      prismaDefined: !!prisma,
      seoReportCount: count 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
