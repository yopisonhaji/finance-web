import { inngest } from "./client";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { social_connections, meta_messages, meta_customers } from "../db/schema";

export const processMetaMessage = inngest.createFunction(
  { id: "process-meta-message", name: "Process Meta Message", triggers: [{ event: "social.message.received" }] },
  async ({ event, step }) => {
    const { platform, pageId, senderId, messageId, text, isEcho } = event.data;

    // 1. Find tenant_id via pageId
    const connection = await step.run("find-tenant", async () => {
      const result = await db.select().from(social_connections).where(eq(social_connections.pageId, pageId)).limit(1);
      return result.length > 0 ? result[0] : null;
    });

    if (!connection) {
      console.warn(`No active tenant found for pageId: ${pageId}`);
      return { status: "ignored", reason: "no_tenant_found" };
    }

    const tenantId = connection.tenantId;

    // 2. Idempotency Check
    const isDuplicate = await step.run("check-idempotency", async () => {
      const existing = await db.select().from(meta_messages).where(eq(meta_messages.messageId, messageId)).limit(1);
      return existing.length > 0;
    });

    if (isDuplicate) {
      return { status: "ignored", reason: "duplicate_message" };
    }

    // 3. Save incoming message
    await step.run("save-message", async () => {
      await db.insert(meta_messages).values({
        messageId,
        tenantId,
        platform,
        senderId,
        text,
        isEcho: isEcho ? 1 : 0
      });
      
      if (!isEcho) {
          // Update last customer reply time for 24-hour rule
          const existingCustomer = await db.select().from(meta_customers).where(eq(meta_customers.psid, senderId)).limit(1);
          if (existingCustomer.length > 0) {
              await db.update(meta_customers).set({ lastReplyAt: new Date().toISOString() }).where(eq(meta_customers.psid, senderId));
          } else {
              await db.insert(meta_customers).values({
                  tenantId,
                  platform,
                  psid: senderId,
                  lastReplyAt: new Date().toISOString()
              });
          }
      }
    });

    // 4. If it's an echo (message sent by our page), stop here
    if (isEcho) {
        return { status: "success", reason: "echo_saved" };
    }

    // 5. Call AI (Mocked for now - requires specific AI implementation per tenant)
    const aiResponse = await step.run("call-ai", async () => {
      // TODO: Replace with actual Gemini/ChatGPT call using tenant context
      return `Halo! Pesan Anda telah diterima oleh AI Vercel. Kami sedang memproses permintaan Anda... (Tenant: ${tenantId})`;
    });

    // 6. Send Reply via Meta Graph API
    await step.run("send-reply", async () => {
        const url = `https://graph.facebook.com/v19.0/${pageId}/messages?access_token=${connection.accessToken}`;
        const body = {
            recipient: { id: senderId },
            message: { text: aiResponse }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Meta API Error: ${errorText}`);
        }
        
        return await response.json();
    });

    return { status: "success", message: "Replied to customer" };
  }
);
