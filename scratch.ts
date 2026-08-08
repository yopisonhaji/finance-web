import { db } from "./src/db";
import { pengaturan } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const users = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "OWNER_WA"));
  
  for (const u of users) {
    const namaData = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, u.tenantId));
    const nama = namaData.find(p => p.kunci === "OWNER_NAMA")?.nilai || "Tanpa Nama";
    console.log(`- Nama: ${nama} | WA: ${u.nilai} | Tenant: ${u.tenantId}`);
  }
}

run().catch(console.error);
