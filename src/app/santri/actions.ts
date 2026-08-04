"use server";

import { db } from "@/db";
import { santri, transaksi } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerTenantId } from "@/server/auth";

export type Santri = {
  id: number;
  nis: string;
  nama: string;
  kelas: string | null;
  nama_wali: string | null;
  no_wa: string | null;
  saldo: number | null;
  nominal_spp: number | null;
  status_bulan_ini: string | null;
};

export async function getSantri() {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) return [];

    const data = await db.select().from(santri).where(eq(santri.tenantId, tenantId)).orderBy(desc(santri.createdAt));
    return data;
  } catch (error) {
    console.error("Gagal mengambil data santri dari DB:", error);
    return [];
  }
}

export async function addSantri(data: {
  nis: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  no_wa: string;
  nominal_spp?: number;
}) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) throw new Error("Unauthorized");

    await db.insert(santri).values({
      tenantId: tenantId,
      nis: data.nis,
      nama: data.nama,
      kelas: data.kelas,
      nama_wali: data.nama_wali,
      no_wa: data.no_wa,
      nominal_spp: data.nominal_spp || 0,
      saldo: data.nominal_spp || 0,
      status_bulan_ini: "BELUM_BAYAR"
    });
    revalidatePath("/santri");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menambah santri DB" };
  }
}

export async function updateSantri(id: number, data: {
  nis: string;
  nama: string;
  kelas: string;
  nama_wali: string;
  no_wa: string;
  nominal_spp?: number;
}) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) throw new Error("Unauthorized");

    const existing = await db.select().from(santri).where(and(eq(santri.id, id), eq(santri.tenantId, tenantId)));
    if (existing.length === 0) {
      return { success: false, message: "Santri tidak ditemukan" };
    }
    
    // Jika nominal SPP diubah, update juga saldo
    const oldSpp = existing[0].nominal_spp || 0;
    const newSpp = data.nominal_spp || 0;
    const diff = newSpp - oldSpp;
    const newSaldo = (existing[0].saldo || 0) + diff;

    await db.update(santri).set({
      nis: data.nis,
      nama: data.nama,
      kelas: data.kelas,
      nama_wali: data.nama_wali,
      no_wa: data.no_wa,
      nominal_spp: newSpp,
      saldo: newSaldo,
    }).where(and(eq(santri.id, id), eq(santri.tenantId, tenantId)));
    revalidatePath("/santri");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal update santri DB" };
  }
}

export async function deleteSantri(id: number) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) throw new Error("Unauthorized");

    await db.delete(santri).where(and(eq(santri.id, id), eq(santri.tenantId, tenantId)));
    revalidatePath("/santri");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal hapus santri DB" };
  }
}
