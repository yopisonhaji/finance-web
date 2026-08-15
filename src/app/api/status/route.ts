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
    
    // Check token limits for guest
    let tokenExhausted = false;
    const settings = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, tenantId));
    const isGuest = settings.find(s => s.kunci === "is_guest")?.nilai === "true";
    if (isGuest) {
      const limit = parseInt(settings.find(s => s.kunci === "limit_token")?.nilai || "0");
      const usage = parseInt(settings.find(s => s.kunci === "usage_token")?.nilai || "0");
      if (limit > 0 && usage >= limit) {
        tokenExhausted = true;
      }
    }

    // Check if user account was deleted via Telegram
    const usersData = await db.select().from(users).where(eq(users.tenantId, tenantId));
    const hasUsers = usersData.length > 0;

    const isActivated = isOwnerSet && hasUsers;
    return NextResponse.json({ activated: isActivated, token_exhausted: tokenExhausted });
  } catch (err) {
    return NextResponse.json({ activated: false });
  }
}
