import { db } from "./src/db";
import { pengaturan, users, santri, transaksi } from "./src/db/schema";

async function run() {
  try {
    await db.delete(pengaturan);
    await db.delete(users);
    await db.delete(santri);
    await db.delete(transaksi);
    console.log("Successfully reset ALL database tables");
  } catch (err) {
    console.error(err);
  }
}

run();
