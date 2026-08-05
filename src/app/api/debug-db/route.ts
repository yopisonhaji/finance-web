import { db } from "@/db";
import { users, pengaturan } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    const allSettings = await db.select().from(pengaturan);
    return NextResponse.json({
      users: allUsers,
      settingsCount: allSettings.length,
      envUrl: process.env.TURSO_DATABASE_URL ? "SET" : "NOT_SET"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
