import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json({ success: true, count: allUsers.length, users: allUsers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
