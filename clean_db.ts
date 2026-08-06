import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL!, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

async function clearDB() {
  console.log("Cleaning database...");
  await client.execute("DELETE FROM users");
  await client.execute("DELETE FROM pengaturan");
  await client.execute("DELETE FROM santri");
  await client.execute("DELETE FROM transaksi");
  console.log("Database cleaned successfully.");
}

clearDB().catch(console.error);
