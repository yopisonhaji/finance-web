import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan, wa_messages } from "@/db/schema";
import { and, eq, inArray, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { tenant_id, no_wa } = await req.json();

    if (!tenant_id || !no_wa) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ambil pengaturan follow-up
    const settingsRows = await db.select().from(pengaturan).where(
      and(
        eq(pengaturan.tenantId, tenant_id),
        inArray(pengaturan.kunci, [
          "follow_up_aktif",
          "follow_up_tipe",
          "follow_up_durasi_menit",
          "follow_up_pesan",
          "deepseek_key",
          "ai_model",
          "nama_pesantren",
          "TIPE_BISNIS"
        ])
      )
    );

    const config: Record<string, string> = {};
    settingsRows.forEach(r => {
      config[r.kunci] = r.nilai;
    });

    if (config["follow_up_aktif"] !== "true") {
      return NextResponse.json({ success: false, reason: "Follow-up not active" });
    }

    const durasiMenit = parseInt(config["follow_up_durasi_menit"] || "10", 10);
    const tipe = config["follow_up_tipe"] || "ai"; // Default AI
    const manualPesan = config["follow_up_pesan"] || "Halo Kak, apakah ada pertanyaan lebih lanjut?";

    let finalPesan = manualPesan;

    if (tipe !== "manual") {
      // Ambil riwayat chat (misal 15 pesan terakhir)
      try {
        const history = await db.select().from(wa_messages)
          .where(and(eq(wa_messages.tenantId, tenant_id), eq(wa_messages.noWa, no_wa)))
          .orderBy(desc(wa_messages.id))
          .limit(15);
        
        if (history.length > 0) {
          // Urutkan kembali secara kronologis (ascending)
          history.reverse();
          
          const chatLog = history.map(h => `${h.pengirim}: ${h.pesan}`).join("\n");
          const aiKey = config["deepseek_key"];
          
          if (aiKey) {
            const prompt = `Anda adalah asisten AI dari ${config["nama_pesantren"] || "Perusahaan kami"} yang bertugas mem-follow up pelanggan yang tidak merespon selama ${durasiMenit} menit terakhir.
Tugas Anda:
1. Baca riwayat percakapan di bawah ini.
2. Rangkum inti ketertarikan/kebutuhan pelanggan.
3. Buatkan 1-2 kalimat sapaan (follow up) yang luwes, sangat persuasif, sopan, dan memancing mereka untuk segera membalas / melanjutkan percakapan.
4. JANGAN gunakan tag HTML, Markdown, XML, atau apapun. HANYA TEKS BIASA.

Riwayat Percakapan:
${chatLog}

Kalimat Follow-Up Anda (HANYA teks akhir yang akan dikirim ke pelanggan):`;

            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${aiKey}`
              },
              body: JSON.stringify({
                model: config["ai_model"] || "deepseek-chat",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 150
              })
            });

            const data = await response.json();
            if (data.choices?.[0]?.message?.content) {
              const generated = data.choices[0].message.content.trim();
              if (generated.length > 5) {
                finalPesan = generated;
              }
            }
          }
        }
      } catch (err) {
        console.error("AI Follow-up error:", err);
      }
    }

    // Jangan kirim ke bot_url, biarkan Go-Bot membaca respon JSON ini dan mengirimnya secara native
    return NextResponse.json({ 
      success: true, 
      pesan: finalPesan 
    });

  } catch (error) {
    console.error("Trigger Follow-Up Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
