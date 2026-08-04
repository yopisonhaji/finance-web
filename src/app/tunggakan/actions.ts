"use server";



import { db } from "@/db"
import { santri } from "@/db/schema"
import { eq } from "drizzle-orm"


export type SantriTunggakan = typeof santri.$inferSelect

export async function getTunggakan() {
  return await db.select().from(santri).where(eq(santri.status_bulan_ini, 'BELUM_BAYAR')).orderBy(santri.nama)
}

export async function tandaiLunas(santriId: number) {
  try {
    await db.update(santri)
      .set({ status_bulan_ini: 'LUNAS', updatedAt: new Date().toISOString() })
      .where(eq(santri.id, santriId))
    
    
    
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
