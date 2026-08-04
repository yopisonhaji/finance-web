import { db } from "./src/db";
import { pengaturan, users } from "./src/db/schema";

async function run() {
  const allPengaturan = await db.select().from(pengaturan);
  console.log("Pengaturan:", allPengaturan);
  const allUsers = await db.select().from(users);
  console.log("Users:", allUsers);
}

run();
