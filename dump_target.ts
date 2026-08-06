import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL!, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});

async function run() {
  const res = await client.execute("SELECT nilai FROM pengaturan WHERE kunci = 'ai_target_reply'");
  console.log(res.rows);
}
run();
