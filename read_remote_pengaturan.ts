import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL!, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});
async function main() {
  const rs = await client.execute("SELECT tenant_id, kunci, nilai FROM pengaturan WHERE kunci = 'OWNER_NAMA'");
  console.log("TENANTS:", rs.rows);
}
main();
