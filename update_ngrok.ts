import { db } from "./src/db";
import { pengaturan } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const ngrokUrl = "https://caulocarpous-nonsubtractively-jackelyn.ngrok-free.dev/api/wa/send";
  await db.update(pengaturan)
    .set({ nilai: ngrokUrl })
    .where(eq(pengaturan.kunci, "wa_bot_url"));
  console.log("wa_bot_url updated to", ngrokUrl);
}
main();
