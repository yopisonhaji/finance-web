import { db } from "@/db";
import { users, pengaturan } from "@/db/schema";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    const allPengaturan = await db.select().from(pengaturan);
    return NextResponse.json({ 
      success: true, 
      userCount: allUsers.length, 
      pengaturanCount: allPengaturan.length,
      users: allUsers,
      pengaturan: allPengaturan
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
