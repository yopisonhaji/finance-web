"use server";

import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "super_secret_default_key_change_in_production";

export async function saveSetupData(nama: string, noWa: string, email?: string, firebaseUid?: string, tipeBisnis?: string) {
  try {
    const { eq, and, inArray } = await import("drizzle-orm");

    // 1. Format nomor WA agar seragam (Hanya angka, diawali 62)
    let formattedWa = noWa.replace(/\D/g, "");
    if (formattedWa.startsWith("0")) {
      formattedWa = "62" + formattedWa.substring(1);
    } else if (!formattedWa.startsWith("62")) {
      // Jika tidak diawali 0 atau 62 (misal langsung 812), tambahkan 62
      if (formattedWa.startsWith("8")) {
        formattedWa = "62" + formattedWa;
      }
    }

    // 2. Cek apakah nomor WA sudah digunakan
    const existingWa = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, "OWNER_WA"), eq(pengaturan.nilai, formattedWa)));
    if (existingWa.length > 0) {
      return { success: false, error: "Nomor WhatsApp ini sudah terdaftar. Silakan gunakan nomor lain." };
    }

    // Cek apakah user sedang dalam sesi Guest
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token")?.value;
    let guestTenantId = null;
    
    if (tokenCookie) {
      try {
        const decoded = jwt.verify(tokenCookie, JWT_SECRET) as any;
        if (decoded.is_guest && decoded.tenant_id) {
          guestTenantId = decoded.tenant_id;
        }
      } catch (e) {
        console.error("Invalid token cookie during setup", e);
      }
    }

    const tenantIdToUse = guestTenantId || crypto.randomUUID();

    if (guestTenantId) {
      // Mode Konversi Guest ke Akun Resmi
      const { users } = await import("@/db/schema");
      
      // Update data user
      await db.update(users)
        .set({ email: email, firebaseUid: firebaseUid, role: "SUPER_ADMIN", namaSekolah: nama })
        .where(eq(users.tenantId, guestTenantId));
        
      // Update pengaturan
      await db.update(pengaturan)
        .set({ nilai: nama })
        .where(and(eq(pengaturan.tenantId, guestTenantId), inArray(pengaturan.kunci, ["OWNER_NAMA", "nama_pesantren"])));
        
      await db.update(pengaturan)
        .set({ nilai: formattedWa })
        .where(and(eq(pengaturan.tenantId, guestTenantId), eq(pengaturan.kunci, "OWNER_WA")));
        
      await db.update(pengaturan)
        .set({ nilai: "false" })
        .where(and(eq(pengaturan.tenantId, guestTenantId), eq(pengaturan.kunci, "is_guest")));

    } else {
      // 2. Buat Tenant ID baru (Mode Standar)
      const masterDeepseekKey = process.env.MASTER_DEEPSEEK_KEY || "sk-default-dummy-key"; // Ganti di env server
      const aiDefaultPrompt = "Anda adalah asisten virtual resmi yang ramah. Bantu pengguna dengan informasi layanan dan tagihan yang tersedia.";

      await db.insert(pengaturan).values([
        { tenantId: tenantIdToUse, kunci: "OWNER_NAMA", nilai: nama },
        { tenantId: tenantIdToUse, kunci: "nama_pesantren", nilai: nama },
        { tenantId: tenantIdToUse, kunci: "OWNER_WA", nilai: formattedWa },
        { tenantId: tenantIdToUse, kunci: "TIPE_BISNIS", nilai: tipeBisnis || "PENDIDIKAN" },
        { tenantId: tenantIdToUse, kunci: "limit_token", nilai: "40000" },
        { tenantId: tenantIdToUse, kunci: "usage_token", nilai: "0" },
        { tenantId: tenantIdToUse, kunci: "deepseek_key", nilai: masterDeepseekKey },
        { tenantId: tenantIdToUse, kunci: "ai_prompt", nilai: aiDefaultPrompt }
      ]);

      // 3. Simpan User untuk Login
      if (email && firebaseUid) {
        const { users } = await import("@/db/schema");
        
        // Cek apakah email sudah ada di Turso
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
          return { success: false, error: "Akun dengan email ini sudah terdaftar. Silakan login dari halaman depan." };
        }

        await db.insert(users).values({
          tenantId: tenantIdToUse,
          email: email, // email digunakan sebagai username
          firebaseUid: firebaseUid,
          namaSekolah: nama,
          role: "SUPER_ADMIN"
        });
      }
    }

      // 4. Kirim notifikasi ke Telegram
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8826966282:AAE1RDHPLJHL58GjPZKPg_-LZW2jCqynYuo";
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1359122786";
      
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const text = `🎉 *Registrasi Finance AI*\n\nNama: ${nama}\nWA: ${formattedWa}\nEmail: ${email}\nLogin: via Google\n\nPendaftaran berhasil.`;
        try {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: text,
              parse_mode: "Markdown"
            }),
            signal: AbortSignal.timeout(3000)
          });
        } catch (err) {
          console.error("Gagal kirim ke telegram", err);
        }
      }
    // End of if(email && firebaseUid) if we want to keep it inside, but it's fine outside since email is checked above.

    // Clear cache agar layout di-render ulang
    revalidatePath("/");
    revalidatePath("/settings");
    
    const token = jwt.sign(
      { 
        tenant_id: tenantIdToUse,
        email: email,
        role: "ADMIN"
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    return { success: true, tenantId: tenantIdToUse, token };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
