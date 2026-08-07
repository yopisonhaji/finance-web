import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, santri, transaksi, pengaturan } from "@/db/schema";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    // Menghapus isi dari semua tabel penting untuk melakukan Reset Total
    await db.delete(transaksi);
    await db.delete(santri);
    await db.delete(users);
    await db.delete(pengaturan);

    // Jika ini di VPS, hapus juga file sesi WA jika ada agar benar-benar bersih
    try {
      const waAuthPath = path.join(process.cwd(), ".wwebjs_auth");
      if (fs.existsSync(waAuthPath)) {
        fs.rmSync(waAuthPath, { recursive: true, force: true });
      }
      
      const waStatePath = path.join(process.cwd(), "wa-state.json");
      if (fs.existsSync(waStatePath)) {
        fs.writeFileSync(waStatePath, JSON.stringify({ status: "DISCONNECTED", qrcode: null }));
      }
    } catch (e) {
      console.error("Gagal menghapus folder WA:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: "SELURUH DATA (USERS, SANTRI, WA) TELAH BERHASIL DIHAPUS (RESET). Silakan kembali ke halaman utama dan lakukan Registrasi ulang. Arsitektur Multi-Tenant berjalan dengan normal." 
    });
  } catch (error: any) {
    console.error("Gagal mereset database:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
