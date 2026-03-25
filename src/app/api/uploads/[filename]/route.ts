import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
  try {
      const { filename } = await params;
    
    // Ruta segura al archivo en public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Prevenir path traversal
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const fileBuffer = await readFile(filePath);
    
    // Detectar tipo MIME basado en extensión
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 1 año
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}
