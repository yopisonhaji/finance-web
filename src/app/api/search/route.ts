import { NextResponse } from "next/server";
import { db } from "@/db";
import { santri } from "@/db/schema";
import { like, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const results = await db
      .select({
        id: santri.id,
        nama: santri.nama,
        nis: santri.nis,
        kelas: santri.kelas,
        saldo: santri.saldo,
      })
      .from(santri)
      .where(
        or(
          like(santri.nama, `%${query}%`),
          like(santri.nis, `%${query}%`)
        )
      )
      .limit(5);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: "Gagal mencari data" }, { status: 500 });
  }
}
