import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    if (chatId === process.env.TELEGRAM_CHAT_ID) {
      if (text.startsWith("/users")) {
        const users = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "OWNER_WA"));
        if (users.length === 0) {
          await sendMessage(chatId, "Belum ada tenant yang mendaftar.", botToken);
          return NextResponse.json({ success: true });
        }
        
        let msg = `📊 *Total Pendaftar: ${users.length} Tenant*\n\n`;
        for (let i = 0; i < users.length; i++) {
          const tId = users[i].tenantId;
          const namaData = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, "OWNER_NAMA")));
          const nama = namaData.length > 0 ? namaData[0].nilai : "Tanpa Nama";
          msg += `${i+1}. *${nama}* (WA: ${users[i].nilai})\nID: \`${tId}\`\n\n`;
        }
        await sendMessage(chatId, msg, botToken);
        return NextResponse.json({ success: true });
      }

      if (text.startsWith("/delete ")) {
        const waToDelete = text.substring(8).trim();
        const tenantData = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, "OWNER_WA"), eq(pengaturan.nilai, waToDelete)));
        
        if (tenantData.length === 0) {
          await sendMessage(chatId, `❌ Tenant dengan nomor WA ${waToDelete} tidak ditemukan.`, botToken);
          return NextResponse.json({ success: true });
        }

        const tId = tenantData[0].tenantId;
        // Delete all settings for this tenant
        await db.delete(pengaturan).where(eq(pengaturan.tenantId, tId));
        // Delete user login
        const { users: usersTable } = await import("@/db/schema");
        await db.delete(usersTable).where(eq(usersTable.tenantId, tId));

        await sendMessage(chatId, `✅ Berhasil menghapus seluruh data Tenant dengan WA ${waToDelete} dari sistem.`, botToken);
        return NextResponse.json({ success: true });
      }

      if (text.startsWith("/inject ")) {
        const args = text.split(" ");
        if (args.length < 4) {
          await sendMessage(chatId, "❌ Format salah. Gunakan: /inject <NoWA> WA <URL> <TOKEN> ATAU /inject <NoWA> AI <TOKEN>", botToken);
          return NextResponse.json({ success: true });
        }

        const targetWa = args[1];
        const type = args[2].toUpperCase();

        const tenantData = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, "OWNER_WA"), eq(pengaturan.nilai, targetWa)));
        if (tenantData.length === 0) {
          await sendMessage(chatId, `❌ Tenant dengan nomor WA ${targetWa} tidak ditemukan.`, botToken);
          return NextResponse.json({ success: true });
        }

        const tId = tenantData[0].tenantId;

        if (type === "WA") {
          const url = args[3];
          const token = args.slice(4).join(" ");
          
          const existingUrl = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, "wa_bot_url")));
          if (existingUrl.length > 0) await db.update(pengaturan).set({ nilai: url }).where(eq(pengaturan.id, existingUrl[0].id));
          else await db.insert(pengaturan).values({ tenantId: tId, kunci: "wa_bot_url", nilai: url });
          
          const existingWaToken = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, "wa_bot_token")));
          if (existingWaToken.length > 0) await db.update(pengaturan).set({ nilai: token }).where(eq(pengaturan.id, existingWaToken[0].id));
          else await db.insert(pengaturan).values({ tenantId: tId, kunci: "wa_bot_token", nilai: token });

          await sendMessage(chatId, `✅ Injeksi API WA berhasil untuk tenant ${targetWa}.`, botToken);
        } else if (type === "AI") {
          const aiToken = args[3];
          const existingAi = await db.select().from(pengaturan).where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, "deepseek_key")));
          if (existingAi.length > 0) await db.update(pengaturan).set({ nilai: aiToken }).where(eq(pengaturan.id, existingAi[0].id));
          else await db.insert(pengaturan).values({ tenantId: tId, kunci: "deepseek_key", nilai: aiToken });

          await sendMessage(chatId, `✅ Injeksi API AI berhasil untuk tenant ${targetWa}.`, botToken);
        }
        return NextResponse.json({ success: true });
      }
    }

    // Default reply
    const adminHelp = chatId === process.env.TELEGRAM_CHAT_ID ? 
      `\n\n👑 *Perintah Super Admin:*\n- '/users' (Lihat semua pendaftar)\n- '/delete <NoWA>' (Hapus akun tenant)\n- '/inject <NoWA> WA <URL> <TOKEN>'\n- '/inject <NoWA> AI <TOKEN>'` : "";

    await sendMessage(chatId, `Halo! Ini adalah Bot Sistem.\n\nKirim perintah:\n1. 'LOGIN <No WA>' (Tautkan akun)\n2. 'API WA <URL> <TOKEN>' (Suntik API WA ke akun sendiri)\n3. 'API AI <TOKEN>' (Suntik API AI ke akun sendiri)${adminHelp}`, botToken);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[Webhook Telegram] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
