import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL!, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

async function run() {
  const res = await client.execute("SELECT kunci FROM pengaturan");
  console.log(res.rows.map(r => r.kunci));
}
run();
