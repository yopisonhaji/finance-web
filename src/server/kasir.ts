"use server";



import { db } from "@/db";
import { santri, transaksi } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function processBayarTunai(santriId: number, nominal: number) {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/transaksi/tunai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ santri_id: santriId, nominal })
    });
    
    if (res.ok) {
      return { success: true, message: `Pembayaran tunai Rp ${nominal} berhasil dicatat LUNAS!` };
    }
    
    const errData = await res.json();
    return { success: false, message: errData.error || "Gagal mencatat pembayaran" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
