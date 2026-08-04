import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerTenantId } from "@/server/auth";

export async function GET() {
  try {
    const tenantId = await getServerTenantId();
    if (!tenantId) {
      return NextResponse.json({ activated: false });
    }

    const ownerData = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, "OWNER_NAMA"), eq(pengaturan.tenantId, tenantId)));
    const isOwnerSet = ownerData.length > 0 && !!ownerData[0].nilai;
    
    // Check if user account was deleted via Telegram
    const usersData = await db.select().from(users).where(eq(users.tenantId, tenantId));
    const hasUsers = usersData.length > 0;

    const isActivated = isOwnerSet && hasUsers;
    return NextResponse.json({ activated: isActivated });
  } catch (err) {
    return NextResponse.json({ activated: false });
  }
}
