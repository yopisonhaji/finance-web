import { db } from "./src/db";
import { users, pengaturan } from "./src/db/schema";

async function main() {
  const allUsers = await db.select().from(users);
  console.log("Users in DB:");
  console.log(allUsers);
  
  const allPengaturan = await db.select().from(pengaturan);
  console.log("Pengaturan count:", allPengaturan.length);
}
main();
