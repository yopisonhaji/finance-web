import { NextResponse } from "next/server"
import { db } from "@/db"
import { pencairan, pengaturan, transaksi } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getServerTenantId } from "@/server/auth"

export async function POST(req: Request) {
  try {
    const tenantId = await getServerTenantId()
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await req.json()
    if (!amount || amount < 50000) {
      return NextResponse.json({ error: "Minimal pencairan adalah Rp 50.000" }, { status: 400 })
    }

    // Hitung saldo
    const riwayatMasuk = await db.select({ jumlah: transaksi.jumlah }).from(transaksi)
      .where(and(eq(transaksi.tenantId, tenantId), eq(transaksi.metode, 'IPAYMU_INSTAN'), eq(transaksi.status, 'LUNAS')))
    const totalMasuk = riwayatMasuk.reduce((acc, curr) => acc + curr.jumlah, 0)

    const riwayatTarik = await db.select({ jumlah: pencairan.jumlah, status: pencairan.status }).from(pencairan)
      .where(eq(pencairan.tenantId, tenantId))
    const totalKeluar = riwayatTarik
      .filter(t => t.status !== 'REJECTED')
      .reduce((acc, curr) => acc + curr.jumlah, 0)

    const saldo = totalMasuk - totalKeluar

    if (amount > saldo) {
      return NextResponse.json({ error: "Saldo tidak mencukupi" }, { status: 400 })
    }

    // Ambil info bank dari pengaturan
    const allSettings = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, tenantId))
    const bank = allSettings.find(x => x.kunci === "BANK_NAME")?.nilai
    const noRek = allSettings.find(x => x.kunci === "BANK_ACCOUNT")?.nilai
    const atasNama = allSettings.find(x => x.kunci === "BANK_ACCOUNT_NAME")?.nilai

    if (!bank || !noRek || !atasNama) {
      return NextResponse.json({ error: "Silakan atur rekening bank Anda di Pengaturan." }, { status: 400 })
    }

    // Insert request pencairan
    await db.insert(pencairan).values({
      tenantId,
      bank,
      noRekening: noRek,
      atasNama,
      jumlah: amount,
      status: "PENDING"
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
