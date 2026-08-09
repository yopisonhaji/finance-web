import { getServerTenantId } from "@/server/auth"
import { db } from "@/db"
import { transaksi, pencairan, pengaturan } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import PencairanClient from "./PencairanClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function PencairanPage() {
  const tenantId = await getServerTenantId()
  if (!tenantId) {
    redirect("/login")
  }

  // Get Settings
  const allSettings = await db.select().from(pengaturan).where(eq(pengaturan.tenantId, tenantId))
  const getSet = (k: string) => allSettings.find(x => x.kunci === k)?.nilai || ""
  
  const bankInfo = {
    bank: getSet("BANK_NAME"),
    noRek: getSet("BANK_ACCOUNT"),
    atasNama: getSet("BANK_ACCOUNT_NAME")
  }

  // Uang Masuk
  const riwayatMasuk = await db.select({
    id: transaksi.id,
    tipe: transaksi.tipe,
    jumlah: transaksi.jumlah,
    biayaAdmin: transaksi.biayaAdmin,
    createdAt: transaksi.createdAt,
    status: transaksi.status
  }).from(transaksi)
  .where(and(eq(transaksi.tenantId, tenantId), eq(transaksi.metode, 'IPAYMU_INSTAN'), eq(transaksi.status, 'LUNAS')))
  .orderBy(desc(transaksi.createdAt))

  const totalMasuk = riwayatMasuk.reduce((acc, curr) => acc + curr.jumlah, 0)

  // Riwayat Pencairan
  const riwayatTarik = await db.select().from(pencairan)
    .where(eq(pencairan.tenantId, tenantId))
    .orderBy(desc(pencairan.createdAt))

  // Menghitung Saldo
  // Yang dikurangi adalah yang PENDING dan PROCESSED. REJECTED kembali ke saldo.
  const totalKeluar = riwayatTarik
    .filter(t => t.status !== 'REJECTED')
    .reduce((acc, curr) => acc + curr.jumlah, 0)

  const saldo = totalMasuk - totalKeluar

  return (
    <PencairanClient 
      saldo={saldo} 
      riwayatMasuk={riwayatMasuk} 
      riwayatTarik={riwayatTarik}
      bankInfo={bankInfo}
    />
  )
}
