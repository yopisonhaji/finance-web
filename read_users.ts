import { createClient } from "@libsql/client";
const client = createClient({ url: "file:sqlite.db" });
async function main() {
  const users = await client.execute("SELECT * FROM users");
  console.log(users.rows);
}
main();
