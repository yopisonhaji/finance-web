"use server";



import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function getSettings() {
  try {
    const data = await db.select().from(pengaturan);
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
    for (const [kunci, nilai] of Object.entries(data)) {
      // Periksa apakah pengaturan sudah ada
      const existing = await db.select().from(pengaturan).where(eq(pengaturan.kunci, kunci));
      if (existing.length > 0) {
        await db.update(pengaturan)
          .set({ nilai })
          .where(eq(pengaturan.kunci, kunci));
      } else {
        await db.insert(pengaturan).values({
          tenantId: "tenant-1",
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
