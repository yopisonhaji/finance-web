import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan, santri } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
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

    // Coba cari tenantId berdasarkan pengirim
    let tenantId = null;

    // 1. Coba cari di pengaturan (Apakah ini Owner/Kepsek/Admin?)
    const adminData = await db.select().from(pengaturan).where(
      and(
        or(eq(pengaturan.kunci, "OWNER_WA"), eq(pengaturan.kunci, "ADMIN_WA"), eq(pengaturan.kunci, "KEPSEK_WA")),
        eq(pengaturan.nilai, sender)
      )
    );
    if (adminData.length > 0) {
      tenantId = adminData[0].tenantId;
    }

    // 2. Coba cari di tabel santri (Apakah ini Wali Santri?)
    let santriData: any[] = [];
    if (!tenantId) {
      santriData = await db.select().from(santri).where(eq(santri.no_wa, sender));
      if (santriData.length > 0) {
        tenantId = santriData[0].tenantId;
      }
    } else {
      santriData = await db.select().from(santri).where(and(eq(santri.no_wa, sender), eq(santri.tenantId, tenantId)));
    }

    if (!tenantId) {
       console.log(`[Webhook WA] Mengabaikan pesan dari ${sender} karena tidak ditemukan di tenant manapun.`);
       return NextResponse.json({ success: true, reply: null, reason: "Nomor tidak terdaftar di sistem." });
    }

    // Dapatkan API Key dan pengaturan khusus untuk tenant ini
    const settings = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, tenantId));
    const getSetting = (key: string) => settings.find(s => s.kunci === key)?.nilai || "";
    
    const waUrl = getSetting("wa_bot_url");
    const waToken = getSetting("wa_bot_token");
    const aiTargetReply = getSetting("ai_target_reply") || "all";
    
    // Cek privilege (Admin/Owner)
    const kepsekWa = normalizeWA(getSetting("KEPSEK_WA") || getSetting("OWNER_WA"));
    const adminWa = normalizeWA(getSetting("ADMIN_WA"));
    const isPrivileged = (kepsekWa && sender === kepsekWa) || 
                         (adminWa && sender === adminWa);

    if (aiTargetReply === "unsaved_only" && santriData.length > 0 && !isPrivileged) {
      console.log(`[Webhook WA] Mengabaikan pesan dari ${sender} karena nomor sudah tersimpan (Wali Santri).`);
      return NextResponse.json({ success: true, reply: null, reason: "Wali santri terdaftar, bot mengabaikan." });
    }
    
    // Panggil AI
    const aiResult = await processAIResponse(message, sender, santriData.length > 0 ? santriData[0] : null, tenantId);
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

    return NextResponse.json({ 
      success: true, 
      reply: replyText, 
      broadcasts: broadcasts,
      media_url: aiResult.media_url,
      media_type: aiResult.media_type
    });
  } catch (error: any) {
    console.error("[Webhook WA] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
