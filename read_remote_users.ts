import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL!, 
  authToken: process.env.TURSO_AUTH_TOKEN 
});
async function main() {
  const users = await client.execute("SELECT * FROM users");
  console.log("USERS:", users.rows);
}
main();
