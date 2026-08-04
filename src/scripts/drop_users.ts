import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.run(sql`DROP TABLE users`);
    console.log("Users table dropped.");
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
