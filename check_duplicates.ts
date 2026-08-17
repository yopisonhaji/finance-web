import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function main() {
  const res = await client.execute("SELECT * FROM pengaturan WHERE kunci = 'OWNER_WA'");
  
  const formattedToOriginal: Record<string, any[]> = {};
  
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
    
    if (!formattedToOriginal[formattedWa]) {
      formattedToOriginal[formattedWa] = [];
    }
    formattedToOriginal[formattedWa].push(row);
  }
  
  console.log("Checking for duplicates...");
  let found = false;
  
  for (const [formatted, rows] of Object.entries(formattedToOriginal)) {
    if (rows.length > 1) {
      found = true;
      console.log(`\nFound Duplicate for WA: ${formatted}`);
      for (const r of rows) {
        console.log(`- ID: ${r.id}, Tenant: ${r.tenant_id}, Value in DB: ${r.nilai}`);
      }
    }
  }
  
  if (!found) {
    console.log("No duplicates found.");
  }
}

main().catch(console.error);
