import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan, santri } from "@/db/schema";
import { eq } from "drizzle-orm";
import { processAIResponse } from "@/server/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const normalizeWA = (num: string) => {
      if (!num) return "";
      let n = num.replace(/\D/g, "");
      if (n.startsWith("0")) n = "62" + n.substring(1);
      return n;
    };

    const sender = normalizeWA(body.sender || "");
    const message = body.message;

    if (!sender || !message) {
      return NextResponse.json({ success: false, reason: "Invalid payload" }, { status: 400 });
    }

    console.log(`[Webhook WA] Pesan masuk dari ${sender}: ${message}`);

    // Cek apakah pengirim adalah wali santri
    const santriData = await db.select().from(santri).where(eq(santri.no_wa, sender));
    
    // Dapatkan API Key dan pengaturan
    const settings = await db.select().from(pengaturan);
    const getSetting = (key: string) => settings.find(s => s.kunci === key)?.nilai || "";
    
    const waUrl = getSetting("wa_bot_url");
    const waToken = getSetting("wa_bot_token");
    const aiTargetReply = getSetting("ai_target_reply") || "all";
    
    // Cek privilege (Admin/Owner)
    const kepsekWa = normalizeWA(getSetting("KEPSEK_WA"));
    const adminWa = normalizeWA(getSetting("ADMIN_WA"));
    const isPrivileged = (kepsekWa && sender === kepsekWa) || 
                         (adminWa && sender === adminWa);

    if (aiTargetReply === "unsaved_only" && santriData.length > 0 && !isPrivileged) {
      console.log(`[Webhook WA] Mengabaikan pesan dari ${sender} karena nomor sudah tersimpan (Wali Santri).`);
      return NextResponse.json({ success: true, reply: null, reason: "Wali santri terdaftar, bot mengabaikan." });
    }
    
    // Panggil AI
    const aiResult = await processAIResponse(message, sender, santriData.length > 0 ? santriData[0] : null);
    const replyText = aiResult.text;
    const broadcasts = aiResult.broadcasts;
    
    // Kirim balasan ke WA Engine (opsional jika menggunakan API eksternal)
    if (waUrl && replyText) {
      await fetch(waUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(waToken ? { "Authorization": `Bearer ${waToken}` } : {})
        },
        body: JSON.stringify({
          phone: sender,
          message: replyText
        })
      }).catch(err => console.error("[Webhook WA] Gagal memanggil WA Engine:", err));
    }

    return NextResponse.json({ success: true, reply: replyText, broadcasts: broadcasts });
  } catch (error: any) {
    console.error("[Webhook WA] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
