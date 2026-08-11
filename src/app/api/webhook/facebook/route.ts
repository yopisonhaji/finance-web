import { NextResponse } from 'next/server';
import { inngest } from '../../../../inngest/client';
import { verifyMetaSignature } from '../../../../lib/meta-security';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN || "satujalan_meta_aman_123";

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('FB Webhook Verified');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('x-hub-signature-256');
  const rawBody = await request.text();

  // 1. Verify Signature
  const isValid = verifyMetaSignature(rawBody, signature, process.env.META_APP_SECRET);
  if (!isValid) {
    console.error('Invalid signature on FB Webhook');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Parse payload
  const body = JSON.parse(rawBody);

  // 3. Process entries
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const pageId = entry.id;
      const webhookEvent = entry.messaging[0];
      
      const senderId = webhookEvent.sender.id;
      
      // Handle messages
      if (webhookEvent.message) {
        const messageId = webhookEvent.message.mid;
        const text = webhookEvent.message.text;
        const isEcho = webhookEvent.message.is_echo;

        // Push event to Inngest to be processed in the background
        await inngest.send({
          name: 'social.message.received',
          data: {
            platform: 'facebook',
            pageId,
            senderId,
            messageId,
            text,
            isEcho
          }
        });
      }
    }
    
    // Always return a 200 OK to Meta immediately
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } else {
    return new NextResponse('Not Found', { status: 404 });
  }
}
