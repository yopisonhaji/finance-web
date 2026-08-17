import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function main() {
  console.log("Normalizing all OWNER_WA in database...");

  const res = await client.execute("SELECT id, tenant_id, nilai FROM pengaturan WHERE kunci = 'OWNER_WA'");

  for (const row of res.rows) {
    const rawVal = row.nilai as string;
    let formattedWa = rawVal.replace(/\D/g, "");
    if (formattedWa.startsWith("0")) {
      formattedWa = "62" + formattedWa.substring(1);
    } else if (!formattedWa.startsWith("62")) {
      if (formattedWa.startsWith("8")) {
        formattedWa = "62" + formattedWa;
      }
    }

    if (rawVal !== formattedWa) {
      console.log(`Updating ID ${row.id} from ${rawVal} to ${formattedWa}`);
      await client.execute({
        sql: "UPDATE pengaturan SET nilai = ? WHERE id = ?",
        args: [formattedWa, row.id]
      });
    }
  }

  // Also, delete the duplicate tenant we found: e2a8f98c-6bf3-44df-a69b-a2b34d30f9cc
  const duplicateTenant = "e2a8f98c-6bf3-44df-a69b-a2b34d30f9cc";
  console.log(`Deleting duplicate tenant ${duplicateTenant}`);
  
  await client.execute({
    sql: "DELETE FROM pengaturan WHERE tenant_id = ?",
    args: [duplicateTenant]
  });
  
  await client.execute({
    sql: "DELETE FROM users WHERE tenant_id = ?",
    args: [duplicateTenant]
  });

  console.log("Done.");
}

main().catch(console.error);
