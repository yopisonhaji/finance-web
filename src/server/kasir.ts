"use server";

import { db } from "@/db";
import { santri, transaksi } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerTenantId } from "./auth";

export async function processBayarTunai(santriId: number, nominal: number) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) return { success: false, message: "Unauthorized" };

    const existing = await db.select().from(santri).where(and(eq(santri.id, santriId), eq(santri.tenantId, tenantId)));
    
    if (existing.length === 0) {
      return { success: false, message: "Santri tidak ditemukan" };
    }

    const s = existing[0];
    const newSaldo = (s.saldo || 0) - nominal;
    let newStatus = s.status_bulan_ini;

    // Jika saldo <= 0, berarti lunas
    if (newSaldo <= 0) {
      newStatus = "LUNAS";
    } else {
      newStatus = "CICILAN";
    }

    // Catat transaksi
    await db.insert(transaksi).values({
      tenantId: tenantId,
      santriId: santriId,
      tipe: "SPP",
      jumlah: nominal,
      status: "LUNAS",
      metode: "TUNAI"
    });

    // Update saldo santri
    await db.update(santri).set({
      saldo: newSaldo,
      status_bulan_ini: newStatus
    }).where(and(eq(santri.id, santriId), eq(santri.tenantId, tenantId)));

    revalidatePath("/");
    revalidatePath("/santri");
    revalidatePath("/kasir");

    return { success: true, message: `Pembayaran tunai Rp ${nominal.toLocaleString("id-ID")} berhasil dicatat LUNAS!` };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal mencatat pembayaran" };
  }
}
