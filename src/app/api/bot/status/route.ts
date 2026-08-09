import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { tenant_id, wa_jid } = await req.json();

    if (!tenant_id) {
      return NextResponse.json({ error: "Missing tenant_id" }, { status: 400 });
    }

    const existing = await db.query.pengaturan.findFirst({
      where: and(eq(pengaturan.tenantId, tenant_id), eq(pengaturan.kunci, "WA_JID"))
    });

    if (existing) {
      await db
        .update(pengaturan)
        .set({ nilai: wa_jid })
        .where(eq(pengaturan.id, existing.id));
    } else {
      await db
        .insert(pengaturan)
        .values({
          tenantId: tenant_id,
          kunci: "WA_JID",
          nilai: wa_jid
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
