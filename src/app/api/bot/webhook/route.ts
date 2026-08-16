import { NextResponse } from "next/server";
import { db } from "@/db";
import { santri, wa_messages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { processAIResponse } from "@/server/ai";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { tenant_id, no_wa, pesan, message_type, is_new_conversation, push_name } = await req.json();

    if (!tenant_id || !no_wa || !pesan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Trigger event bahwa ada pesan masuk (untuk membatalkan auto follow-up jika ada)
    try {
      await inngest.send({
        name: "wa/webhook.received",
        data: { tenantId: tenant_id, noWa: no_wa }
      });
    } catch(e) { console.error("Gagal trigger inngest", e); }

    // Simpan pesan dari User ke database
    try {
      await db.insert(wa_messages).values({
        tenantId: tenant_id,
        noWa: no_wa,
        pesan: pesan,
        pengirim: "USER"
      });
    } catch(e) { console.error("Gagal menyimpan log chat user", e); }

    // Ambil data santri
    const studentData = await db.query.santri.findFirst({
      where: and(eq(santri.tenantId, tenant_id), eq(santri.no_wa, no_wa))
    });

    const aiResult = await processAIResponse(pesan, no_wa, studentData || null, tenant_id, message_type || "", is_new_conversation || "true", push_name || "");

    // Simpan pesan dari BOT ke database
    try {
      if (aiResult.text) {
        await db.insert(wa_messages).values({
          tenantId: tenant_id,
          noWa: no_wa,
          pesan: aiResult.text,
          pengirim: "BOT"
        });
      }
    } catch(e) { console.error("Gagal menyimpan log chat bot", e); }

    // Jadwalkan auto follow-up ke Inngest
    try {
      await inngest.send({
        name: "wa/schedule.follow_up",
        data: {
          tenantId: tenant_id,
          noWa: no_wa,
          lastMessageTime: Date.now()
        }
      });
    } catch(e) { console.error("Gagal menjadwalkan Inngest", e); }

    return NextResponse.json({ 
      reply: aiResult.text,
      broadcasts: aiResult.broadcasts,
      media_url: aiResult.media_url,
      media_type: aiResult.media_type
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ reply: "Maaf, terjadi kesalahan internal sistem." });
  }
}


