import { NextResponse } from "next/server";
import { db } from "@/db";
import { santri, wa_messages } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { processAIResponse } from "@/server/ai";
import { pengaturan } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { tenant_id, no_wa, pesan, message_type, is_new_conversation, push_name, log_only, ai_reply } = await req.json();

    if (!tenant_id || !no_wa || !pesan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch follow up settings
    const settings = await db.select().from(pengaturan).where(
      and(
        eq(pengaturan.tenantId, tenant_id),
        inArray(pengaturan.kunci, ["follow_up_aktif", "follow_up_durasi_menit"])
      )
    );
    const config: Record<string, string> = {};
    settings.forEach(r => { config[r.kunci] = r.nilai; });
    const follow_up_aktif = config["follow_up_aktif"] === "true";
    const follow_up_durasi_menit = parseInt(config["follow_up_durasi_menit"] || "10", 10);

    // Simpan pesan dari User ke database
    try {
      await db.insert(wa_messages).values({
        tenantId: tenant_id,
        noWa: no_wa,
        pesan: pesan,
        pengirim: "USER"
      });
    } catch(e) { console.error("Gagal menyimpan log chat user", e); }

    let botReplyText = "";
    
    if (log_only) {
      // Jika log_only (dari Go bot yang sudah membalas secara mandiri), cukup log pesannya
      botReplyText = ai_reply || "";
      if (botReplyText) {
        try {
          await db.insert(wa_messages).values({
            tenantId: tenant_id,
            noWa: no_wa,
            pesan: botReplyText,
            pengirim: "BOT"
          });
        } catch(e) { console.error("Gagal menyimpan log chat bot (log_only)", e); }
      }
    } else {
      // Ambil data santri dan proses via AI
      const studentData = await db.query.santri.findFirst({
        where: and(eq(santri.tenantId, tenant_id), eq(santri.no_wa, no_wa))
      });

      const aiResult = await processAIResponse(pesan, no_wa, studentData || null, tenant_id, message_type || "", is_new_conversation || "true", push_name || "");
      botReplyText = aiResult.text || "";

      // Simpan pesan dari BOT ke database
      try {
        if (botReplyText) {
          await db.insert(wa_messages).values({
            tenantId: tenant_id,
            noWa: no_wa,
            pesan: botReplyText,
            pengirim: "BOT"
          });
        }
      } catch(e) { console.error("Gagal menyimpan log chat bot", e); }
      
      return NextResponse.json({ 
        reply: botReplyText,
        broadcasts: aiResult.broadcasts,
        media_url: aiResult.media_url,
        media_type: aiResult.media_type,
        follow_up_aktif,
        follow_up_durasi_menit
      });
    }

    return NextResponse.json({ 
      success: true,
      follow_up_aktif,
      follow_up_durasi_menit
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
