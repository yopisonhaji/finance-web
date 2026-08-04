"use server";



import { db } from "@/db"
import { santri } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerTenantId } from "@/server/auth"


export type SantriTunggakan = typeof santri.$inferSelect

export async function getTunggakan() {
  const tenantId = await getServerTenantId();
  if (!tenantId) return [];

  return await db.select().from(santri).where(and(eq(santri.status_bulan_ini, 'BELUM_BAYAR'), eq(santri.tenantId, tenantId))).orderBy(santri.nama)
}

export async function tandaiLunas(santriId: number) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) throw new Error("Unauthorized");

    await db.update(santri)
      .set({ status_bulan_ini: 'LUNAS', updatedAt: new Date().toISOString() })
      .where(and(eq(santri.id, santriId), eq(santri.tenantId, tenantId)))
    
    
    
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
