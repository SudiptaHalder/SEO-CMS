import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('📸 Uploading file:', file.name, 'type:', file.type, 'size:', file.size);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    
    // Define upload path
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, filename);

    console.log('Saving file to:', filepath);

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created/verified');
    } catch (err) {
      console.log('Upload directory error:', err);
    }

    // Save file
    await writeFile(filepath, buffer);
    console.log('File saved successfully');
    
    // Return the URL
    const fileUrl = `/uploads/${filename}`;
    
    // Save to database (optional)
    try {
      const { prisma } = await import('@/lib/db/prisma');
      await prisma.media.create({
        data: {
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: fileUrl,
          uploadedBy: session.user.id,
        }
      });
      console.log('Media record created in database');
    } catch (dbError) {
      console.error('Database error (non-critical):', dbError);
      // Continue even if database save fails
    }

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
}

// Add GET endpoint to serve uploaded files info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/db/prisma');
    const media = await prisma.media.findMany({
      where: { uploadedBy: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
