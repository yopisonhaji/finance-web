"use server";

import { db } from "@/db";
import { santri } from "@/db/schema";
import { getServerTenantId } from "@/server/auth";

export async function importSantriBatch(data: any[]) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: "Data kosong" };
    }

    // Format data to match DB schema
    const formattedData = data.map((item) => ({
      tenantId: tenantId,
      nis: String(item.NIS || item.nis || ""),
      nama: String(item.Nama || item.nama || ""),
      kelas: String(item.Kelas || item.kelas || ""),
      nama_wali: String(item["Nama Wali"] || item.nama_wali || ""),
      no_wa: String(item["No WA"] || item.no_wa || ""),
      nominal_spp: parseInt(String(item["Nominal SPP"] || item.nominal_spp || "0").replace(/\D/g, "")) || 0,
      saldo: 0,
      status_bulan_ini: "BELUM_BAYAR",
    })).filter(item => item.nis && item.nama); // minimal NIS dan Nama ada

    if (formattedData.length === 0) {
      return { success: false, error: "Tidak ada baris data valid (NIS dan Nama wajib)" };
    }

    await db.insert(santri).values(formattedData);

    return { success: true, count: formattedData.length };
  } catch (error: any) {
    console.error("[importSantriBatch] Error:", error);
    return { success: false, error: error.message };
  }
}
