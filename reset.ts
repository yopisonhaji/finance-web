import { db } from "./src/db";
import { pengaturan, users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    await db.delete(pengaturan).where(eq(pengaturan.kunci, "OWNER_NAMA"));
    await db.delete(users);
    console.log("Successfully reset OWNER_NAMA and users");
  } catch (err) {
    console.error(err);
  }
}

run();
