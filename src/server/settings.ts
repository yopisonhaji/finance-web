"use server";



import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerTenantId } from "./auth";


export async function getSettings() {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) return {};

    const data = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, tenantId));
    const settingsMap: Record<string, string> = {};
    data.forEach(item => {
      settingsMap[item.kunci] = item.nilai;
    });
    return settingsMap;
  } catch (error) {
    console.error("Gagal mengambil pengaturan dari DB:", error);
    return {};
  }
}

export async function saveSettings(data: Record<string, string>) {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) return { success: false, message: "Unauthorized" };

    for (const [kunci, nilai] of Object.entries(data)) {
      // Periksa apakah pengaturan sudah ada
      const existing = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, kunci), eq(pengaturan.tenantId, tenantId)));
      if (existing.length > 0) {
        await db.update(pengaturan)
          .set({ nilai })
          .where(and(eq(pengaturan.kunci, kunci), eq(pengaturan.tenantId, tenantId)));
      } else {
        await db.insert(pengaturan).values({
          tenantId: tenantId,
          kunci,
          nilai
        });
      }
    }
    
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
