"use server";



import { db } from "@/db";
import { transaksi, santri } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type TransaksiLengkap = typeof transaksi.$inferSelect & {
  santri: typeof santri.$inferSelect | null;
};

export async function getLaporanData() {
  try {
    const rawData = await db
      .select({
        transaksi: transaksi,
        santri: santri,
      })
      .from(transaksi)
      .leftJoin(santri, eq(transaksi.santriId, santri.id))
      .orderBy(desc(transaksi.createdAt));

    return rawData.map((row) => ({
      ...row.transaksi,
      santri: row.santri,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
