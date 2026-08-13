import { getSantri } from "./actions"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { SantriMobileList } from "./SantriMobileList"
import { Suspense } from "react"
import { SkeletonTable } from '@/components/ui/skeleton-cards'
import { AddSantriDialog } from "./AddSantriDialog"
import { ImportExcelDialog } from "./ImportExcelDialog"
import { db } from "@/db"
import { pengaturan } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function SantriPage() {
  const data = await getSantri()
  const settingsData = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "TIPE_BISNIS"))
  const tipeBisnis = settingsData.length > 0 ? settingsData[0].nilai : ""
  const clientTerm = tipeBisnis === "PERUSAHAAN" ? "Klien" : "Siswa"

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manajemen {clientTerm}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Kelola data dan tagihan {clientTerm.toLowerCase()} Anda
          </p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <ImportExcelDialog />
          <AddSantriDialog />
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block flex-1 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl p-4 sm:p-6 overflow-hidden">
        <Suspense fallback={<SkeletonTable />}>
          <DataTable columns={columns} data={data} />
        </Suspense>
      </div>

      {/* Mobile Card List View */}
      <Suspense fallback={<SkeletonTable />}>
        <SantriMobileList data={data} />
      </Suspense>
    </div>
  )
}




