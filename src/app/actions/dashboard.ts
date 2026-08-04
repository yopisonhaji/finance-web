"use server";

import { db } from "@/db";
import { santri, transaksi } from "@/db/schema";
import { eq, and, like } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    // 1. Total Santri
    const santriData = await db.select().from(santri);
    const totalSantri = santriData.length;

    // 2. Total Kekurangan (Hanya dihitung dari santri yang BELUM_BAYAR / belum LUNAS)
    let totalKekurangan = 0;
    let lunasCount = 0;
    
    santriData.forEach(s => {
      if (s.status_bulan_ini === 'LUNAS') {
        lunasCount++;
      } else {
        totalKekurangan += (s.nominal_spp || 0);
      }
    });

    // 3. Masuk Hari Ini (Transaksi hari ini)
    const todayStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const txData = await db
      .select()
      .from(transaksi)
      .where(
        and(
          eq(transaksi.status, 'LUNAS'),
          like(transaksi.createdAt, `${todayStr}%`)
        )
      );
      
    let pemasukanHariIni = 0;
    txData.forEach(t => {
      pemasukanHariIni += (t.jumlah || 0);
    });

    // 4. Persentase Pelunasan
    const persentase = totalSantri > 0 ? Math.round((lunasCount / totalSantri) * 100) : 0;

    return {
      success: true,
      data: {
        totalSantri,
        totalKekurangan,
        pemasukanHariIni,
        persentase,
        lunasCount,
        nunggakCount: totalSantri - lunasCount
      }
    };
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, data: { totalSantri: 0, totalKekurangan: 0, pemasukanHariIni: 0, persentase: 0, lunasCount: 0, nunggakCount: 0 } };
  }
}
