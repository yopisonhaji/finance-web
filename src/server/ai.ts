"use server";



import { db } from "@/db";
import { pengaturan, santri, media_ai } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePaymentLink } from "./ipaymu";

export async function processAIResponse(message: string, sender: string, santriData: any, tenantId: string, messageType: string = "", isNewConversation: string = "true", pushName: string = ""): Promise<{text: string, broadcasts?: any[], media_url?: string, media_type?: string}> {
  if (!tenantId) return { text: "Error: Tenant ID is missing" };
  const settings = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, tenantId));
  const getSetting = (key: string) => settings.find(s => s.kunci === key)?.nilai || "";
  
  const aiKey = getSetting("deepseek_key");
  const aiPrompt = getSetting("ai_prompt") || "Anda adalah asisten pesantren yang ramah.";
  const pesantrenName = getSetting("nama_pesantren") || "Pesantren";
  const tipeBisnis = getSetting("TIPE_BISNIS") || "PENDIDIKAN";
  const isPendidikan = tipeBisnis === "PENDIDIKAN";
  const clientTerm = isPendidikan ? "siswa/santri" : "karyawan/pelanggan";
  const parentTerm = isPendidikan ? "wali santri" : "pelanggan/klien";
  
  if (!aiKey) {
    return { text: "Mohon maaf, sistem AI saat ini belum diaktifkan oleh admin." };
  }

  const tokenLimitStr = getSetting("limit_token");
  const tokenUsageStr = getSetting("usage_token");
  const tokenLimit = parseInt(tokenLimitStr) || 0;
  let tokenUsage = parseInt(tokenUsageStr) || 0;

  if (tokenLimit > 0 && tokenUsage >= tokenLimit) {
    console.log(`[AI] Token habis (${tokenUsage}/${tokenLimit}). Mengabaikan pesan dari ${sender}.`);
    return { text: "" };
  }

  const normalizeWA = (num: string) => {
    if (!num) return "";
    let n = num.replace(/\D/g, "");
    if (n.startsWith("0")) n = "62" + n.substring(1);
    return n;
  };

  const kepsekWa = normalizeWA(getSetting("KEPSEK_WA"));
  const adminWa = normalizeWA(getSetting("ADMIN_WA"));
  const normalizedSender = normalizeWA(sender);
  const isKepsek = kepsekWa && normalizedSender === kepsekWa;
  const isAdmin = adminWa && normalizedSender === adminWa;
  const isPrivileged = isKepsek || isAdmin;
  
  let responseMediaUrl = "";
  let responseMediaType = "";

  try {
    const fs = require('fs');
    const path = require('path');
    fs.appendFileSync(path.join(process.cwd(), 'debug-ai.txt'), `Sender: ${sender} | normSender: ${normalizedSender} | kepsek: ${kepsekWa} | isPrivileged: ${isPrivileged}\n`);
  } catch(e) {}

  let systemPrompt = "";

  if (isPrivileged) {
    systemPrompt = `Anda adalah asisten/admin bagian Keuangan di ${pesantrenName}.
Tugas Anda melayani admin terkait informasi pembayaran tagihan dan data ${clientTerm}.

[PENTING - AKSES KHUSUS]
Pengguna yang sedang chat dengan Anda saat ini adalah ${isKepsek ? 'PIMPINAN/OWNER' : 'ADMINISTRATOR'}.
Mereka adalah atasan Anda.
Bantu mereka mengelola data dengan memanggil tools yang tersedia.

Fungsi utama Anda untuk admin:
1. 📊 *Cek Rekap Pemasukan Bulanan / Tunggakan*
2. 📉 *Cek Rekap ${clientTerm} Menunggak*
3. ➕ *Tambah Data ${clientTerm} Baru*
4. 📢 *Kirim Broadcast Tagihan*

Jika mereka meminta Tambah Data, panggil tool 'tambah_santri_baru'. Jangan ragu memanggil tool!
Jika mereka menanyakan detail data spesifik seseorang, panggil tool 'cari_data_santri'.

[ATURAN SANGAT PENTING UNTUK ADMIN]:
JIKA admin memberikan perintah untuk menagih (contoh: "Tagih sekarang", "Kirim pengingat ke Ahmad"), ANDA WAJIB LANGSUNG MEMANGGIL TOOL 'kirim_broadcast_tagihan' TANPA BERTANYA ATAU MEMINTA KONFIRMASI LAGI. Langsung eksekusi perintahnya detik itu juga!
DILARANG KERAS bertanya "Apakah saya harus mengirimkannya?" atau "Apakah Anda yakin?". Langsung panggil tool yang relevan!
Setelah tool berhasil dieksekusi, berikan laporan singkat bahwa tugas telah selesai dilaksanakan.`;
  } else if (santriData) {
    systemPrompt = `Anda adalah asisten/admin bagian Keuangan di ${pesantrenName}.
Tugas Anda melayani ${parentTerm} terkait informasi tagihan pembayaran mereka.

Konteks: Pengirim pesan adalah ${parentTerm} bernama ${santriData.nama_wali} (Nomor WA: ${sender}).
Mereka mewakili ${clientTerm} bernama ${santriData.nama} (ID: ${santriData.nis}, Grup/Kelas: ${santriData.kelas}).
Status Tagihan bulan ini: ${santriData.status_bulan_ini === 'LUNAS' ? 'SUDAH LUNAS' : 'BELUM BAYAR (TUNGGAKAN)'}.
`;
  } else {
    systemPrompt = `${aiPrompt}\n\n`;
  }

  systemPrompt += `\n\nATURAN MUTLAK TAMBAHAN (WAJIB DIPATUHI):\n`;
  
  // Aturan sapaan berdasarkan konteks percakapan
  const displayName = pushName && pushName !== sender ? pushName : (santriData?.nama_wali || santriData?.nama || "Bapak/Ibu");
  
  if (isNewConversation === "true") {
    systemPrompt += `[KONTEKS: Ini adalah AWAL percakapan baru (sudah >1 jam sejak chat terakhir).]\n`;
    systemPrompt += `[INFO: Nama kontak pengirim adalah "${pushName}". Gunakan nama ini untuk menyapa jika tersedia dan bukan angka.]\n`;
    systemPrompt += `1. Jika pengguna mengucapkan salam Islam, balas dengan "Wa'alaikumussalam" lalu tawarkan bantuan.\n`;
    systemPrompt += `2. Jika pengguna langsung bertanya, sapa singkat dengan "Halo ${pushName && pushName !== sender ? pushName : 'Bapak/Ibu'}" lalu LANGSUNG jawab.\n`;
  } else {
    systemPrompt += `[KONTEKS: Ini adalah LANJUTAN percakapan (masih dalam 1 jam terakhir).]\n`;
    systemPrompt += `[INFO: Nama kontak pengirim adalah "${pushName}".]\n`;
    systemPrompt += `1. DILARANG KERAS menyapa ulang! JANGAN ucapkan "Halo", "Wa'alaikumussalam", atau salam pembuka apapun.\n`;
    systemPrompt += `2. LANGSUNG JAWAB pertanyaan. Singkat, padat, to-the-point.\n`;
    systemPrompt += `3. Boleh menyebut nama "${pushName && pushName !== sender ? pushName : ''}" sesekali jika natural, tapi jangan berlebihan.\n`;
  }
  
  systemPrompt += `\nATURAN UMUM:\n`;
  systemPrompt += `- Jawablah TEPAT SESUAI APA YANG DITANYAKAN. Jangan bertele-tele.\n`;
  systemPrompt += `- Jika pengguna MEMINTA dikirimkan gambar/brosur/file tertentu (misal: "kirim gambar brosur", "bisa kirim qwqwqw?", "minta fotonya"), ANDA WAJIB memanggil tool 'cek_daftar_media' lalu 'kirim_media' dengan ID yang sesuai. JANGAN hanya bilang "saya sudah lihat" — KIRIMKAN FILENYA!\n`;
  systemPrompt += `- GAYA BAHASA: Singkat, padat, jelas, to-the-point.\n`;
  systemPrompt += `- Jika ${parentTerm} membalas dengan angka (1=QRIS, 2=Virtual Account, 3=Indomaret/Alfamart), WAJIB panggil tool 'buat_link_pembayaran_ipaymu'.\n`;
  systemPrompt += `- Jika pengguna mengirim [Sticker]/[Gambar]/[Video] dll, responlah dengan ramah dan tawarkan bantuan.\n`;
  if (messageType) {
    systemPrompt += `\n[INFO: Pengguna baru saja mengirim ${messageType}. Responlah dengan natural sesuai konteks.]\n`;
  }

  const tools = [];

  if (isPrivileged) {
    tools.push(
      {
        type: "function",
        function: {
          name: "get_rekap_keuangan",
          description: `Mendapatkan ringkasan keuangan (total saldo pemasukan) dan rekap jumlah serta DAFTAR NAMA ${clientTerm} yang menunggak.`,
          parameters: { type: "object", properties: {}, required: [] }
        }
      },
      {
        type: "function",
        function: {
          name: "tambah_santri_baru",
          description: `Mendaftarkan ${clientTerm} baru. JANGAN PANGGIL TOOL INI JIKA DATA BELUM LENGKAP. Jika user hanya memberikan nama, Anda WAJIB bertanya balik untuk melengkapi: ID/NIS, Grup/Kelas, Nama Wali, No WA Wali, dan Nominal Tagihan Bulanan.`,
          parameters: {
            type: "object",
            properties: {
              nama: { type: "string", description: `Nama lengkap ${clientTerm}` },
              nis: { type: "string", description: `Nomor ID/NIS, wajib unik` },
              kelas: { type: "string", description: `Kelas/Grup/Divisi ${clientTerm}` },
              nama_wali: { type: "string", description: `Nama orang tua/wali atau pic` },
              no_wa: { type: "string", description: `Nomor WhatsApp PIC (harus awalan 62)` },
              nominal_spp: { type: "number", description: `Nominal tagihan rutin bulanan (angka saja)` }
            },
            required: ["nama", "nis", "kelas", "nama_wali", "no_wa", "nominal_spp"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "kirim_broadcast_tagihan",
          description: `Mengirimkan pesan pengingat tagihan ke nomor ${parentTerm}. Bisa ditujukan ke 'semua' yang menunggak atau ke ID/Nama tertentu.`,
          parameters: {
            type: "object",
            properties: {
              target: { type: "string", description: `Isi dengan 'semua' untuk mengirim ke seluruh penunggak, atau isi dengan ID/Nama ${clientTerm} tertentu.` },
              pesan: { type: "string", description: "Isi pesan broadcast opsional. Kosongkan jika ingin pakai template." }
            },
            required: ["target"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "cari_data_santri",
          description: `Mencari data lengkap seorang ${clientTerm} berdasarkan nama atau ID. Gunakan ini jika Admin menanyakan data spesifik (termasuk nomor WA wali, status tagihan, dll).`,
          parameters: {
            type: "object",
            properties: {
              keyword: { type: "string", description: `Nama atau ID ${clientTerm} yang ingin dicari.` }
            },
            required: ["keyword"]
          }
        }
      }
    );
  }

  tools.push({
    type: "function",
    function: {
      name: "buat_link_pembayaran_ipaymu",
      description: `Membuat link pembayaran instan melalui iPaymu untuk ${clientTerm} terkait.`,
      parameters: { 
        type: "object", 
        properties: {
          metode: { type: "string", description: "Metode pembayaran yang dipilih. Contoh: 'qris', 'va', atau 'cstore'." }
        }, 
        required: [] 
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cek_daftar_media",
      description: `Melihat daftar media (brosur, gambar produk, file PDF) yang tersedia di database dan bisa dikirimkan ke pelanggan. WAJIB dipanggil jika user meminta gambar/brosur/file tapi Anda tidak tahu ID-nya.`,
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "kirim_media",
      description: `MENGIRIMKAN file media (brosur/gambar/dokumen) ke pelanggan saat ini. WAJIB DIPANGGIL jika user meminta dikirimkan gambar/file/brosur tertentu yang ADA di daftar media. Gunakan ID dari hasil cek_daftar_media.`,
      parameters: {
        type: "object",
        properties: {
          media_id: { type: "number", description: "ID media yang ingin dikirim (dari hasil cek_daftar_media)" }
        },
        required: ["media_id"]
      }
    }
  });

  async function updateUsage(usedTokens: number) {
    tokenUsage += usedTokens;
    const existing = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, 'usage_token'), eq(pengaturan.tenantId, tenantId)));
    if (existing.length > 0) {
      await db.update(pengaturan).set({ nilai: String(tokenUsage) }).where(and(eq(pengaturan.kunci, 'usage_token'), eq(pengaturan.tenantId, tenantId)));
    } else {
      await db.insert(pengaturan).values({ tenantId: tenantId, kunci: 'usage_token', nilai: String(tokenUsage) });
    }
  }

  try {
    const broadcasts: any[] = [];
    let messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${aiKey}`
      },
      body: JSON.stringify({
          model: getSetting("deepseek_model") || "deepseek-chat",
        messages,
        temperature: 0.3,
        ...(tools ? { tools, tool_choice: "auto" } : {})
      })
    });

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      console.error("[AI] DeepSeek API returned an error:", JSON.stringify(data, null, 2));
      return { text: "Maaf, mesin AI sedang sibuk. Silakan coba lagi nanti." };
    }

    // Update token usage (gunakan >= 0 check, bukan falsy check)
    if (data.usage && typeof data.usage.total_tokens === 'number') {
      await updateUsage(data.usage.total_tokens);
      console.log(`[AI] Token usage updated: +${data.usage.total_tokens} (total sekarang: ${tokenUsage + data.usage.total_tokens})`);
    } else {
      console.log("[AI] WARNING: Tidak ada data usage.token dari DeepSeek. Response keys:", Object.keys(data));
    }

    const responseMessage = data.choices[0].message;

    if (responseMessage.tool_calls) {
      messages.push(responseMessage);
      
      for (const toolCall of responseMessage.tool_calls) {
        let args = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch(e) {}
        
        let toolResult = "";
        
        if (toolCall.function.name === "get_rekap_keuangan") {
          const allSantri = await db.select().from(santri).where(eq(santri.tenantId, tenantId));
          const totalSaldo = allSantri.reduce((acc, s) => acc + (s.saldo || 0), 0);
          const santriNunggak = allSantri.filter(s => s.status_bulan_ini === 'BELUM_BAYAR');
          const nunggakCount = santriNunggak.length;
          const limitNunggak = santriNunggak.slice(0, 15);
          let detailNunggak = limitNunggak.map(s => `- ${s.nama} (Rp ${s.nominal_spp?.toLocaleString('id-ID')})`).join('\n');
          if (nunggakCount > 15) detailNunggak += ` ... dan ${nunggakCount - 15} ${clientTerm} lainnya.`;
          
          toolResult = JSON.stringify({ 
            total_uang_masuk_bulan_ini: totalSaldo, 
            jumlah_yang_nunggak: nunggakCount,
            daftar_yang_nunggak_beserta_nominal: detailNunggak || "Tidak ada",
            total_seluruh_data: allSantri.length,
            catatan_penting_untuk_ai: "Data tunggakan ini HANYA UNTUK 1 BULAN BERJALAN (bulan ini saja) karena sistem baru. JANGAN PERNAH mengarang/menyebut menunggak 2 atau 3 bulan. Pastikan menyebutkan nominal tagihan masing-masing."
          });
        } 
        else if (toolCall.function.name === "tambah_santri_baru") {
          const { nama, nis, kelas, nama_wali, no_wa, nominal_spp } = args as any;
          try {
            await db.insert(santri).values({
              tenantId: tenantId,
              nama: nama,
              nis: nis,
              kelas: kelas || "",
              nama_wali: nama_wali || "",
              no_wa: no_wa || "",
              saldo: 0,
              nominal_spp: Number(nominal_spp) || 0,
              status_bulan_ini: "BELUM_BAYAR"
            });
            toolResult = JSON.stringify({ success: true, message: `Berhasil menyimpan data santri baru dengan NIS ${nis}` });
          } catch (err: any) {
            toolResult = JSON.stringify({ success: false, error: err.message, note: "Mungkin NIS sudah ada di database." });
          }
        }
        else if (toolCall.function.name === "cari_data_santri") {
          const { keyword } = args as any;
          try {
            const allSantri = await db.select().from(santri).where(eq(santri.tenantId, tenantId));
            const found = allSantri.filter(s => 
              s.nama.toLowerCase().includes((keyword || "").toLowerCase()) || 
              s.nis === keyword
            );
            
            
            if (found.length > 0) {
              const limitFound = found.slice(0, 5);
              let details = limitFound.map(s => `Nama: ${s.nama}, NIS: ${s.nis}, Kelas: ${s.kelas}, Wali: ${s.nama_wali}, No WA Wali: ${s.no_wa || "Kosong/Tidak Ada"}, Tagihan SPP: Rp${s.nominal_spp}, Status Bulan Ini: ${s.status_bulan_ini}`).join("\n---\n");
              if (found.length > 5) details += `\n\n(Ada ${found.length - 5} santri lain yang mirip, mohon gunakan nama/NIS yang lebih spesifik jika data yang dicari belum muncul)`;
              toolResult = JSON.stringify({ success: true, data: details });
            } else {
              toolResult = JSON.stringify({ success: false, message: `Tidak ditemukan santri dengan kata kunci: ${keyword}` });
            }
          } catch(err: any) {
            toolResult = JSON.stringify({ success: false, error: err.message });
          }
        }
        else if (toolCall.function.name === "kirim_broadcast_tagihan") {
          const { target, pesan_tambahan } = args as any;
          try {
            let targetSantri = [];
            if (target.toLowerCase() === "semua") {
              targetSantri = await db.select().from(santri).where(and(eq(santri.status_bulan_ini, "BELUM_BAYAR"), eq(santri.tenantId, tenantId)));
            } else {
              targetSantri = await db.select().from(santri).where(and(eq(santri.status_bulan_ini, "BELUM_BAYAR"), eq(santri.tenantId, tenantId)));
              targetSantri = targetSantri.filter(s => s.nama.toLowerCase().includes(target.toLowerCase()) || s.nis === target);
            }
            
            for (const s of targetSantri) {
              if (s.no_wa) {
                let text = `Assalamu'alaikum Bapak/Ibu Wali dari *${s.nama}*.\n\nTagihan SPP bulan ini sebesar *Rp ${s.nominal_spp?.toLocaleString('id-ID')}* belum lunas.\n\nSilakan pilih metode pembayaran dengan membalas angka:\n1️⃣ QRIS\n2️⃣ Virtual Account Bank (BSI/BNI/BRI dll)\n3️⃣ Indomaret/Alfamart\n\nBalas angka pilihan Anda untuk mendapatkan kode/link pembayaran otomatis. 🙏`;
                if (pesan_tambahan) text += `\n\n📌 *Pesan Admin:*\n_${pesan_tambahan}_`;
                broadcasts.push({ to: s.no_wa, text });
              }
            }
            toolResult = JSON.stringify({ success: true, message: `Berhasil menyiapkan ${broadcasts.length} pesan pengingat untuk dikirim.` });
          } catch(err: any) {
            toolResult = JSON.stringify({ success: false, error: err.message });
          }
        }
        else if (toolCall.function.name === "buat_link_pembayaran_ipaymu") {
          let orderId: string = "";
          let amount: number = 0;
          let customer: { name: string, phone: string } = { name: "", phone: "" };
          let canGenerate = true;
          
          if (isPrivileged && !santriData) {
            orderId = `TEST-ADMIN-${Date.now()}`;
            amount = 10000;
            customer = { name: "Bapak Admin (Testing)", phone: sender };
          } else if (!santriData) {
            toolResult = JSON.stringify({ success: false, error: "Maaf, nomor Anda belum terdaftar di sistem kami sebagai wali santri. Silakan hubungi admin." });
            canGenerate = false;
          } else if (santriData.status_bulan_ini === "LUNAS") {
            toolResult = JSON.stringify({ success: false, error: "SPP Ananda bulan ini sudah tercatat LUNAS. Tidak perlu melakukan pembayaran." });
            canGenerate = false;
          } else {
            orderId = `SPP-${santriData.nis}-${Date.now()}`;
            amount = santriData.nominal_spp || 0;
            customer = { name: santriData.nama_wali || "Wali Santri", phone: sender };
          }

          if (canGenerate) {
            const { metode } = args as any;
            // Validate metode parameter
            let paymentMethod: string | undefined = undefined;
            if (metode) {
              const m = metode.toString().toLowerCase();
              if (m === '1' || m === 'qris') paymentMethod = 'qris';
              else if (m === '2' || m === 'va') paymentMethod = 'va';
              else if (m === '3' || m === 'cstore' || m.includes('indo')) paymentMethod = 'cstore';
            }

            const linkRes = await generatePaymentLink(santriData.id, amount, customer, paymentMethod, tenantId);
            if (linkRes.success) {
              if (linkRes.directData) {
                 const d = linkRes.directData;
                 if (paymentMethod === 'qris' && d.QrTemplate) {
                    toolResult = JSON.stringify({ success: true, message: `Berhasil. Berikan link QRIS ini ke user: ${d.QrTemplate}` });
                 } else if (d.PaymentNo) {
                    toolResult = JSON.stringify({ success: true, message: `Berhasil. Berikan Nomor VA / Kode Pembayaran ini ke user: ${d.PaymentNo} (Bank/Channel: ${d.PaymentName})` });
                 } else {
                    toolResult = JSON.stringify({ success: true, message: `Berhasil dibuat. Info pembayaran: ${JSON.stringify(d)}` });
                 }
              } else {
                toolResult = JSON.stringify({ success: true, message: `Berhasil membuat link checkout. Berikan link ini ke user: ${linkRes.url}` });
              }
            } else {
              toolResult = JSON.stringify({ success: false, error: linkRes.message || "Sistem iPaymu sedang gangguan." });
            }
          }
        }
        else if (toolCall.function.name === "cek_daftar_media") {
          try {
            const listMedia = await db.select().from(media_ai).where(eq(media_ai.tenantId, tenantId));
            if (listMedia.length === 0) {
              toolResult = JSON.stringify({ success: false, message: "Tidak ada media/brosur yang tersimpan di database saat ini." });
            } else {
              const ringkasan = listMedia.map(m => `ID: ${m.id} | Nama File: ${m.namaFile} | Tipe: ${m.tipeMedia} | Instruksi/Konteks: ${m.deskripsi}`).join("\n");
              toolResult = JSON.stringify({ success: true, total: listMedia.length, daftar_media: ringkasan });
            }
          } catch(err: any) {
            toolResult = JSON.stringify({ success: false, error: err.message });
          }
        }
        else if (toolCall.function.name === "kirim_media") {
          const { media_id } = args as any;
          try {
            const mediaData = await db.select().from(media_ai).where(and(eq(media_ai.id, media_id), eq(media_ai.tenantId, tenantId)));
            if (mediaData.length === 0) {
               toolResult = JSON.stringify({ success: false, error: `Media dengan ID ${media_id} tidak ditemukan.` });
            } else {
               const m = mediaData[0];
               // Kita cukup merespon ke AI bahwa kita sedang menyiapkan pengiriman. 
               // Tapi nyatanya, kita inject URL ini ke dalam text atau mengirimkan instruksi terpisah.
               responseMediaUrl = m.urlFile;
               responseMediaType = m.tipeMedia || "image";
               toolResult = JSON.stringify({ success: true, message: `File ${m.namaFile} telah dimasukkan ke antrean pengiriman media.` });
            }
          } catch(err: any) {
            toolResult = JSON.stringify({ success: false, error: err.message });
          }
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolResult
        });
      }

      // 2nd call to get AI's summary of the tool result
      const secondResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiKey}`
        },
        body: JSON.stringify({
          model: getSetting("deepseek_model") || "deepseek-chat",
          messages,
          temperature: 0.3
        })
      });

      const secondData = await secondResponse.json();
      if (secondData.usage && typeof secondData.usage.total_tokens === 'number') {
        await updateUsage(secondData.usage.total_tokens);
      }
      
      return { 
        text: secondData.choices?.[0]?.message?.content || "Selesai memproses data.", 
        broadcasts,
        media_url: responseMediaUrl,
        media_type: responseMediaType
      } as { text: string; broadcasts?: any[]; media_url?: string; media_type?: string };
    }
    
    return { text: responseMessage.content, broadcasts, media_url: responseMediaUrl, media_type: responseMediaType } as { text: string; broadcasts?: any[]; media_url?: string; media_type?: string };
  } catch (error) {
    console.error("[AI] Error calling DeepSeek:", error);
    return { text: "Maaf, terjadi kesalahan saat menghubungi mesin AI." };
  }
}
