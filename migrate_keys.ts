import { db } from "./src/db";
import { pengaturan } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const mapping = {
    "TOKEN_USAGE": "usage_token",
    "TOKEN_LIMIT": "limit_token",
    "MASA_AKTIF": "masa_aktif",
    "AI_MODEL": "ai_model",
    "DEEPSEEK_KEY": "deepseek_key"
  };
  
  for (const [oldKey, newKey] of Object.entries(mapping)) {
    try {
      const existing = await db.select().from(pengaturan).where(eq(pengaturan.kunci, oldKey));
      for (const e of existing) {
        // check if new key already exists
        const newExists = await db.select().from(pengaturan).where(eq(pengaturan.kunci, newKey)).where(eq(pengaturan.tenantId, e.tenantId));
        if (newExists.length > 0) {
           await db.delete(pengaturan).where(eq(pengaturan.id, e.id));
        } else {
           await db.update(pengaturan).set({ kunci: newKey }).where(eq(pengaturan.id, e.id));
        }
      }
      console.log(`Migrated ${oldKey} to ${newKey}`);
    } catch (err) {
      console.error(err);
    }
  }
}
run();
