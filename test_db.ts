import { db } from "./src/db/index";
import { pengaturan } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const data = await db.select().from(pengaturan);
  console.log("Pengaturan Data:", data);
}

check();
