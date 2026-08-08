import { NextRequest, NextResponse } from 'next/server';

const VPS_URL = 'http://195.88.211.117:8080';

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params);
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params);
}

export async function OPTIONS(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(req, params);
}

async function handleRequest(req: NextRequest, params: { path: string[] }) {
  try {
    const path = params.path.join('/');
    const url = new URL(req.url);
    const targetUrl = `${VPS_URL}/${path}${url.search}`;

    const headers = new Headers(req.headers);
    headers.delete('host'); // Let fetch set the host
    headers.delete('connection');

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer();
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual',
      // Disable cache for proxy
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy Failed", details: error.message }, { status: 502 });
  }
}
