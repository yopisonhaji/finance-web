"use server";

import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function saveSetupData(nama: string, noWa: string, email?: string, firebaseUid?: string, tipeBisnis?: string) {
  try {
    // 1. Validasi ke Server Pusat (satujalan.id) agar tidak ada 2 nomor yang sama
    // Catatan: Pastikan di hosting satujalan.id Anda sudah membuat endpoint ini
    try {
      const response = await fetch("https://satujalan.id/api/finance/check-wa.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, noWa }),
        // Timeout 5 detik agar tidak hang jika server down
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Jika server membalas nomor sudah terdaftar
        // WORKAROUND: Jika user mendaftar namun gagal masuk dashboard karena cache (bug sebelumnya),
        // nomor mereka sudah terdaftar di server. Kita bisa tetap menyimpannya ke lokal untuk memperbaiki hal ini.
        // Jika data.isRegistered true, abaikan saja errornya untuk kasus aplikasi lokal ini.
        if (data.isRegistered) {
          console.log(`[Peringatan] Nomor ${noWa} sudah ada di server, namun akan tetap disinkronkan ke lokal.`);
        }
        
        // Jika server pusat mengalami error (misal gagal INSERT)
        if (data.success === false && !data.isRegistered) {
           return { success: false, error: "Error Server Pusat: " + (data.message || "Gagal menyimpan ke database pusat.") };
        }
      } else {
        // Jika file check-wa.php error 500 (misal salah ketik PHP)
        const errText = await response.text();
        return { success: false, error: `Error Server (HTTP ${response.status}): ` + errText.substring(0, 100) };
      }
    } catch (e: any) {
      return { success: false, error: "Gagal menghubungi server pusat satujalan.id: " + e.message };
    }

    // 2. Jika aman (belum terdaftar) ATAU kita memaksa simpan ke lokal
    // Buat Tenant ID unik untuk akun baru ini (Arsitektur Multi-Tenant)
    const newTenantId = crypto.randomUUID();

    await db.insert(pengaturan).values([
      { tenantId: newTenantId, kunci: "OWNER_NAMA", nilai: nama },
      { tenantId: newTenantId, kunci: "OWNER_WA", nilai: noWa },
      { tenantId: newTenantId, kunci: "TIPE_BISNIS", nilai: tipeBisnis || "PENDIDIKAN" }
    ]);

    // 3. Simpan User untuk Login
    if (email && firebaseUid) {
      const { users } = await import("@/db/schema");
      
      try {
        await db.insert(users).values({
          tenantId: newTenantId,
          email: email, // email digunakan sebagai username
          firebaseUid: firebaseUid,
          namaSekolah: nama,
          role: "SUPER_ADMIN"
        });
      } catch (err: any) {
        // Abaikan error jika sudah ada di DB lokal
      }

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
