import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "super_secret_default_key_change_in_production";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Device ID required" }, { status: 400 });
    }

    // Check if device already used trial (just in case they try to bypass frontend)
    const { eq, and } = await import("drizzle-orm");
    const existingGuest = await db.select().from(pengaturan).where(
      and(
        eq(pengaturan.kunci, "device_id"),
        eq(pengaturan.nilai, deviceId)
      )
    );

    if (existingGuest.length > 0) {
      return NextResponse.json({ success: false, error: "Device already used trial" }, { status: 403 });
    }

    // Generate Guest Tenant ID
    const newTenantId = "guest-" + crypto.randomUUID();
    const masterDeepseekKey = process.env.MASTER_DEEPSEEK_KEY || "sk-default-dummy-key";
    const aiDefaultPrompt = "Anda adalah asisten virtual resmi yang ramah. Bantu pengguna dengan informasi layanan dan produk.";

    // Insert Default AI Settings for Guest
    await db.insert(pengaturan).values([
      { tenantId: newTenantId, kunci: "OWNER_NAMA", nilai: "Guest User" },
      { tenantId: newTenantId, kunci: "nama_pesantren", nilai: "Guest Demo" },
      { tenantId: newTenantId, kunci: "TIPE_BISNIS", nilai: "UMUM" },
      { tenantId: newTenantId, kunci: "limit_token", nilai: "40000" }, // Modal gratis
      { tenantId: newTenantId, kunci: "usage_token", nilai: "0" },
      { tenantId: newTenantId, kunci: "deepseek_key", nilai: masterDeepseekKey },
      { tenantId: newTenantId, kunci: "ai_prompt", nilai: aiDefaultPrompt },
      { tenantId: newTenantId, kunci: "is_guest", nilai: "true" },
      { tenantId: newTenantId, kunci: "device_id", nilai: deviceId },
    ]);

    // Insert Guest User record
    await db.insert(users).values({
      tenantId: newTenantId,
      email: `guest_${deviceId}@demo.local`,
      firebaseUid: `guest_${deviceId}`,
      namaSekolah: "Guest Demo",
      role: "GUEST"
    });

    const token = jwt.sign(
      { 
        tenant_id: newTenantId,
        email: `guest_${deviceId}@demo.local`,
        role: "GUEST",
        is_guest: true
      },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    const response = NextResponse.json({ success: true, tenantId: newTenantId, token });
    
    // Set HTTP-Only Cookie so middleware recognizes the session
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error("Guest Auth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
