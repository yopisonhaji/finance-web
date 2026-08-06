import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL!, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

async function updateKeys() {
  await client.execute("UPDATE pengaturan SET kunci = 'deepseek_key' WHERE kunci = 'deepseek_api_key'");
  console.log("Updated keys.");
}

updateKeys().catch(console.error);
