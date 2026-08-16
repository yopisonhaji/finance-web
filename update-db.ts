import { db } from "./src/db/index";
import { pengaturan } from "./src/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    console.log("Updating deepseek_key in db...");
    const oldKey = "sk-b1f41ab1e2634d0bbaef6eeb24cd7561";
    const newKey = "sk-852c0f3df80f471b9920d6322b080ff5";
    
    try {
        const result = await db.update(pengaturan)
            .set({ nilai: newKey })
            .where(and(eq(pengaturan.kunci, "deepseek_key"), eq(pengaturan.nilai, oldKey)));
        console.log("Done updating db.");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
main();
