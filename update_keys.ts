import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO env vars");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  const newKey = process.env.MASTER_DEEPSEEK_KEY || "sk-1bdd040e90a749b49aed4637c5274001";
  console.log("New key to set:", newKey);

  // 1. Get all tenants
  const res = await client.execute("SELECT DISTINCT tenant_id FROM pengaturan");
  const tenants = res.rows.map(r => r.tenant_id);

  console.log("Found tenants:", tenants);

  for (const tenantId of tenants) {
    // Get usage and limit
    const limitRes = await client.execute({
      sql: "SELECT nilai FROM pengaturan WHERE tenant_id = ? AND kunci = 'limit_token'",
      args: [tenantId]
    });
    const usageRes = await client.execute({
      sql: "SELECT nilai FROM pengaturan WHERE tenant_id = ? AND kunci = 'usage_token'",
      args: [tenantId]
    });

    const limit = limitRes.rows.length > 0 ? parseInt(limitRes.rows[0].nilai as string) || 0 : 0;
    const usage = usageRes.rows.length > 0 ? parseInt(usageRes.rows[0].nilai as string) || 0 : 0;

    console.log(`Tenant ${tenantId} | Limit: ${limit}, Usage: ${usage}`);

    if (limit > usage) {
      console.log(`-> Tenant ${tenantId} has tokens left. Updating key...`);
      await client.execute({
        sql: "UPDATE pengaturan SET nilai = ? WHERE tenant_id = ? AND kunci = 'deepseek_key'",
        args: [newKey, tenantId]
      });
      console.log(`-> Key updated for ${tenantId}.`);
    } else {
      console.log(`-> Tenant ${tenantId} is out of tokens (or 0 limit). Skipping...`);
    }
  }

  console.log("Done");
}

main().catch(console.error);
