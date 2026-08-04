import { getSantri } from "./actions"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { AddSantriDialog } from "./AddSantriDialog"
import { db } from "@/db"
import { pengaturan } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function SantriPage() {
  const data = await getSantri()
  const settingsData = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "TIPE_BISNIS"))
  const tipeBisnis = settingsData.length > 0 ? settingsData[0].nilai : ""
  const clientTerm = tipeBisnis === "PERUSAHAAN" ? "Pelanggan" : "Siswa"

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen {clientTerm}</h1>
          <p className="text-muted-foreground mt-2">
            Kelola data dan tagihan {clientTerm.toLowerCase()} Anda
          </p>
        </div>
        <AddSantriDialog />
      </div>
      
      <div className="flex-1 bg-[#0f172a] text-white rounded-xl border border-slate-700 shadow-2xl p-6 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  )
}
