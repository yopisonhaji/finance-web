import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noWa = searchParams.get("nowa");

    if (!noWa) {
      return NextResponse.json({ success: false, error: "Nomor WA tidak diberikan" }, { status: 400 });
    }

    // Ambil nomor WA Owner dari database untuk mencari tenantId
    const ownerWaData = await db.select().from(pengaturan).where(and(eq(pengaturan.kunci, "OWNER_WA"), eq(pengaturan.nilai, noWa)));
    
    if (ownerWaData.length > 0) {
       const tenantId = ownerWaData[0].tenantId;
       // Hapus seluruh data users dan pengaturan HANYA untuk tenant tersebut
       await db.delete(users).where(eq(users.tenantId, tenantId));
       await db.delete(pengaturan).where(eq(pengaturan.tenantId, tenantId));
       
       return NextResponse.json({ success: true, message: `Klien dengan nomor ${noWa} berhasil dihapus konfigurasinya dari sistem. Data santri tetap aman.` });
    } else {
       return NextResponse.json({ success: false, message: "Nomor WA tidak cocok dengan Owner manapun, tidak ada yang dihapus." });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
