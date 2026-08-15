import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, santri, transaksi, pengaturan, media_ai } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

export async function GET(req: Request) {
  // Check authorization header or a secret key in query for security (if needed)
  // For Vercel Cron, you usually check headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Find all GUEST users created more than 24 hours ago
    const { and } = await import("drizzle-orm");
    const expiredGuests = await db.select().from(users).where(
      and(
        eq(users.role, "GUEST"),
        lt(users.createdAt, twentyFourHoursAgo)
      )
    );

    if (expiredGuests.length === 0) {
      return NextResponse.json({ success: true, message: "No expired guests to cleanup" });
    }

    const tenantIdsToDelete = expiredGuests.map(u => u.tenantId);

    // 2. Delete all related data for these tenants
    let deletedCount = 0;
    
    for (const tenantId of tenantIdsToDelete) {
      if (!tenantId.startsWith("guest-")) continue; // Safety check

      // Note: Because of foreign key constraints (santriId in transaksi), 
      // we delete child records first (transaksi), then parents (santri).
      
      // Delete transaksi
      await db.delete(transaksi).where(eq(transaksi.tenantId, tenantId));
      
      // Delete santri
      await db.delete(santri).where(eq(santri.tenantId, tenantId));
      
      // Delete media
      await db.delete(media_ai).where(eq(media_ai.tenantId, tenantId));
      
      // Delete pengaturan
      await db.delete(pengaturan).where(eq(pengaturan.tenantId, tenantId));
      
      // Finally, delete the user
      await db.delete(users).where(eq(users.tenantId, tenantId));
      
      deletedCount++;
      
      // Also silently disconnect WA bot if still running
      const botUrl = process.env.NEXT_PUBLIC_BOT_URL || "http://195.88.211.117:8080";
      // We don't have the token, but we can pass a master admin secret or just hit a force-logout endpoint 
      // if we implement one, but since the tenant is deleted, the bot will naturally fail to query DB next time.
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} expired guest accounts`,
      deletedTenants: tenantIdsToDelete
    });

  } catch (error: any) {
    console.error("Cron Cleanup Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
