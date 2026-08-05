import { db } from "./src/db";
import { pengaturan } from "./src/db/schema";

async function main() {
  const all = await db.select().from(pengaturan);
  console.log(all.map(a => `${a.tenantId.substring(0, 8)} - ${a.kunci}: ${a.nilai}`));
}
main();
