import { inngest } from "./client";
import { db } from "@/db";
import { pengaturan, wa_messages } from "@/db/schema";
import { and, eq, inArray, desc } from "drizzle-orm";

export const scheduleFollowUp = inngest.createFunction(
  { id: "wa-schedule-follow-up", name: "WhatsApp Auto Follow-Up", triggers: [{ event: "wa/schedule.follow_up" }] },
  async ({ event, step }) => {
    const { tenantId, noWa } = event.data;

    // 1. Ambil pengaturan follow-up
    const settings = await step.run("fetch-settings", async () => {
      const rows = await db.select().from(pengaturan).where(
        and(
          eq(pengaturan.tenantId, tenantId),
          inArray(pengaturan.kunci, [
            "follow_up_aktif",
            "follow_up_tipe",
            "follow_up_durasi_menit",
            "follow_up_pesan",
            "wa_bot_url",
            "wa_bot_token",
            "deepseek_key",
            "ai_model"
          ])
        )
      );

      const config: Record<string, string> = {};
      rows.forEach(r => {
        config[r.kunci] = r.nilai;
      });
      return config;
    });

    if (settings.follow_up_aktif !== "true") {
      return { skipped: true, reason: "Follow-up not active" };
    }

    const durasiMenit = parseInt(settings.follow_up_durasi_menit || "10", 10);
    const tipe = settings.follow_up_tipe || "ai"; // Default AI jika tidak ada
    const manualPesan = settings.follow_up_pesan || "Halo Kak, apakah ada pertanyaan lebih lanjut?";

    // 2. Tunggu selama durasi ATAU sampai ada pesan baru dari user
    const replyEvent = await step.waitForEvent("wait-for-reply", {
      event: "wa/webhook.received",
      timeout: `${durasiMenit}m`,
      match: "data.noWa",
    });

    // 3. Jika replyEvent ADA, berarti user membalas sebelum durasi habis -> Batal Follow Up
    if (replyEvent !== null) {
      return { skipped: true, reason: "User replied before timeout" };
    }

    // 4. Siapkan pesan Follow-Up
    const finalPesan = await step.run("generate-follow-up-message", async () => {
      if (tipe === "manual") {
        return manualPesan;
      }

      // Jika AI, ambil riwayat chat (misal 15 pesan terakhir)
      try {
        const history = await db.select().from(wa_messages)
          .where(and(eq(wa_messages.tenantId, tenantId), eq(wa_messages.noWa, noWa)))
          .orderBy(desc(wa_messages.id))
          .limit(15);
        
        if (history.length === 0) return manualPesan;

        // Urutkan kembali secara kronologis (ascending)
        history.reverse();
        
        const chatLog = history.map(h => `${h.pengirim}: ${h.pesan}`).join("\n");
        const aiKey = settings.deepseek_key;
        if (!aiKey) return manualPesan; // Fallback jika tidak ada API key

        const prompt = `Anda adalah asisten AI yang bertugas mem-follow up pelanggan yang tidak merespon selama ${durasiMenit} menit terakhir.
Tugas Anda:
1. Baca riwayat percakapan di bawah ini.
2. Rangkum inti ketertarikan/kebutuhan pelanggan.
3. Buatkan 1-2 kalimat sapaan (follow up) yang persuasif, sopan, dan mengundang mereka untuk melanjutkan pendaftaran/pembelian atau bertanya lebih lanjut.
4. JANGAN gunakan tag HTML, Markdown, XML, atau apapun. HANYA TEKS BIASA.

Riwayat Percakapan:
${chatLog}

Kalimat Follow-Up Anda (HANYA teks yang akan dikirim ke user):`;

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${aiKey}`
          },
          body: JSON.stringify({
            model: settings.ai_model || "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          const generated = data.choices[0].message.content.trim();
          if (generated.length > 5) return generated;
        }
      } catch (err) {
        console.error("AI Follow-up error:", err);
      }

      return manualPesan; // Fallback
    });

    // 5. Kirim pesan Follow-Up
    const result = await step.run("send-follow-up", async () => {
      const botUrl = settings.wa_bot_url || process.env.NEXT_PUBLIC_BOT_URL;
      if (!botUrl) return { success: false, error: "No bot URL configured" };
      
      const normalizedBotUrl = botUrl.replace(/\/+$/, "");
      const res = await fetch(`${normalizedBotUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.BOT_API_SECRET}` 
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          no_wa: noWa,
          pesan: finalPesan,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gagal mengirim follow up: ${text}`);
      }
      return await res.json();
    });

    return { success: true, result };
  }
);
