import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengaturan, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noWa = searchParams.get("nowa");

    if (!noWa) {
      return NextResponse.json({ success: false, error: "Nomor WA tidak diberikan" }, { status: 400 });
    }

    // Ambil nomor WA Owner dari database
    const ownerWaData = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "OWNER_WA"));
    const ownerWa = ownerWaData.length > 0 ? ownerWaData[0].nilai : "";

    // Pastikan nomor yang mau dihapus cocok dengan nomor owner, 
    // jika iya, maka kita hapus seluruh datanya untuk memaksa sistem kembali ke layar pendaftaran putih.
    if (ownerWa && ownerWa === noWa) {
       await db.delete(users);
       await db.delete(pengaturan).where(eq(pengaturan.kunci, "OWNER_WA"));
       await db.delete(pengaturan).where(eq(pengaturan.kunci, "OWNER_NAMA"));
       return NextResponse.json({ success: true, message: "Klien berhasil didepak dari Vercel/Turso. Sistem akan kembali ke layar Setup putih." });
    } else {
       return NextResponse.json({ success: false, message: "Nomor WA tidak cocok dengan Owner, tidak ada yang dihapus." });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
