import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    // Construct the full URL if it's a relative path from the bot server
    let targetUrl = url;
    if (url.startsWith('/')) {
      targetUrl = `http://195.88.211.117:8080${url}`;
    }

    const res = await fetch(targetUrl);
    
    if (!res.ok) {
      return new NextResponse(`Failed to fetch media: ${res.statusText}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
