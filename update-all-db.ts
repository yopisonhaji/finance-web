import { db } from "./src/db/index";
import { pengaturan } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Force updating all deepseek_key in db...");
    const newKey = "sk-852c0f3df80f471b9920d6322b080ff5";
    
    try {
        await db.update(pengaturan)
            .set({ nilai: newKey })
            .where(eq(pengaturan.kunci, "deepseek_key"));
        console.log("Done updating db.");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
main();
