import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allSettings = await db
      .select()
      .from(pengaturan)
      .where(
        inArray(pengaturan.kunci, ["WA_JID", "PROXY_URL"])
      );

    const tenantsMap = new Map<string, any>();

    for (const row of allSettings) {
      if (!tenantsMap.has(row.tenantId)) {
        tenantsMap.set(row.tenantId, { tenant_id: row.tenantId, wa_jid: "", proxy_url: "" });
      }
      const tenant = tenantsMap.get(row.tenantId);
      if (row.kunci === "WA_JID") tenant.wa_jid = row.nilai;
      if (row.kunci === "PROXY_URL") tenant.proxy_url = row.nilai;
    }

    return NextResponse.json({ tenants: Array.from(tenantsMap.values()) });
  } catch (error: any) {
    console.error("Failed to fetch tenants:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

