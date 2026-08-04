import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ownerData = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "OWNER_NAMA"));
    const isOwnerSet = ownerData.length > 0 && !!ownerData[0].nilai;
    
    // Check if user account was deleted via Telegram
    const usersData = await db.select().from(users);
    const hasUsers = usersData.length > 0;

    const isActivated = isOwnerSet && hasUsers;
    return NextResponse.json({ activated: isActivated });
  } catch (err) {
    return NextResponse.json({ activated: false });
  }
}
