import { NextResponse } from "next/server";
import { db } from "@/db";
import { santri, pengaturan } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { tenant_id, no_wa, pesan } = await req.json();

    if (!tenant_id || !no_wa || !pesan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ambil setting TARGET_BALASAN
    const targetReplySetting = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.tenantId, tenant_id), eq(pengaturan.kunci, "TARGET_BALASAN"))
    });
    const targetReply = targetReplySetting?.nilai || "";

    // Ambil data santri
    const student = await db.query.santri.findFirst({
      where: and(eq(santri.tenantId, tenant_id), eq(santri.no_wa, no_wa))
    });

    let contextString = "";
    if (!student) {
      if (targetReply === "HANYA_WALI") {
        // Jangan balas jika bukan wali santri
        return NextResponse.json({ reply: "" });
      }
      contextString = "Pengirim ini BUKAN pengguna/klien yang terdaftar. Jawab secara umum.";
    } else {
      contextString = `Data Pengirim:\nNama: ${student.nama}\nNIS/ID: ${student.nis}\nKelas/Layanan: ${student.kelas || '-'}\nNama Wali/PJ: ${student.nama_wali || '-'}\nSisa Tagihan: Rp${student.saldo || 0}\n`;
    }

    // Ambil SYSTEM_PROMPT
    const systemPromptSetting = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.tenantId, tenant_id), eq(pengaturan.kunci, "SYSTEM_PROMPT"))
    });
    const systemPrompt = systemPromptSetting?.nilai || "Kamu adalah asisten virtual.";

    // Ambil nama pesantren
    const namaSekolahSetting = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.tenantId, tenant_id), eq(pengaturan.kunci, "nama_pesantren"))
    });
    const namaSekolah = namaSekolahSetting?.nilai || "";

    const fullPrompt = `Instruksi Utama: ${systemPrompt}\nNama Lembaga: ${namaSekolah}\n\n${contextString}`;

    // Ambil DEEPSEEK_API_KEY
    let apiKey = process.env.DEEPSEEK_API_KEY;
    const keySetting = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.tenantId, tenant_id), eq(pengaturan.kunci, "DEEPSEEK_API_KEY"))
    });
    if (keySetting?.nilai) {
      apiKey = keySetting.nilai;
    }

    if (!apiKey) {
      return NextResponse.json({ reply: "Maaf, kunci API AI belum dikonfigurasi. Hubungi Admin." });
    }

    // Panggil DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: fullPrompt },
          { role: "user", content: pesan }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Deepseek API Error:", errData);
      return NextResponse.json({ reply: "Maaf, sistem AI sedang sibuk atau mengalami gangguan." });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "Maaf, tidak ada balasan dari AI.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ reply: "Maaf, terjadi kesalahan internal sistem." });
  }
}
