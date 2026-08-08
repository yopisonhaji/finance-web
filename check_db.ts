import { db } from "./src/db";
import { pengaturan } from "./src/db/schema";
import { inArray } from "drizzle-orm";

async function run() {
  console.log("Checking deepseek_key in db...");
  const data = await db.select().from(pengaturan).where(inArray(pengaturan.kunci, ["deepseek_key", "limit_token", "DEEPSEEK_KEY", "TOKEN_LIMIT"]));
  console.log(data);
}
run();
