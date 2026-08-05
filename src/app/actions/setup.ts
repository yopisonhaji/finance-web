"use server";

import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function saveSetupData(nama: string, noWa: string, email?: string, firebaseUid?: string, tipeBisnis?: string) {
  try {
    // 2. Buat Tenant ID unik untuk akun baru ini (Arsitektur Multi-Tenant)
    const newTenantId = crypto.randomUUID();

    await db.insert(pengaturan).values([
      { tenantId: newTenantId, kunci: "OWNER_NAMA", nilai: nama },
      { tenantId: newTenantId, kunci: "nama_pesantren", nilai: nama },
      { tenantId: newTenantId, kunci: "OWNER_WA", nilai: noWa },
      { tenantId: newTenantId, kunci: "TIPE_BISNIS", nilai: tipeBisnis || "PENDIDIKAN" }
    ]);

    // 3. Simpan User untuk Login
    if (email && firebaseUid) {
      const { users } = await import("@/db/schema");
      
      // Hapus try-catch agar jika error, fungsi me-return error yang sesungguhnya!
      await db.insert(users).values({
        tenantId: newTenantId,
        email: email, // email digunakan sebagai username
        firebaseUid: firebaseUid,
        namaSekolah: nama,
        role: "SUPER_ADMIN"
      });

      // 4. Kirim notifikasi ke Telegram (Opsional, asumsikan bot token disediakan lewat env)
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const text = `🎉 *Registrasi Finance AI*\n\nNama: ${nama}\nWA: ${noWa}\nEmail: ${email}\nLogin: via Google\n\nPendaftaran berhasil.`;
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
    }
    
    // Clear cache agar layout di-render ulang
    revalidatePath("/");
    revalidatePath("/settings");
    
    return { success: true, tenantId: newTenantId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
