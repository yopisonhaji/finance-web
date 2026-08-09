import { NextResponse } from "next/server";
import { db } from "@/db";
import { transaksi, santri } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const reference_id = formData.get("reference_id")?.toString(); // this is our transaksi.id
    const status = formData.get("status")?.toString();
    const status_code = formData.get("status_code")?.toString();
    // const trx_id = formData.get("trx_id")?.toString();
    
    if (!reference_id) {
      return NextResponse.json({ error: "No reference_id provided" }, { status: 400 });
    }

    const transaksiId = parseInt(reference_id, 10);
    if (isNaN(transaksiId)) {
      return NextResponse.json({ error: "Invalid reference_id format" }, { status: 400 });
    }

    const existingTrx = await db.select().from(transaksi).where(eq(transaksi.id, transaksiId));
    if (existingTrx.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const trx = existingTrx[0];

    // If already LUNAS, just return 200 to prevent duplicate processing
    if (trx.status === "LUNAS") {
      return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
    }

    // IPaymu status: berhasil, pending, gagal, expired
    if (status === "berhasil" || status_code === "1") {
      await db.update(transaksi)
        .set({ status: "LUNAS", metode: trx.metode }) // keep original metode
        .where(eq(transaksi.id, transaksiId));

      // Update santri status to LUNAS as well
      if (trx.santriId) {
        const existingSantri = await db.select().from(santri).where(eq(santri.id, trx.santriId));
        if (existingSantri.length > 0) {
          const s = existingSantri[0];
          const newSaldo = (s.saldo || 0) - trx.jumlah;
          await db.update(santri)
            .set({
              saldo: newSaldo,
              status_bulan_ini: newSaldo <= 0 ? "LUNAS" : "CICILAN"
            })
            .where(eq(santri.id, trx.santriId));
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    console.error("IPaymu webhook error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
