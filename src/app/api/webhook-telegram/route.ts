import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8826966282:AAE1RDHPLJHL58GjPZKPg_-LZW2jCqynYuo";

async function sendMessage(chatId: string | number, text: string, botToken: string) {
  try {
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN || "8826966282:AAE1RDHPLJHL58GjPZKPg_-LZW2jCqynYuo";
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (error) {
    console.error("[Webhook Telegram] Gagal mengirim pesan balasan:", error);
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const botToken = searchParams.get("token") || "";

    const body = await req.json();
    
    // Telegram webhook payload structure
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ success: true, reason: "Bukan pesan teks" });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    console.log(`[Webhook Telegram] Pesan dari ${chatId}: ${text}`);

    // Command Parser
    // 1. LOGIN <Nomor WA>
    if (text.toUpperCase().startsWith("LOGIN ")) {
      let phone = text.substring(6).trim().replace(/\D/g, "");
      if (phone.startsWith("0")) phone = "62" + phone.substring(1);

      // Cari tenantId berdasarkan OWNER_WA
      const adminData = await db.select().from(pengaturan).where(
        and(eq(pengaturan.kunci, "OWNER_WA"), eq(pengaturan.nilai, phone))
      );

      if (adminData.length > 0) {
        const tenantId = adminData[0].tenantId;
        
        // Simpan Chat ID ke pengaturan
        const existingChatId = await db.select().from(pengaturan).where(
          and(eq(pengaturan.tenantId, tenantId), eq(pengaturan.kunci, "TELEGRAM_CHAT_ID"))
        );

        if (existingChatId.length > 0) {
          await db.update(pengaturan)
            .set({ nilai: chatId })
            .where(eq(pengaturan.id, existingChatId[0].id));
        } else {
          await db.insert(pengaturan).values({
            tenantId,
            kunci: "TELEGRAM_CHAT_ID",
            nilai: chatId
          });
        }

        await sendMessage(chatId, `✅ Berhasil! Akun Telegram Anda telah ditautkan ke sistem (Tenant: ${tenantId}).\n\nKirimkan perintah berikut untuk injeksi API:\n- 'API WA <URL> <TOKEN>'\n- 'API AI <TOKEN_DEEPSEEK>'`, botToken);
        return NextResponse.json({ success: true });
      } else {
        await sendMessage(chatId, `❌ Gagal! Nomor HP ${phone} tidak ditemukan sebagai pemilik (Owner) di sistem.`, botToken);
        return NextResponse.json({ success: true });
      }
    }

    // 2. Injeksi API WA atau AI
    if (text.toUpperCase().startsWith("API ")) {
      // Pastikan pengguna sudah menautkan akun
      const tenantData = await db.select().from(pengaturan).where(
        and(eq(pengaturan.kunci, "TELEGRAM_CHAT_ID"), eq(pengaturan.nilai, chatId))
      );

      if (tenantData.length === 0) {
        await sendMessage(chatId, `❌ Akun Anda belum tertaut! Kirim perintah:\nLOGIN <Nomor WA Terdaftar>`, botToken);
        return NextResponse.json({ success: true });
      }

      const tenantId = tenantData[0].tenantId;
      const args = text.split(" ");
      const type = args[1]?.toUpperCase();

      if (type === "WA") {
        if (args.length < 4) {
          await sendMessage(chatId, `❌ Format salah! Gunakan:\nAPI WA <URL> <TOKEN>`, botToken);
          return NextResponse.json({ success: true });
        }
        const url = args[2];
        const token = args.slice(3).join(" ");
        
        // Update URL
        const existingUrl = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tenantId), eq(pengaturan.kunci, "wa_bot_url")));
        if (existingUrl.length > 0) await db.update(pengaturan).set({ nilai: url }).where(eq(pengaturan.id, existingUrl[0].id));
        else await db.insert(pengaturan).values({ tenantId, kunci: "wa_bot_url", nilai: url });
        
        // Update Token
        const existingWaToken = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tenantId), eq(pengaturan.kunci, "wa_bot_token")));
        if (existingWaToken.length > 0) await db.update(pengaturan).set({ nilai: token }).where(eq(pengaturan.id, existingWaToken[0].id));
        else await db.insert(pengaturan).values({ tenantId, kunci: "wa_bot_token", nilai: token });

        await sendMessage(chatId, `✅ Berhasil! API Token WhatsApp untuk tenant Anda berhasil disuntikkan.`, botToken);
      } else if (type === "AI") {
        if (args.length < 3) {
          await sendMessage(chatId, `❌ Format salah! Gunakan:\nAPI AI <TOKEN_DEEPSEEK>`, botToken);
          return NextResponse.json({ success: true });
        }
        const aiToken = args[2];

        // Update Token AI
        const existingAi = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tenantId), eq(pengaturan.kunci, "deepseek_key")));
        if (existingAi.length > 0) await db.update(pengaturan).set({ nilai: aiToken }).where(eq(pengaturan.id, existingAi[0].id));
        else await db.insert(pengaturan).values({ tenantId, kunci: "deepseek_key", nilai: aiToken });

        await sendMessage(chatId, `✅ Berhasil! API Token DeepSeek/AI untuk tenant Anda berhasil disuntikkan.`, botToken);
      } else {
        await sendMessage(chatId, `❌ Perintah API tidak dikenali! Gunakan 'API WA' atau 'API AI'.`, botToken);
      }
      return NextResponse.json({ success: true });
    }

    // 3. SUPER ADMIN COMMANDS
    const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1359122786";
    if (chatId === ADMIN_CHAT_ID) {
      const formatPhone = (p: string) => {
        let ph = p.replace(/\D/g, "");
        if (ph.startsWith("0")) ph = "62" + ph.substring(1);
        return ph;
      };

      const getTenant = async (phone: string) => {
        const { or } = await import("drizzle-orm");
        const p1 = phone.trim();
        const p2 = formatPhone(p1);
        let p3 = p2;
        if (p3.startsWith("62")) p3 = "0" + p3.substring(2);

        const data = await db.select().from(pengaturan).where(
          and(
            eq(pengaturan.kunci, "OWNER_WA"),
            or(eq(pengaturan.nilai, p1), eq(pengaturan.nilai, p2), eq(pengaturan.nilai, p3))
          )
        );
        return data.length > 0 ? data[0].tenantId : null;
      };

      const setSetting = async (tId: string, key: string, value: string) => {
        const existing = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, key)));
        if (existing.length > 0) await db.update(pengaturan).set({ nilai: value }).where(eq(pengaturan.id, existing[0].id));
        else await db.insert(pengaturan).values({ tenantId: tId, kunci: key, nilai: value });
        
        try {
          revalidatePath('/', 'layout');
        } catch(e) {
          console.error("Gagal clear cache Next.js", e);
        }
      };

      const getSetting = async (tId: string, key: string) => {
        const data = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, key)));
        return data.length > 0 ? data[0].nilai : null;
      };

      const args = text.split(" ");
      const cmd = args[0].toLowerCase();

      if (cmd === "/status") {
        await sendMessage(chatId, "🟢 *Pusat Komando Aktif*\nSistem Multi-Tenant berjalan normal.", botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/help") {
        const menu = `🤖 *PUSAT KOMANDO OWNER — SEMUA INSTALASI* 🤖\n\nAnda mengontrol semua pembeli software dari sini.\n\n📋 *PERINTAH:*\n/clients — Daftar semua pembeli\n/info <no> — Cek token & status\n/reset <no> — Reset token ke 0\n/release <no> — Hapus nomor (logout WA + hapus)\n/hapus <no> — Sama dengan /release\n/limit <no> <angka> — Ubah limit token\n/hari <no> <hari> — Set masa aktif dari sekarang\n/perpanjang <no> <hari> — Tambah masa aktif\n/api <no> <key> — Set API key\n/model <no> <chat|reasoner> — Ubah model AI\n/status — Cek panel owner\n/help — Tampilkan menu ini\n\n⚠️ *Aturan:* /release = app pembeli langsung logout WA & terhapus.`;
        await sendMessage(chatId, menu, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/clients") {
        const users = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "OWNER_WA"));
        if (users.length === 0) {
          await sendMessage(chatId, "Belum ada tenant yang mendaftar.", botToken);
          return NextResponse.json({ success: true });
        }
        let msg = `📋 *Daftar Pembeli Terdaftar (${users.length}):*\n\n`;
        for (let i = 0; i < users.length; i++) {
          const tId = users[i].tenantId;
          const nama = await getSetting(tId, "OWNER_NAMA") || "Tanpa Nama";
          const aktif = await getSetting(tId, "masa_aktif");
          const limit = await getSetting(tId, "limit_token") || "Unlimited";
          const usage = await getSetting(tId, "usage_token") || "0";
          
          let statusStr = "Aktif";
          if (aktif) {
            if (new Date(aktif) < new Date()) statusStr = "❌ Expired";
            else statusStr = `✅ S/d ${new Date(aktif).toLocaleDateString("id-ID")}`;
          }

          msg += `${i+1}. *${nama}*\nWA: \`${users[i].nilai}\`\nToken: ${usage} / ${limit}\nStatus: ${statusStr}\n\n`;
        }
        await sendMessage(chatId, msg, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/info" && args.length >= 2) {
        const tId = await getTenant(args[1]);
        if (!tId) {
          await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken);
          return NextResponse.json({ success: true });
        }
        const nama = await getSetting(tId, "OWNER_NAMA");
        const usage = await getSetting(tId, "usage_token") || "0";
        const limit = await getSetting(tId, "limit_token") || "Unlimited";
        const aktif = await getSetting(tId, "masa_aktif") || "Selamanya";
        const model = await getSetting(tId, "ai_model") || "deepseek-chat";
        const api = await getSetting(tId, "deepseek_key") ? "Terisi" : "Kosong";

        await sendMessage(chatId, `ℹ️ *INFO PEMBELI*\n\nNama: ${nama}\nWA: ${args[1]}\n\nLimit Token: ${limit}\nTerpakai: ${usage}\nMasa Aktif: ${aktif}\n\nModel AI: ${model}\nAPI Key: ${api}`, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/reset" && args.length >= 2) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }
        await setSetting(tId, "usage_token", "0");
        await sendMessage(chatId, `✅ Pemakaian token untuk ${args[1]} berhasil di-reset ke 0.`, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/limit" && args.length >= 3) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }
        await setSetting(tId, "limit_token", args[2]);
        await sendMessage(chatId, `✅ Limit token untuk ${args[1]} berhasil diubah menjadi ${args[2]}.`, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/hari" && args.length >= 3) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }
        const days = parseInt(args[2]);
        if (isNaN(days)) { await sendMessage(chatId, `❌ Format hari salah.`, botToken); return NextResponse.json({ success: true }); }
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        await setSetting(tId, "masa_aktif", newDate.toISOString());
        await sendMessage(chatId, `✅ Masa aktif ${args[1]} diset menjadi ${days} hari dari sekarang (sampai ${newDate.toLocaleDateString("id-ID")}).`, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/perpanjang" && args.length >= 3) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }
        const days = parseInt(args[2]);
        if (isNaN(days)) { await sendMessage(chatId, `❌ Format hari salah.`, botToken); return NextResponse.json({ success: true }); }
        
        const currentStr = await getSetting(tId, "masa_aktif");
        let baseDate = new Date();
        if (currentStr && new Date(currentStr) > new Date()) {
          baseDate = new Date(currentStr);
        }
        baseDate.setDate(baseDate.getDate() + days);
        await setSetting(tId, "masa_aktif", baseDate.toISOString());
        await sendMessage(chatId, `✅ Masa aktif ${args[1]} diperpanjang +${days} hari (berakhir ${baseDate.toLocaleDateString("id-ID")}).`, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/api" && args.length >= 3) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }
        const apiKey = args[2];
        await setSetting(tId, "deepseek_key", apiKey);
        await sendMessage(chatId, `✅ API Key berhasil dipasang untuk ${args[1]}.`, botToken);
        return NextResponse.json({ success: true });
      }

      if (cmd === "/model" && args.length >= 3) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }
        const model = args[2].toLowerCase();
        if (model !== "chat" && model !== "reasoner") {
          await sendMessage(chatId, `❌ Model harus 'chat' atau 'reasoner'.`, botToken);
          return NextResponse.json({ success: true });
        }
        await setSetting(tId, "ai_model", `deepseek-${model}`);
        await sendMessage(chatId, `✅ Model AI untuk ${args[1]} diubah menjadi deepseek-${model}.`, botToken);
        return NextResponse.json({ success: true });
      }

      if ((cmd === "/release" || cmd === "/hapus") && args.length >= 2) {
        const tId = await getTenant(args[1]);
        if (!tId) { await sendMessage(chatId, `❌ Tenant ${args[1]} tidak ditemukan.`, botToken); return NextResponse.json({ success: true }); }

        // Generate JWT to force logout WA securely
        const jwt = await import("jsonwebtoken");
        const tokenJwt = jwt.sign({ tenant_id: tId, role: "ADMIN" }, process.env.JWT_SECRET_KEY || "super_secret_default_key_change_in_production");
        
        // Call Go Bot Logout (Bypass ngrok warning)
        try {
          const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "http://195.88.211.117:8080";
          await fetch(`${botUrl}/api/wa/logout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${tokenJwt}`, "ngrok-skip-browser-warning": "69420" }
          });
        } catch (err) {
          console.error("Gagal logout WA bot", err);
        }

        // Wipe DB
        await db.delete(pengaturan).where(eq(pengaturan.tenantId, tId));
        const { users: usersTable } = await import("@/db/schema");
        await db.delete(usersTable).where(eq(usersTable.tenantId, tId));

        await sendMessage(chatId, `✅ RELEASE SUKSES!\n\nNomor WA: ${args[1]} telah dilogout dari server dan seluruh profil aplikasinya telah dihapus dari sistem.`, botToken);
        return NextResponse.json({ success: true });
      }
      
      // If none matched but starts with /, show help
      if (text.startsWith("/")) {
        await sendMessage(chatId, `❌ Perintah tidak dikenali. Ketik /help untuk melihat menu.`, botToken);
        return NextResponse.json({ success: true });
      }
    }

    // Default reply
    const adminHelp = chatId === ADMIN_CHAT_ID ? 
      `\n\n👑 *Perintah Super Admin:*\nKetik /help untuk membuka Pusat Komando.` : "";

    if (text.startsWith("/")) {
      await sendMessage(chatId, `❌ Akses ditolak. ID Telegram Anda (${chatId}) tidak dikenali sebagai Pusat Komando.\n\nJika Anda adalah Owner, pastikan ID ini terdaftar di konfigurasi sistem.`, botToken);
    } else {
      await sendMessage(chatId, `Halo! Ini adalah Bot Sistem.\n\nKirim perintah:\n1. 'LOGIN <No WA>' (Tautkan akun)\n2. 'API WA <URL> <TOKEN>' (Suntik API WA)\n3. 'API AI <TOKEN>' (Suntik API AI)${adminHelp}`, botToken);
    }
    
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Webhook Telegram] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
