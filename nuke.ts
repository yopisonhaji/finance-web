import { db } from "./src/db/index";
import { users, pengaturan } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  await db.delete(users).where(eq(users.tenantId, "f58c711c-afdb-40e7-8354-8afea491a7c4"));
  await db.delete(pengaturan).where(eq(pengaturan.tenantId, "f58c711c-afdb-40e7-8354-8afea491a7c4"));
  console.log("WIPED ALL DATA FOR TENANT f58c711c-afdb-40e7-8354-8afea491a7c4");
}
run();
